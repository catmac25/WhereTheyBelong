from sqlmodel import Session, select
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from db import get_engine
from sqlalchemy import func
from models import RegisteredCases, PublicSubmissions, User, CaseImage, PrivateCaseRegistration
import json
import os
import pandas as pd
import uuid

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
engine = get_engine()

def save_case_image(caseid: uuid.UUID, upload_file: UploadFile) -> CaseImage:
    ext = upload_file.filename.split(".")[-1]
    filename = f"{caseid}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Save file to disk
    with open(file_path, "wb") as f:
        upload_file.file.seek(0)
        f.write(upload_file.file.read())

    # Save relative path to DB
    case_image = CaseImage(
        caseid=caseid,
        image_path=f"uploads/{filename}",  # <-- relative path
        mime_type=upload_file.content_type
    )

    with Session(engine) as session:
        session.add(case_image)
        session.commit()
        session.refresh(case_image)
    
    return case_image
def register_new_case(case_dict):
    case = RegisteredCases(**case_dict)
    with Session(engine) as session:
        session.add(case)
        session.commit()
        session.refresh(case)
        return case


def register_private_case(case_dict):
    """Register a no-image / private case into the dedicated PrivateCaseRegistration table."""
    case = PrivateCaseRegistration(**case_dict)
    with Session(engine) as session:
        session.add(case)
        session.commit()
        session.refresh(case)
        return case
def get_registered_cases_by_user(email: str, status: str = "All"):
    # Map status filter
    if status == "All":
        status_list = ["F", "NF"]
    elif status == "Found":
        status_list = ["F"]
    elif status == "Not Found":
        status_list = ["NF"]
    else:
        status_list = [status]

    with Session(engine) as session:
        stmt = (
            select(
                RegisteredCases.id,
                RegisteredCases.name,
                RegisteredCases.age,
                RegisteredCases.status,
                RegisteredCases.last_seen,
                RegisteredCases.matched_with,
                RegisteredCases.birth_marks,
                RegisteredCases.created_at,
                RegisteredCases.height,
                RegisteredCases.weight,
                RegisteredCases.built,
                RegisteredCases.district,
                RegisteredCases.state,
            )
            .where(RegisteredCases.status.in_(status_list))
            .where(RegisteredCases.submitted_by == email)     # 🔥 filter by user email
        )

        results = session.exec(stmt).all()
        return [dict(row._mapping) for row in results]
    
def fetch_registered_cases(status: str = "All"):
    if status == "All":
        status_list = ["F", "NF"]
    elif status == "Found":
        status_list = ["F"]
    elif status == "Not Found":
        status_list = ["NF"]
    else:
        status_list = [status]

    with Session(engine) as session:
        stmt = (
            select(
                RegisteredCases.id,
                RegisteredCases.name,
                RegisteredCases.age,
                RegisteredCases.status,
                RegisteredCases.last_seen,
                RegisteredCases.matched_with,
                RegisteredCases.height,
                RegisteredCases.weight,
                RegisteredCases.built,
                RegisteredCases.district,
                RegisteredCases.state,
            )
            .where(RegisteredCases.status.in_(status_list))
        )
        results = session.exec(stmt).all()
        # Convert to list of dicts
        return [dict(row._mapping) for row in results]

def fetch_public_cases(train_data: bool, status: str = None):
    with Session(engine) as session:
        if train_data:
            stmt = select(PublicSubmissions.id, PublicSubmissions.face_mesh).where(PublicSubmissions.status == status)
            return session.exec(stmt).all()
        stmt = select(
            PublicSubmissions.id,
            PublicSubmissions.status,
            PublicSubmissions.location,
            PublicSubmissions.mobile,
            PublicSubmissions.birth_marks,
            PublicSubmissions.submitted_on,
            PublicSubmissions.submitted_by,
        )
        return session.exec(stmt).all()

def get_training_data():
    with Session(engine) as session:
        stmt = select(RegisteredCases.id, RegisteredCases.face_mesh).where(
            RegisteredCases.status == "NF"
        )
        result = session.exec(stmt).all()
    if not result:
        return pd.Series(dtype=str), pd.DataFrame()  # return empty labels, features

    # Convert to DataFrame
    df = pd.DataFrame(result, columns=["label", "face_mesh"])

    # `face_mesh` is JSON, flatten it
    df["face_mesh"] = df["face_mesh"].apply(lambda x: json.loads(x))
    features_df = pd.DataFrame(df.pop("face_mesh").values.tolist(), index=df.index).rename(
        columns=lambda x: f"fm_{x+1}"
    )

    return df["label"], features_df

def new_public_case(public_case_dict):
    case = PublicSubmissions(**public_case_dict)
    with Session(engine) as session:
        session.add(case)
        session.commit()
        session.refresh(case)
        return case

def get_public_case_detail(case_id: str):
    with Session(engine) as session:
        stmt = select(
            PublicSubmissions.id,
            PublicSubmissions.location,
            PublicSubmissions.submitted_by,
            PublicSubmissions.mobile,
            PublicSubmissions.birth_marks,
        ).where(PublicSubmissions.id == case_id)

        result = session.exec(stmt).first()

        if not result:
            return None  # or raise HTTPException(status_code=404)

        # result is usually a tuple, convert it to dict
        return {
            "id": result[0],
            "location": result[1],
            "submitted_by": result[2],
            "mobile": result[3],
            "birth_marks": result[4]
        }


def get_registered_case_detail(case_id: str):
    with Session(engine) as session:
        stmt = select(
            RegisteredCases.name,
            RegisteredCases.age,
            RegisteredCases.last_seen,
            RegisteredCases.birth_marks,
            RegisteredCases.created_at,
            RegisteredCases.status,
            RegisteredCases.height,
            RegisteredCases.weight,
            RegisteredCases.built,
            RegisteredCases.district,
            RegisteredCases.state,
            RegisteredCases.address,
            RegisteredCases.adhaar_card,
            RegisteredCases.complainant_name,
            RegisteredCases.fathers_name,
            RegisteredCases.extra_info,
        ).where(RegisteredCases.id == case_id)
        result = session.exec(stmt).first()
        if result:
            (
                name,
                age,
                last_seen,
                birth_marks,
                created_at,
                status,
                height,
                weight,
                built,
                district,
                state,
                address,
                adhaar_card,
                complainant_name,
                fathers_name,
                extra_info,
            ) = result

            # Safely parse extra_info JSON for legacy/older rows
            extra = {}
            if extra_info:
                try:
                    extra = json.loads(extra_info)
                except (TypeError, json.JSONDecodeError):
                    extra = {}

            # Prefer real columns; fall back to extra_info if needed
            return {
                "name": name,
                "age": age,
                "last_seen": last_seen,
                "birth_marks": birth_marks,
                "created_at": created_at,
                "status": status,
                "height": height if height is not None else extra.get("height"),
                "weight": weight if weight is not None else extra.get("weight"),
                "built": built if built is not None else extra.get("built"),
                "district": district if district is not None else extra.get("district"),
                "state": state if state is not None else extra.get("state"),
                "address": address if address is not None else extra.get("address"),
                "adhaar_card": adhaar_card if adhaar_card is not None else extra.get("adhaar_card"),
                "complainant_name": complainant_name if complainant_name is not None else extra.get("complainant_name"),
                "fathers_name": fathers_name if fathers_name is not None else extra.get("fathers_name"),
            }
        return None

def get_case_image_path(caseid: uuid.UUID):
    with Session(engine) as session:
        stmt = select(CaseImage).where(CaseImage.caseid == caseid)
        result = session.exec(stmt).first()
        if not result:
            return None
        return {"image_path": f"/{result.image_path}"}
    
def list_public_cases():
    with Session(engine) as session:
        return session.exec(select(PublicSubmissions)).all()
def get_user_details (email:str):
    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()
        return user

def update_found_status(register_case_id: str, public_case_id: str):
    with Session(engine) as session:
        reg = session.get(RegisteredCases, register_case_id)
        pub = session.get(PublicSubmissions, public_case_id)
        if not reg or not pub:
            return None
        reg.status = "F"
        reg.matched_with = public_case_id
        pub.status = "F"
        session.add(reg)
        session.add(pub)
        session.commit()
        session.refresh(reg)
        session.refresh(pub)
        return {"registered": reg, "public": pub}

def get_registered_cases_count(submitted_by: str, status: str):
    with Session(engine) as session:
        stmt = select(RegisteredCases).where(
            RegisteredCases.submitted_by == submitted_by,
            RegisteredCases.status == status
        )
        return len(session.exec(stmt).all())
def get_user_count():
    with Session(engine) as session:
        count = session.exec(select(func.count(User.id))).one()
        return {"count": count}
# theek karo idhar
def get_registered_cases_counter():
    with Session(engine) as session:
        count = session.exec(select(func.count(RegisteredCases.id))).one()
        return {"count": count}

def get_public_sighting_count():
    with Session(engine) as session:
        count = session.exec(select(func.count(PublicSubmissions.id))).one()
        return {"count": count}

def get_matched_cases():
    with Session(engine) as session:
        count = session.exec(
            select(func.count(RegisteredCases.id)).where(RegisteredCases.status == "F")
        ).one()
        return {"count": count}