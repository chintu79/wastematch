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

from .models import CategoryStatus, ListingStatus, BatchStatus, DataType, MeasurementVerificationStatus

class MaterialCategoryBase(BaseModel):
    code: str
    name: str
    parent_category_id: Optional[UUID] = None
    description: Optional[str] = None
    category_status: CategoryStatus = CategoryStatus.ACTIVE

class MaterialCategoryCreate(MaterialCategoryBase):
    pass

class MaterialCategoryResponse(MaterialCategoryBase):
    id: UUID

    class Config:
        from_attributes = True

class MaterialListingBase(BaseModel):
    material_description: str
    source_process: str
    available_quantity: float
    quantity_unit: str
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None
    location_visibility: Optional[str] = None

class MaterialListingCreate(MaterialListingBase):
    producer_organization_id: UUID
    source_facility_id: UUID
    material_category_id: UUID

class MaterialListingResponse(MaterialListingBase):
    id: UUID
    producer_organization_id: UUID
    source_facility_id: UUID
    material_category_id: UUID
    listing_status: ListingStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaterialBatchBase(BaseModel):
    batch_reference: str
    quantity: float
    quantity_unit: str
    generated_at: Optional[datetime] = None
    sampled_at: Optional[datetime] = None

class MaterialBatchCreate(MaterialBatchBase):
    listing_id: UUID

class MaterialBatchResponse(MaterialBatchBase):
    id: UUID
    listing_id: UUID
    batch_status: BatchStatus
    created_at: datetime

    class Config:
        from_attributes = True

class PropertyDefinitionBase(BaseModel):
    code: str
    name: str
    data_type: DataType
    canonical_unit: Optional[str] = None
    measurement_basis_options: Optional[Dict[str, Any]] = None
    validation_schema: Optional[Dict[str, Any]] = None
    active: int = 1

class PropertyDefinitionCreate(PropertyDefinitionBase):
    pass

class PropertyDefinitionResponse(PropertyDefinitionBase):
    id: UUID
    definition_version: int

    class Config:
        from_attributes = True

class BatchMeasurementBase(BaseModel):
    numeric_value: Optional[float] = None
    text_value: Optional[str] = None
    unit: str
    measurement_basis: Optional[str] = None
    measurement_method: Optional[str] = None
    sample_reference: Optional[str] = None
    measured_at: Optional[datetime] = None

class BatchMeasurementCreate(BatchMeasurementBase):
    batch_id: UUID
    property_definition_id: UUID
    reported_by_organization_id: Optional[UUID] = None
    evidence_document_id: Optional[UUID] = None

class BatchMeasurementResponse(BatchMeasurementBase):
    id: UUID
    batch_id: UUID
    property_definition_id: UUID
    reported_by_organization_id: Optional[UUID] = None
    evidence_document_id: Optional[UUID] = None
    verification_status: MeasurementVerificationStatus
    created_at: datetime

    class Config:
        from_attributes = True
