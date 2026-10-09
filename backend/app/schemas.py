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

from .models import JurisdictionLevel, RuleReviewStatus, EligibilityStatus, EvaluationReviewStatus

class RegulatoryRuleBase(BaseModel):
    rule_code: str
    title: str
    legal_instrument: str
    legal_clause_reference: str
    jurisdiction_level: JurisdictionLevel
    applicability_definition: Dict[str, Any]
    required_conditions: Dict[str, Any]
    effective_from: datetime
    effective_until: Optional[datetime] = None
    source_reference: Optional[str] = None

class RegulatoryRuleCreate(RegulatoryRuleBase):
    pass

class RegulatoryRuleResponse(RegulatoryRuleBase):
    id: UUID
    review_status: RuleReviewStatus
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    rule_version: int

    class Config:
        from_attributes = True

class RegulatoryEvaluationBase(BaseModel):
    candidate_id: UUID
    rule_set_version: str
    decision_reasons: Optional[Dict[str, Any]] = None
    evidence_references: Optional[Dict[str, Any]] = None
    unresolved_conditions: Optional[Dict[str, Any]] = None

class RegulatoryEvaluationCreate(RegulatoryEvaluationBase):
    pass

class RegulatoryEvaluationResponse(RegulatoryEvaluationBase):
    id: UUID
    eligibility_status: EligibilityStatus
    evaluated_at: datetime
    reviewer_id: Optional[UUID] = None
    review_status: EvaluationReviewStatus

    class Config:
        from_attributes = True

from .models import SpecificationStatus, ConstraintType, MissingDataPolicy

class BuyerSpecificationBase(BaseModel):
    intended_use: str
    minimum_quantity: Optional[float] = None
    maximum_quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    effective_from: datetime
    effective_until: Optional[datetime] = None

class BuyerSpecificationCreate(BuyerSpecificationBase):
    buyer_organization_id: UUID
    receiving_facility_id: UUID
    target_category_id: UUID

class BuyerSpecificationResponse(BuyerSpecificationBase):
    id: UUID
    buyer_organization_id: UUID
    receiving_facility_id: UUID
    target_category_id: UUID
    specification_version: int
    specification_status: SpecificationStatus
    created_at: datetime

    class Config:
        from_attributes = True

class SpecificationConstraintBase(BaseModel):
    constraint_type: ConstraintType
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    unit: str
    required_evidence: bool = True
    missing_data_policy: MissingDataPolicy
    tolerance_policy: Optional[Dict[str, Any]] = None

class SpecificationConstraintCreate(SpecificationConstraintBase):
    specification_id: UUID
    property_definition_id: UUID

class SpecificationConstraintResponse(SpecificationConstraintBase):
    id: UUID
    specification_id: UUID
    property_definition_id: UUID

    class Config:
        from_attributes = True

from .models import TechnicalStatus

class MatchEvaluationBase(BaseModel):
    candidate_id: UUID
    material_batch_id: UUID
    buyer_specification_id: UUID
    regulatory_evaluation_id: Optional[UUID] = None
    technical_status: TechnicalStatus
    compatibility_score: Optional[float] = None
    ranking_score: Optional[float] = None
    missing_fields: Optional[Dict[str, Any]] = None
    failed_constraints: Optional[Dict[str, Any]] = None
    treatment_requirements: Optional[Dict[str, Any]] = None
    explanation: Optional[Dict[str, Any]] = None
    matching_algorithm_version: str

class MatchEvaluationCreate(MatchEvaluationBase):
    pass

class MatchEvaluationResponse(MatchEvaluationBase):
    id: UUID
    evaluated_at: datetime

    class Config:
        from_attributes = True

class MatchRequest(BaseModel):
    material_batch_id: UUID
    buyer_specification_id: UUID

from .models import InquiryStatus, SampleRequestStatus, DocumentType, DocumentStatus

class InquiryBase(BaseModel):
    match_id: UUID
    buyer_organization_id: UUID
    producer_organization_id: UUID
    rejection_reason: Optional[str] = None

class InquiryCreate(InquiryBase):
    pass

class InquiryResponse(InquiryBase):
    id: UUID
    inquiry_status: InquiryStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SampleRequestBase(BaseModel):
    quantity_requested: float
    quantity_unit: str
    shipping_address: Dict[str, Any]

class SampleRequestCreate(SampleRequestBase):
    inquiry_id: UUID

class SampleRequestResponse(SampleRequestBase):
    id: UUID
    inquiry_id: UUID
    request_status: SampleRequestStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    document_type: DocumentType
    s3_key: str
    original_filename: str
    file_size: int
    content_type: str
    expires_at: Optional[datetime] = None

class DocumentCreate(DocumentBase):
    owner_organization_id: UUID

class DocumentResponse(DocumentBase):
    id: UUID
    owner_organization_id: UUID
    document_status: DocumentStatus
    uploaded_at: datetime

    class Config:
        from_attributes = True
