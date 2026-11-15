from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class WatchlistCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=32)
    company_name: Optional[str] = Field(default=None, max_length=255)


class WatchlistItemOut(BaseModel):
    id: int
    user_id: int
    symbol: str
    company_name: Optional[str] = None
    added_at: datetime

    # Market enrichment fields
    current_price: Optional[float] = None
    change: Optional[float] = None
    percent_change: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    volume: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
