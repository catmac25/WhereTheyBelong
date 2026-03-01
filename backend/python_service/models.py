from sqlmodel import SQLModel, Field
from sqlalchemy import Column, LargeBinary
from typing import Optional
from datetime import datetime
import uuid

def gen_uuid() -> str:
    return str(uuid.uuid4())

class RegisteredCases(SQLModel, table=True):
    __tablename__ = "registeredcases"  # ✅ use exact name as in pgAdmin
    id: Optional[str] = Field(default_factory=gen_uuid, primary_key=True)
    name: Optional[str] = None
    age: Optional[int] = None
    status: str = "NF"
    last_seen: Optional[datetime] = None
    matched_with: Optional[str] = None
    submitted_by: Optional[str] = None
    face_mesh: Optional[str] = None
    complainant_mobile: Optional[str] = None
    birth_marks: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # New explicit DB fields for physical attributes and extra details
    height: Optional[float] = None
    weight: Optional[float] = None
    built: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    adhaar_card: Optional[str] = None
    complainant_name: Optional[str] = None
    fathers_name: Optional[str] = None
    # Legacy JSON blob (kept for backward compatibility)
    extra_info: Optional[str] = None

class PublicSubmissions(SQLModel, table=True):
    __tablename__ = "publicsubmissions"  # ✅ matches your actual table
    id: Optional[str] = Field(default_factory=gen_uuid, primary_key=True)
    face_mesh: Optional[str] = None
    status: str = "NF"
    location: Optional[str] = None
    mobile: Optional[str] = None
    birth_marks: Optional[str] = None
    submitted_on: datetime = Field(default_factory=datetime.utcnow)
    submitted_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User (SQLModel , table=True):
    __tablename__= "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: Optional[str] = Field(default=None, index=True)
    name: str
    email: str = Field(unique=True, index=True)
    occupation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification (SQLModel, table=True):
    __tablename__= "notifications"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    google_id: str = Field(foreign_key="users.google_id")  
    title: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)

class CaseImage(SQLModel , table = True):
    __tablename__ = "images"
    key: int = Field(default=None, primary_key=True)
    caseid: uuid.UUID = Field(index=True)
    image_path: str = Field(default=None)
    mime_type: str = Field(default="image/jpeg")


class PrivateCaseRegistration(SQLModel, table=True):
    """
    Separate model for no-image / private case registration (primarily women).
    Relies on descriptive attributes instead of face mesh for matching.
    """
    __tablename__ = "privatecaseregistrations"
    id: Optional[str] = Field(default_factory=gen_uuid, primary_key=True)
    name: Optional[str] = None
    fathers_name: Optional[str] = None
    age: Optional[int] = None
    status: str = "NF"
    submitted_by: Optional[str] = None
    complainant_name: Optional[str] = None
    complainant_mobile: Optional[str] = None
    adhaar_card: Optional[str] = None
    birth_marks: Optional[str] = None
    last_seen: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    matched_with: Optional[str] = None
    # Physical attributes
    height: Optional[float] = None
    weight: Optional[float] = None
    built: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    # Descriptive fields (no image flow)
    tattoos: Optional[str] = None          # design + body part
    piercings: Optional[str] = None
    dental: Optional[str] = None          # braces, missing tooth, etc.
    spectacles: Optional[str] = None      # Yes/No/Sometimes
    hair_type: Optional[str] = None       # curly/straight/wavy
    hair_length: Optional[str] = None
    blood_group: Optional[str] = None     # optional