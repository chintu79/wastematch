from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from .models import AccountStatus, OrgType, VerificationStatus, FacilityStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    identity_provider_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: UUID
    account_status: AccountStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    name: str
    address: Optional[Dict[str, Any]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    jurisdiction: Optional[str] = None
    industrial_estate: Optional[str] = None

class FacilityCreate(FacilityBase):
    organization_id: UUID

class FacilityResponse(FacilityBase):
    id: UUID
    organization_id: UUID
    facility_status: FacilityStatus

    class Config:
        from_attributes = True

class OrganizationBase(BaseModel):
    legal_name: str
    organization_type: OrgType
    registered_address: Optional[Dict[str, Any]] = None
    contact_details: Optional[Dict[str, Any]] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: UUID
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    facilities: List[FacilityResponse] = []

    class Config:
        from_attributes = True
