import re
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator


PARCEL_TYPE_ALIASES = {
    "medium_box": "medium_parcel",
    "large_box": "large_parcel",
    "envelope": "document",
}

PAYMENT_METHOD_ALIASES = {
    "online": "prepaid",
    "card": "prepaid",
}


class CreateOrderRequest(BaseModel):
    store_id: UUID | None = None
    pickup_address: str | None = None
    recipient_name: str
    recipient_phone: str
    recipient_address: str
    destination_area: str | None = None
    parcel_type: str = "small_box"
    item_description: str | None = None
    item_weight: str | None = "0-1kg"
    amount: Decimal = Field(ge=0, le=Decimal("99999999"))
    payment_method: str = "cod"
    cod_amount: Decimal = Field(default=Decimal("0"), ge=0, le=Decimal("99999999"))
    notes: str | None = None

    @field_validator("parcel_type", mode="before")
    @classmethod
    def normalize_parcel_type(cls, value):
        if not isinstance(value, str):
            return value
        normalized = value.strip().lower()
        return PARCEL_TYPE_ALIASES.get(normalized, normalized)

    @field_validator("payment_method", mode="before")
    @classmethod
    def normalize_payment_method(cls, value):
        if not isinstance(value, str):
            return value
        normalized = value.strip().lower()
        return PAYMENT_METHOD_ALIASES.get(normalized, normalized)

    @field_validator(
        "pickup_address",
        "recipient_name",
        "recipient_address",
        "destination_area",
        "item_description",
        "item_weight",
        "notes",
        mode="before",
    )
    @classmethod
    def normalize_text_fields(cls, value):
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return value

    @field_validator("recipient_phone")
    @classmethod
    def validate_bd_phone(cls, value: str):
        phone = value.strip()
        if not re.fullmatch(r"01[3-9]\d{8}", phone):
            raise ValueError("Enter a valid BD mobile number (01X-XXXXXXXX)")
        return phone

    @model_validator(mode="after")
    def validate_business_rules(self):
        if not self.recipient_name:
            raise ValueError("Recipient name is required")
        if not self.recipient_address:
            raise ValueError("Recipient address is required")
        if self.store_id is None and not self.pickup_address:
            raise ValueError("Pickup address is required when store is not selected")

        allowed_parcel_types = {
            "document",
            "small_box",
            "medium_parcel",
            "large_parcel",
            "fragile",
        }
        if self.parcel_type not in allowed_parcel_types:
            raise ValueError(
                "Invalid parcel type. Use one of: document, small_box, medium_parcel, large_parcel, fragile"
            )

        allowed_payment_methods = {"cod", "prepaid", "bkash"}
        if self.payment_method not in allowed_payment_methods:
            raise ValueError("Invalid payment method. Use one of: cod, prepaid, bkash")

        if self.payment_method != "cod":
            self.cod_amount = Decimal("0")

        return self
