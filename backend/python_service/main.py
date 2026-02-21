from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Body
from typing import Dict, Any
from sqlmodel import Session
from sqlmodel import select
from models import User
from models import Notification
from datetime import datetime
from matchalgo import match
import shutil
import uuid
import numpy as np                    
from PIL import Image
import os
import json
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from dotenv import load_dotenv
import requests
# uvicorn main:app --reload --port 8000  to run the server
load_dotenv()
from utils import image_obj_to_numpy, extract_face_mesh_landmarks
JWT_SECRET = os.getenv("JWT_SECRET")
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("JWT_SECRET repr:", repr(JWT_SECRET))
from db import get_engine
from crud import (
    register_new_case, fetch_registered_cases, fetch_public_cases, get_training_data, new_public_case,
    get_public_case_detail, get_registered_case_detail, list_public_cases,
    update_found_status, get_registered_cases_count, get_registered_cases_by_user,
    get_public_sighting_count, get_matched_cases, get_user_count, get_user_details,get_registered_cases_counter, save_case_image,get_case_image_path
)
from models import RegisteredCases
DATABASE_URL = os.getenv("DATABASE_URL")
engine = get_engine()
app = FastAPI(title="Missing Persons - Python Service (FastAPI + SQLModel)")
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if not origins:
    origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or "*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# print("🔐 FASTAPI JWT SECRET =", JWT_SECRET)
# print("🔐 FASTAPI ENV FILE LOADED =", os.getenv("JWT_SECRET"))
# print("🔐 FASTAPI MODE =", os.getcwd())
# @app.get("/api/geocode")
# def geocode(q: str = Query(...)):
#     url = "https://nominatim.openstreetmap.org/search"
#     params = {"format": "json", "q": q}
#     headers = {"User-Agent": "MyApp/1.0 (contact@example.com)"} 

#     try:
#         resp = requests.get(url, params=params, headers=headers, timeout=5)
#         resp.raise_for_status()  
#         data = resp.json()
#         if not data:
#             raise HTTPException(status_code=404, detail="Location not found")
#         return data
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(status_code=502, detail=f"Geocoding request failed: {e}")
#     except ValueError:
#         raise HTTPException(status_code=502, detail="Invalid response from geocoding service")
@app.get("/api/geocode")
def geocode(q: str = Query(...)):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"format": "json", "q": q}
    headers = {"User-Agent": "MyApp/1.0 (contact@example.com)"}

    try:
        resp = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=5
        )
        resp.raise_for_status()
        data = resp.json()

        if not data:
            raise HTTPException(status_code=404, detail="Location not found")

        return data

    except requests.exceptions.Timeout:
        # *** this means external API did not respond in 5 seconds ***
        raise HTTPException(status_code=504, detail="Geocoding service timed out")

    except requests.exceptions.RequestException as e:
        # network issues / DNS / connection refused / etc
        raise HTTPException(status_code=502, detail=f"Geocoding request failed: {e}")

    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid JSON response from geocoding")

@app.get("/images/{case_id}")
async def get_image(case_id: str):
    import uuid
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID")

    row = get_case_image_path(case_uuid)
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")

    return row
def verify_jwt(authorization: str = Header(None)):
    print("Received header:", authorization)
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        scheme, token = authorization.split()
        print("Verifying token:", token)
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print("Decoded token:", decoded)
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print("Invalid token error:", e)
    raise HTTPException(status_code=401, detail="Invalid token")
@app.post("/register")
async def register_case(
    name: str = Form(...),
    fathers_name: str = Form(None),
    age: int = Form(...),
    address: str = Form(None),
    adhaar_card: str = Form(None),
    description: str = Form(None),
    complainant_name: str = Form(None),
    mobile_number: str = Form(None),
    birthmarks: str = Form(None),
    last_seen: str = Form(None),
    height: float = Form(None),
    weight: float = Form(None),
    built:str  = Form(None),
    district: str = Form(None),
    state: str = Form(None),
    image: UploadFile = File(...),
    user=Depends(verify_jwt)
):
    # Extract face mesh
    image_np = np.array(Image.open(image.file))
    landmarks = extract_face_mesh_landmarks(image_np)

    case_dict = {
    "name": name,
    "age": age,
    "birth_marks": birthmarks,
    "complainant_mobile": mobile_number,
    "submitted_by": user["email"],
    "last_seen": last_seen,
    "face_mesh": json.dumps(landmarks),
    "extra_info": json.dumps({
        "fathers_name": fathers_name,
        "address": address,
        "adhaar_card": adhaar_card,
        "height": height,
        "weight": weight,
        "built": built,
        
        "complainant_name": complainant_name
    })
    }

    saved_case = register_new_case(case_dict)
    image.file.seek(0)
    save_case_image(saved_case.id, image)
    return {"status": "success", "case_id": saved_case.id}

@app.get("/user-by-email")
def get_user_profile_by_email(email: str = Query(...)):
    user = get_user_details(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/registered")
def api_fetch_registered(status: str = Query("All")):
    return fetch_registered_cases(status=status)

@app.get('/publiccases')
def api_list_public():
    return list_public_cases()

@app.post("/publicsubmission")
async def public_submission(
    name: str = Form(...),
    mobile_number: str = Form(None),
    email: str = Form(None),
    address: str = Form(None),
    birth_marks: str = Form(None),
    image: UploadFile = File(...),
):
    image_np = np.array(Image.open(image.file))
    landmarks = extract_face_mesh_landmarks(image_np)
    case_dict = {
        "face_mesh": json.dumps(landmarks),
        "status": "NF",
        "location": address,
        "mobile": mobile_number,
        "birth_marks": birth_marks,
        "submitted_on": datetime.utcnow(),
        "submitted_by": email,
        "created_at": datetime.utcnow()
    }
    saved_case = new_public_case(case_dict)
    image.file.seek(0)
    save_case_image(saved_case.id, image)
    return {"status": "success", "case_id": saved_case.id}

@app.post("/match")
def api_match(payload: Dict[str, Any] = Body(...)):
    registered_id = payload.get("registeredId")
    ml_result = match()
    matched: Dict[str, list] = {}
    if isinstance(ml_result, dict) and "result" in ml_result:
        matched = ml_result["result"]
    elif isinstance(ml_result, list):
        for item in ml_result:
            rid = str(item.get("registeredId"))
            pids = item.get("publicIds") or []
            matched[rid] = pids
            
    if not registered_id:
        return {
            "status": False,
            "matched": False,
            "message": "registeredId is required",
        }

    registered_id = str(registered_id)

    # Case 1 — This registered case has matched public images
    pub_ids = matched.get(registered_id, [])
    if pub_ids:
        return {
            "status": True,
            "matched": True,
            "message": "Match found and status updated", 
            "publicIds": pub_ids,  
            "registeredId": registered_id,
        }

    # Case 2 — No matches for THIS registered case
    return {
        "status": True,
        "matched": False,
        "message": "No match found for this case",
        "registeredId": registered_id,
    }
@app.post("/matcha")
def api_match_all():
    ml_result = match() 
    matched = ml_result.get("result", {}) if isinstance(ml_result, dict) else {}

    if matched:
        matched_cases = [
            {"registeredId": reg_id, "publicIds": pub_ids}
            for reg_id, pub_ids in matched.items() if pub_ids
        ]

        if matched_cases:
            return {
                "status": True,
                "matched": True,
                "message": "Matches found for some registered cases",
                "matches": matched_cases
            }
        
    return {
        "status": True,
        "matched": False,
        "message": "No matches found for any registered case",
        "matches": []
    }

@app.get("/registered/{case_id}")
def api_registered_detail(case_id: str):
    return get_registered_case_detail(case_id)

@app.get("/registered-cases/{email}")
def api_not_confirmed_registered_cases(email: str):
    return get_registered_cases_by_user(email)

@app.get("/public/{case_id}")
def api_public_detail(case_id: str):
    return get_public_case_detail(case_id)


@app.get("/training-data")
def api_training(submitted_by: str = Query(...)):
    return get_training_data(submitted_by)

@app.get('/usercount')
def api_user_count():
    return get_user_count()
@app.get('/registercounter')
def api_register_counter():
    return {
        "count": get_registered_cases_counter()
    }

@app.get("/registercount")
def api_register_count(
    submitted_by: str ,
    status: str ,
):
    return {
        "count": get_registered_cases_count(submitted_by, status)
    }


@app.get('/publiccount')
def api_public_count():
    return get_public_sighting_count()
@app.get('/matchedcount')
def api_matched_count():
    return get_matched_cases()
@app.post("/api/users/google-login")
def google_login(user: dict):
    """
    Handles login/signup via Google OAuth.
    If user already exists in Postgres -> returns existing.
    Else creates a new user entry.
    """
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == user["email"])).first()
        if existing:
            return existing

        new_user = User(
            name=user.get("name"),
            email=user.get("email"),
            google_id=user.get("google_id")
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user

import requests
from models import Notification

@app.post("/notify")
def send_notification(
    title: str = Form(...),
    message: str = Form(...),
    user=Depends(verify_jwt)
):
    user_identifier = user.get("email") or user.get("google_id")
    if not user_identifier:
        raise HTTPException(status_code=400, detail="User identity missing in token")
    with Session(engine) as session:
        notif = Notification(
            user_email=user_identifier,
            title=title,
            message=message,
            created_at=datetime.utcnow()
        )
        session.add(notif)
        session.commit()
        session.refresh(notif)

        try:
            requests.post(
                "http://localhost:4000/send-notification",
                json={
                    "email": user_identifier,
                    "title": title,
                    "message": message
                }
            )
        except:
            print("Realtime server offline")

        return {"status": "ok", "notif_id": notif.id}
