import decimal
from enum import Enum
from typing import Dict
from datetime import datetime


def parse_field_value(field_value):
    if isinstance(field_value, decimal.Decimal):  # Decimal -> float
        field_value = round(float(field_value), 2)
    elif isinstance(field_value, datetime):  # datetime -> str
        field_value = str(field_value)
    elif isinstance(field_value, list):
        field_value = [parse_field_value(i) for i in field_value]
    if hasattr(field_value, 'to_json'):
        field_value = field_value.to_json()
    elif isinstance(field_value, Enum):
        field_value = field_value.name
    elif isinstance(field_value, Dict):
        val = {}
        for key_ in field_value:
            val[key_] = parse_field_value(field_value[key_])
        field_value = val
    return field_value
