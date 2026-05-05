import os
import pickle
import json
import traceback
import warnings
from typing import Optional
from collections import defaultdict
import pandas as pd
import numpy as np
warnings.filterwarnings(action="ignore")
from models import RegisteredCases
from db import engine
from crud import fetch_public_cases, fetch_registered_cases

def get_public_cases_data(status="NF"):
    try:
        result = fetch_public_cases(train_data=True, status=status)
        if not result:
            return pd.DataFrame()
        d1 = pd.DataFrame(result, columns=["label", "face_mesh"])
        d1["face_mesh"] = d1["face_mesh"].apply(lambda x: json.loads(x) if x else None)
        d1 = d1[d1["face_mesh"].notna() & d1["face_mesh"].apply(lambda x: x is not None and len(x) >= 1404)]
        if len(d1) == 0:
            return pd.DataFrame()
        d2 = pd.DataFrame(d1.pop("face_mesh").values.tolist(), index=d1.index).rename(
            columns=lambda x: "fm_{}".format(x + 1)
        )
        df = d1.join(d2)
        for col in df.columns:
            if col != "label":
                df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    except Exception as e:
        traceback.print_exc()
        return None


def get_registered_cases_data(status="NF"):
    try:
        import pandas as pd
        import json
        from sqlmodel import Session, select

        with Session(engine) as session:
            result = session.exec(
                select(
                    RegisteredCases.id,
                    RegisteredCases.face_mesh,
                    RegisteredCases.status,
                )
            ).all()
            d1 = pd.DataFrame(result, columns=["label", "face_mesh", "status"])
            if status:
                d1 = d1[d1["status"] == status]
            d1["face_mesh"] = d1["face_mesh"].apply(lambda x: json.loads(x) if x else None)
            d1 = d1[d1["face_mesh"].notna() & d1["face_mesh"].apply(lambda x: x is not None and len(x) >= 1404)]
            if len(d1) == 0:
                return pd.DataFrame()
            d2 = pd.DataFrame(
                d1.pop("face_mesh").values.tolist(), index=d1.index
            ).rename(columns=lambda x: "fm_{}".format(x + 1))
            df = d1.join(d2)
            # Ensure all columns except label and status are float
            for col in df.columns:
                if col not in ["label", "status"]:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
            return df
    except Exception as e:
        traceback.print_exc()
        return None


from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder


def match(distance_threshold=50):
    matched_images = defaultdict(list)
    public_cases_df = get_public_cases_data()
    registered_cases_df = get_registered_cases_data()

    if public_cases_df is None or registered_cases_df is None:
        return {"status": False, "message": "Couldn't connect to database"}
    if len(public_cases_df) == 0 or len(registered_cases_df) == 0:
        return {"status": False, "message": "No public or registered cases found"}

    # Store original labels before encoding
    original_reg_labels = registered_cases_df.iloc[:, 0].tolist()
    original_pub_labels = public_cases_df.iloc[:, 0].tolist()

    # Prepare training data - use index positions as labels for the classifier
    reg_features = registered_cases_df.iloc[:, 2:].values.astype(float)
    valid_mask = ~np.isnan(reg_features).any(axis=1)
    reg_features = reg_features[valid_mask]

# Also remove the corresponding labels to keep alignment
    original_reg_labels = np.array(original_reg_labels)[valid_mask].tolist()

# Recreate numeric labels after filtering
    numeric_labels = list(range(len(reg_features)))

# If nothing left after filtering → return error
    if len(reg_features) == 0:
        return {"status": False, "message": "No valid registered case vectors found (all contained NaN)."}
    # Create simple numeric labels for KNN (0, 1, 2, ...)
    numeric_labels = list(range(len(reg_features)))

    # Train KNN classifier with numeric labels
    knn = KNeighborsClassifier(n_neighbors=1, algorithm="ball_tree", weights="distance")
    knn.fit(reg_features, numeric_labels)

    # For each public submission, find the closest registered case
    for _, row in public_cases_df.iterrows():
        # First column is always the public case ID label
        pub_label = row.iloc[0]
        face_encoding = np.array(row[1:]).astype(float)
# Skip public sample if it contains NaN
        if np.isnan(face_encoding).any():
            print(f"Skipping public case {pub_label} — contains NaN")
            continue

        try:
            # Get distances to nearest neighbors
            closest_distances = knn.kneighbors([face_encoding])[0][0]
            closest_distance = np.min(closest_distances)
            # print(f"Distance for case {pub_label}: {closest_distance}")
            # Align dimensions: truncate public to match registered (handles 468 vs 478 landmarks)
            n_reg = reg_features.shape[1]
            n_pub = len(face_encoding)
            if n_pub < n_reg:
                print(f"Skipping public case {pub_label} — too few landmarks: pub={n_pub}, reg={n_reg}")
                continue
            face_encoding = np.array(face_encoding[:n_reg], dtype=float)

            closest_distances = knn.kneighbors([face_encoding])[0][0]
            closest_distance = np.min(closest_distances)

            # Check if distance meets threshold criteria
            if closest_distance <= distance_threshold:  # Lower distance = better match
                # Get the index of the predicted registered case
                predicted_idx = knn.predict([face_encoding])[0]
                # Get the original UUID of the registered case
                reg_label = str(original_reg_labels[predicted_idx]) 
                # Store the match
                matched_images[reg_label].append(pub_label)
        except Exception as e:
            print(f"Error processing public case {pub_label}: {str(e)}")
            continue

    return {"status": True, "result": matched_images}


if __name__ == "__main__":
    result = match()
    print(result)


def passes_private_public_gender_filter(
    private_gender: Optional[str], public_gender: Optional[str]
) -> bool:
    """
    Strict pre-filter before attribute scoring:
    - Private "Male" / "Female" → only same gender on the public sighting.
    - Private "Prefer not to say" or unset → no gender gate (all sightings allowed).
    - Legacy sightings with missing gender → excluded when private is Male/Female.
    """
    p = (private_gender or "").strip()
    if not p or p == "Prefer not to say":
        return True
    if p not in ("Male", "Female"):
        return True
    s = (public_gender or "").strip()
    if not s:
        return False
    return p == s


def match_private_features(private_case_id: str):
    """
    Match a private (no-photo) case to public sightings.

    Public sightings MUST:
    1. Have an uploaded image stored in `images` (CaseImage) — matching is image-based.
    2. Have at least one vision-derived attribute on the public row (skintone / spectacles /
       hair_color from image analysis). Rows with only text fields and no image analysis are skipped.
    """
    from sqlmodel import Session, select
    from models import PublicSubmissions
    from crud import get_private_case_detail, get_case_image_path
    import uuid as uuid_mod

    priv_case = get_private_case_detail(private_case_id)
    if not priv_case:
        return {"status": False, "message": "Private case not found"}

    def _resolve_pub_image_and_gate(pub_row):
        """Returns image_path dict from CaseImage, or None if ineligible for private matching."""
        try:
            pid = uuid_mod.UUID(str(pub_row.id))
        except ValueError:
            return None
        img_data = get_case_image_path(pid)
        if not img_data or not (img_data.get("image_path") or "").strip():
            # No upload row — cannot match without a public photo
            return None
        # Require at least one field populated from image analysis (not district/text-only rows)
        st = (pub_row.skintone or "").strip()
        sp = (pub_row.spectacles or "").strip()
        hc = (pub_row.hair_color or "").strip()
        if not (st or sp or hc):
            return None
        return img_data

    matches = []
    with Session(engine) as session:
        stmt = select(PublicSubmissions).where(PublicSubmissions.status == "NF")
        pub_cases = session.exec(stmt).all()

        for pub in pub_cases:
            img_data = _resolve_pub_image_and_gate(pub)
            if not img_data:
                continue

            priv_g = priv_case.get("gender")
            pub_g = getattr(pub, "gender", None)
            if not passes_private_public_gender_filter(priv_g, pub_g):
                continue

            img_path = img_data["image_path"]
            score = 0

            if priv_case.get("spectacles") and pub.spectacles:
                if priv_case["spectacles"].lower() == pub.spectacles.lower():
                    score += 1

            ht = (priv_case.get("hair_type") or "").lower()
            hc = (pub.hair_color or "").lower()
            if ht and hc and (ht in hc or hc in ht or any(w in hc for w in ht.split() if len(w) > 2)):
                score += 1

            if priv_case.get("district") and pub.location:
                d = (priv_case.get("district") or "").lower()
                loc = (pub.location or "").lower()
                if d and (d in loc or loc in d):
                    score += 1

            if score <= 0:
                continue

            matches.append({
                "public_id": pub.id,
                "image_path": img_path,
                "score": score,
                "features": {
                    "gender": pub_g,
                    "skintone": pub.skintone,
                    "spectacles": pub.spectacles,
                    "hair_color": pub.hair_color
                }
            })
                
    # Sort matches by highest score
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    public_ids = [str(m["public_id"]) for m in matches]
    return {
        "status": True,
        "matched": len(matches) > 0,
        "matches": matches,
        "registeredId": private_case_id,
        "publicIds": public_ids,
        "message": "Matched based on physical attributes" if matches else "No matches found",
    }