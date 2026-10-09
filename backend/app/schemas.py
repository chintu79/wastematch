from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

from .models import AccountStatus, FacilityStatus, OrgType, VerificationStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    identity_provider_id: str | None = None

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
    address: dict[str, Any] | None = None
    latitude: float | None = None
    longitude: float | None = None
    jurisdiction: str | None = None
    industrial_estate: str | None = None

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
    registered_address: dict[str, Any] | None = None
    contact_details: dict[str, Any] | None = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: UUID
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    facilities: list[FacilityResponse] = []

    class Config:
        from_attributes = True

from .models import (
    BatchStatus,
    CategoryStatus,
    DataType,
    ListingStatus,
)


class MaterialCategoryBase(BaseModel):
    code: str
    name: str
    parent_category_id: UUID | None = None
    description: str | None = None
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
    availability_start: datetime | None = None
    availability_end: datetime | None = None
    location_visibility: str | None = None

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
    generated_at: datetime | None = None
    sampled_at: datetime | None = None
    properties: dict[str, Any] = {}

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
    canonical_unit: str | None = None
    measurement_basis_options: dict[str, Any] | None = None
    validation_schema: dict[str, Any] | None = None
    active: int = 1

class PropertyDefinitionCreate(PropertyDefinitionBase):
    pass

class PropertyDefinitionResponse(PropertyDefinitionBase):
    id: UUID
    definition_version: int

    class Config:
        from_attributes = True


from .models import (
    EligibilityStatus,
    EvaluationReviewStatus,
    JurisdictionLevel,
    RuleReviewStatus,
)


class RegulatoryRuleBase(BaseModel):
    rule_code: str
    title: str
    legal_instrument: str
    legal_clause_reference: str
    jurisdiction_level: JurisdictionLevel
    applicability_definition: dict[str, Any]
    required_conditions: dict[str, Any]
    effective_from: datetime
    effective_until: datetime | None = None
    source_reference: str | None = None

class RegulatoryRuleCreate(RegulatoryRuleBase):
    pass

class RegulatoryRuleResponse(RegulatoryRuleBase):
    id: UUID
    review_status: RuleReviewStatus
    reviewed_by: UUID | None = None
    reviewed_at: datetime | None = None
    rule_version: int

    class Config:
        from_attributes = True

class RegulatoryEvaluationBase(BaseModel):
    candidate_id: UUID
    rule_set_version: str
    decision_reasons: dict[str, Any] | None = None
    evidence_references: dict[str, Any] | None = None
    unresolved_conditions: dict[str, Any] | None = None

class RegulatoryEvaluationCreate(RegulatoryEvaluationBase):
    pass

class RegulatoryEvaluationResponse(RegulatoryEvaluationBase):
    id: UUID
    eligibility_status: EligibilityStatus
    evaluated_at: datetime
    reviewer_id: UUID | None = None
    review_status: EvaluationReviewStatus

    class Config:
        from_attributes = True

from .models import ConstraintType, MissingDataPolicy, SpecificationStatus


class BuyerSpecificationBase(BaseModel):
    intended_use: str
    minimum_quantity: float | None = None
    maximum_quantity: float | None = None
    quantity_unit: str | None = None
    effective_from: datetime
    effective_until: datetime | None = None

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
    lower_bound: float | None = None
    upper_bound: float | None = None
    unit: str
    required_evidence: bool = True
    missing_data_policy: MissingDataPolicy
    tolerance_policy: dict[str, Any] | None = None

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
    regulatory_evaluation_id: UUID | None = None
    technical_status: TechnicalStatus
    compatibility_score: float | None = None
    ranking_score: float | None = None
    missing_fields: dict[str, Any] | None = None
    failed_constraints: dict[str, Any] | None = None
    treatment_requirements: dict[str, Any] | None = None
    explanation: dict[str, Any] | None = None
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

from .models import DocumentStatus, DocumentType, InquiryStatus, SampleRequestStatus


class InquiryBase(BaseModel):
    match_id: UUID
    buyer_organization_id: UUID
    producer_organization_id: UUID
    rejection_reason: str | None = None

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
    shipping_address: dict[str, Any]

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
    expires_at: datetime | None = None

class DocumentCreate(DocumentBase):
    owner_organization_id: UUID

class DocumentResponse(DocumentBase):
    id: UUID
    owner_organization_id: UUID
    document_status: DocumentStatus
    is_deleted: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentAccessCreate(BaseModel):
    document_id: UUID
    granted_to_organization_id: UUID
    expires_at: Optional[datetime] = None

class DocumentAccessResponse(BaseModel):
    id: UUID
    document_id: UUID
    granted_to_organization_id: UUID
    granted_by_user_id: UUID
    granted_at: datetime
    expires_at: Optional[datetime] = None
    is_revoked: bool
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True
