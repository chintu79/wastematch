import uuid
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

def generate_uuid():
    return str(uuid.uuid4())

class AccountStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class OrgType(enum.Enum):
    PRODUCER = "PRODUCER"
    BUYER = "BUYER"
    RECYCLER = "RECYCLER"

class VerificationStatus(enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class FacilityStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    identity_provider_id = Column(String, unique=True, index=True, nullable=True)
    account_status = Column(Enum(AccountStatus), default=AccountStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    legal_name = Column(String, nullable=False)
    organization_type = Column(Enum(OrgType), nullable=False)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    registered_address = Column(JSON, nullable=True)
    contact_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facilities = relationship("Facility", back_populates="organization")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    address = Column(JSON, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    jurisdiction = Column(String, nullable=True)
    industrial_estate = Column(String, nullable=True)
    facility_status = Column(Enum(FacilityStatus), default=FacilityStatus.ACTIVE)

    organization = relationship("Organization", back_populates="facilities")
