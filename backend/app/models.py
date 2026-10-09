import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .database import Base


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
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
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

class CategoryStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    DEPRECATED = "DEPRECATED"

class ListingStatus(enum.Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    PUBLISHED = "PUBLISHED"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"

class BatchStatus(enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    CONSUMED = "CONSUMED"

class DataType(enum.Enum):
    NUMERIC = "NUMERIC"
    TEXT = "TEXT"
    BOOLEAN = "BOOLEAN"

class MeasurementVerificationStatus(enum.Enum):
    VERIFIED = "VERIFIED"
    SUPPLIER_REPORTED = "SUPPLIER_REPORTED"
    ESTIMATED = "ESTIMATED"
    UNVERIFIED = "UNVERIFIED"
    DISPUTED = "DISPUTED"
    EXPIRED = "EXPIRED"

class MaterialCategory(Base):
    __tablename__ = "material_categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    parent_category_id = Column(UUID(as_uuid=True), ForeignKey("material_categories.id"), nullable=True)
    description = Column(String, nullable=True)
    category_status = Column(Enum(CategoryStatus), default=CategoryStatus.ACTIVE)

class MaterialListing(Base):
    __tablename__ = "material_listings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    producer_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    source_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False)
    material_category_id = Column(UUID(as_uuid=True), ForeignKey("material_categories.id"), nullable=False)
    material_description = Column(String, nullable=False)
    source_process = Column(String, nullable=False)
    available_quantity = Column(Float, nullable=False)
    quantity_unit = Column(String, nullable=False)
    availability_start = Column(DateTime, nullable=True)
    availability_end = Column(DateTime, nullable=True)
    location_visibility = Column(String, nullable=True)
    listing_status = Column(Enum(ListingStatus), default=ListingStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MaterialBatch(Base):
    __tablename__ = "material_batches"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("material_listings.id"), nullable=False)
    batch_reference = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    quantity_unit = Column(String, nullable=False)
    generated_at = Column(DateTime, nullable=True)
    sampled_at = Column(DateTime, nullable=True)
    batch_status = Column(Enum(BatchStatus), default=BatchStatus.AVAILABLE)
    properties = Column(JSON().with_variant(JSONB, 'postgresql'), default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class PropertyDefinition(Base):
    __tablename__ = "property_definitions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    data_type = Column(Enum(DataType), nullable=False)
    canonical_unit = Column(String, nullable=True)
    measurement_basis_options = Column(JSON, nullable=True)
    validation_schema = Column(JSON, nullable=True)
    definition_version = Column(Integer, default=1)
    active = Column(Integer, default=1)


class JurisdictionLevel(enum.Enum):
    LOCAL = "LOCAL"
    STATE = "STATE"
    NATIONAL = "NATIONAL"
    INTERNATIONAL = "INTERNATIONAL"

class RuleReviewStatus(enum.Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    DEPRECATED = "DEPRECATED"

class EligibilityStatus(enum.Enum):
    ELIGIBLE = "ELIGIBLE"
    HOLD = "HOLD"
    INELIGIBLE = "INELIGIBLE"

class EvaluationReviewStatus(enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class RegulatoryRule(Base):
    __tablename__ = "regulatory_rules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rule_code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    legal_instrument = Column(String, nullable=False)
    legal_clause_reference = Column(String, nullable=False)
    jurisdiction_level = Column(Enum(JurisdictionLevel), nullable=False)
    applicability_definition = Column(JSON, nullable=False)
    required_conditions = Column(JSON, nullable=False)
    effective_from = Column(DateTime, nullable=False)
    effective_until = Column(DateTime, nullable=True)
    review_status = Column(Enum(RuleReviewStatus), default=RuleReviewStatus.DRAFT)
    source_reference = Column(String, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rule_version = Column(Integer, default=1)

class RegulatoryEvaluation(Base):
    __tablename__ = "regulatory_evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
    rule_set_version = Column(String, nullable=False)
    eligibility_status = Column(Enum(EligibilityStatus), default=EligibilityStatus.HOLD)
    decision_reasons = Column(JSON, nullable=True)
    evidence_references = Column(JSON, nullable=True)
    unresolved_conditions = Column(JSON, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    review_status = Column(Enum(EvaluationReviewStatus), default=EvaluationReviewStatus.PENDING_REVIEW)

from sqlalchemy import Boolean


class SpecificationStatus(enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"

class ConstraintType(enum.Enum):
    HARD_LIMIT = "HARD_LIMIT"
    PREFERRED_RANGE = "PREFERRED_RANGE"
    PROHIBITED_CONDITION = "PROHIBITED_CONDITION"
    REQUIRED_PROPERTY = "REQUIRED_PROPERTY"

class MissingDataPolicy(enum.Enum):
    HOLD = "HOLD"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    NOT_APPLICABLE_WITH_EVIDENCE = "NOT_APPLICABLE_WITH_EVIDENCE"

class BuyerSpecification(Base):
    __tablename__ = "buyer_specifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    buyer_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    receiving_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False)
    target_category_id = Column(UUID(as_uuid=True), ForeignKey("material_categories.id"), nullable=False)
    intended_use = Column(String, nullable=False)
    specification_version = Column(Integer, default=1)
    minimum_quantity = Column(Float, nullable=True)
    maximum_quantity = Column(Float, nullable=True)
    quantity_unit = Column(String, nullable=True)
    specification_status = Column(Enum(SpecificationStatus), default=SpecificationStatus.DRAFT)
    effective_from = Column(DateTime, nullable=False)
    effective_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SpecificationConstraint(Base):
    __tablename__ = "specification_constraints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    specification_id = Column(UUID(as_uuid=True), ForeignKey("buyer_specifications.id"), nullable=False)
    property_definition_id = Column(UUID(as_uuid=True), ForeignKey("property_definitions.id"), nullable=False)
    constraint_type = Column(Enum(ConstraintType), nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    unit = Column(String, nullable=False)
    required_evidence = Column(Boolean, default=True)
    missing_data_policy = Column(Enum(MissingDataPolicy), nullable=False)
    tolerance_policy = Column(JSON, nullable=True)

class TechnicalStatus(enum.Enum):
    PENDING = "PENDING"
    COMPATIBLE = "COMPATIBLE"
    INCOMPATIBLE = "INCOMPATIBLE"
    NEEDS_TREATMENT = "NEEDS_TREATMENT"
    MISSING_DATA = "MISSING_DATA"

class MatchEvaluation(Base):
    __tablename__ = "match_evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    material_batch_id = Column(UUID(as_uuid=True), ForeignKey("material_batches.id"), nullable=False)
    buyer_specification_id = Column(UUID(as_uuid=True), ForeignKey("buyer_specifications.id"), nullable=False)
    regulatory_evaluation_id = Column(UUID(as_uuid=True), ForeignKey("regulatory_evaluations.id"), nullable=True)
    technical_status = Column(Enum(TechnicalStatus), nullable=False)
    compatibility_score = Column(Float, nullable=True)
    ranking_score = Column(Float, nullable=True)
    missing_fields = Column(JSON, nullable=True)
    failed_constraints = Column(JSON, nullable=True)
    treatment_requirements = Column(JSON, nullable=True)
    explanation = Column(JSON, nullable=True)
    matching_algorithm_version = Column(String, nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

class InquiryStatus(enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    QUALIFIED = "QUALIFIED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"

class SampleRequestStatus(enum.Enum):
    REQUESTED = "REQUESTED"
    SHIPPED = "SHIPPED"
    RECEIVED = "RECEIVED"
    TESTING = "TESTING"
    COMPLETED = "COMPLETED"

class DocumentType(enum.Enum):
    TEST_REPORT = "TEST_REPORT"
    CERTIFICATE = "CERTIFICATE"
    PHOTOGRAPH = "PHOTOGRAPH"
    CONTRACT = "CONTRACT"
    OTHER = "OTHER"

class DocumentStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    INVALID = "INVALID"

class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey("match_evaluations.id"), nullable=False)
    buyer_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    producer_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    inquiry_status = Column(Enum(InquiryStatus), default=InquiryStatus.OPEN)
    rejection_reason = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SampleRequest(Base):
    __tablename__ = "sample_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    inquiry_id = Column(UUID(as_uuid=True), ForeignKey("inquiries.id"), nullable=False)
    request_status = Column(Enum(SampleRequestStatus), default=SampleRequestStatus.REQUESTED)
    quantity_requested = Column(Float, nullable=False)
    quantity_unit = Column(String, nullable=False)
    shipping_address = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    owner_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    s3_key = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False)
    document_status = Column(Enum(DocumentStatus), default=DocumentStatus.ACTIVE)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class DocumentAccess(Base):
    __tablename__ = "document_access"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    granted_to_organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    granted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)

