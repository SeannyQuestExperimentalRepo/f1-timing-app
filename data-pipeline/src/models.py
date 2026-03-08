"""
Pydantic models matching the shared TypeScript types for F1 timing data.
"""

from datetime import datetime
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class TireCompound(str, Enum):
    SOFT = "SOFT"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    INTERMEDIATE = "INTERMEDIATE"
    WET = "WET"


class SessionType(str, Enum):
    PRACTICE = "Practice"
    QUALIFYING = "Qualifying"
    SPRINT = "Sprint"
    RACE = "Race"


class SessionStatus(str, Enum):
    INACTIVE = "Inactive"
    STARTED = "Started"
    ABORTED = "Aborted"
    FINISHED = "Finished"
    FINALISED = "Finalised"


class RaceControlCategory(str, Enum):
    FLAG = "Flag"
    SAFETY_CAR = "SafetyCar"
    VIRTUAL_SAFETY_CAR = "VirtualSafetyCar"
    DRS = "DRS"
    PENALTY = "Penalty"
    INVESTIGATION = "Investigation"
    OTHER = "Other"


class Flag(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    DOUBLE_YELLOW = "DOUBLE_YELLOW"
    RED = "RED"
    BLUE = "BLUE"
    CHEQUERED = "CHEQUERED"
    BLACK = "BLACK"
    WHITE = "WHITE"


class DataChannel(str, Enum):
    CAR_DATA = "car_data"
    LOCATION = "location"
    POSITION = "position"
    INTERVAL = "interval"
    LAP = "lap"
    PIT = "pit"
    STINT = "stint"
    WEATHER = "weather"
    RACE_CONTROL = "race_control"
    TEAM_RADIO = "team_radio"
    SESSION = "session"
    DRIVERS = "drivers"


# Core F1 Data Models
class CarData(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    rpm: int
    speed: int
    n_gear: int
    throttle: int
    brake: int
    drs: int


class Location(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    x: float
    y: float
    z: float


class Position(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    position: int


class Interval(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    gap_to_leader: float
    interval: float


class Lap(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date_start: str
    lap_number: int
    lap_duration: float
    is_pit_out_lap: bool
    i1_speed: Optional[float] = None
    i2_speed: Optional[float] = None
    st_speed: Optional[float] = None
    segments_sector_1: List[int]
    segments_sector_2: List[int]
    segments_sector_3: List[int]
    lap_time: float
    s1_time: float
    s2_time: float
    s3_time: float


class PitStop(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    lap_number: int
    pit_duration: float
    is_pit_in: Optional[bool] = None
    is_pit_out: Optional[bool] = None


class Stint(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    stint_number: int
    lap_start: int
    lap_end: int
    compound: TireCompound
    tyre_age_at_start: int


class Weather(BaseModel):
    meeting_key: int
    session_key: int
    date: str
    air_temperature: float
    humidity: float
    pressure: float
    rainfall: float
    track_temperature: float
    wind_direction: float
    wind_speed: float


class RaceControl(BaseModel):
    meeting_key: int
    session_key: int
    date: str
    category: RaceControlCategory
    flag: Optional[Flag] = None
    scope: Optional[str] = None
    sector: Optional[int] = None
    driver_number: Optional[int] = None
    message: str
    lap_number: Optional[int] = None


class TeamRadio(BaseModel):
    meeting_key: int
    session_key: int
    driver_number: int
    date: str
    recording_url: str


class Session(BaseModel):
    circuit_key: int
    circuit_short_name: str
    country_code: str
    country_key: int
    country_name: str
    date_end: str
    date_start: str
    gmt_offset: str
    location: str
    meeting_key: int
    session_key: int
    session_name: str
    session_type: SessionType
    year: int


class Driver(BaseModel):
    broadcast_name: str
    country_code: str
    driver_number: int
    first_name: str
    full_name: str
    headshot_url: str
    last_name: str
    meeting_key: int
    name_acronym: str
    session_key: int
    team_colour: str
    team_name: str


# WebSocket and Pipeline Models
class WebSocketMessage(BaseModel):
    type: str
    channel: Optional[DataChannel] = None
    data: Any
    timestamp: Optional[int] = None
    session_key: Optional[str] = None


class PipelineMessage(BaseModel):
    session_key: str
    channel: DataChannel
    data: Union[CarData, Location, Position, Interval, Lap, PitStop, Stint, Weather, RaceControl, TeamRadio, Session, Driver, List[Any]]
    timestamp: Optional[int] = None


# OpenF1 API Response Models
class OpenF1Response(BaseModel):
    """Generic response wrapper for OpenF1 API"""
    data: List[Dict[str, Any]]
    total: Optional[int] = None
    page: Optional[int] = None


# Internal Pipeline Models
class PollingConfig(BaseModel):
    endpoint: str
    interval_seconds: float
    session_key: str = "latest"
    params: Dict[str, Any] = Field(default_factory=dict)


class RecorderConfig(BaseModel):
    database_path: str = "./recorded_data.db"
    batch_size: int = 100
    flush_interval_seconds: float = 5.0


class BroadcasterConfig(BaseModel):
    server_host: str = "localhost"
    server_port: int = 3001
    websocket_path: str = "/ws"
    reconnect_interval_seconds: float = 3.0
    max_reconnect_attempts: int = 10


class PipelineConfig(BaseModel):
    openf1_base_url: str = "https://api.openf1.org/v1"
    recorder: RecorderConfig = Field(default_factory=RecorderConfig)
    broadcaster: BroadcasterConfig = Field(default_factory=BroadcasterConfig)
    polling_intervals: Dict[str, float] = Field(default_factory=lambda: {
        "car_data": 1.5,
        "location": 1.5,
        "position": 5.0,
        "intervals": 5.0,
        "laps": 5.0,
        "pit": 5.0,
        "stints": 5.0,
        "weather": 10.0,
        "race_control": 3.0,
        "team_radio": 5.0,
        "session": 30.0,
        "drivers": 60.0,
    })


# Error Models
class PipelineError(BaseModel):
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    component: str  # "poller", "recorder", "broadcaster"


# Statistics Models
class ComponentStats(BaseModel):
    requests_made: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    last_request_time: Optional[datetime] = None
    last_error: Optional[str] = None
    uptime_seconds: float = 0.0


class PipelineStats(BaseModel):
    openf1_client: ComponentStats = Field(default_factory=ComponentStats)
    recorder: ComponentStats = Field(default_factory=ComponentStats)
    broadcaster: ComponentStats = Field(default_factory=ComponentStats)
    total_data_points_processed: int = 0
    current_session_key: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.now)


# Utility functions for model conversion
def openf1_to_model(data: Dict[str, Any], model_class: type) -> BaseModel:
    """Convert OpenF1 API response to Pydantic model"""
    try:
        return model_class.model_validate(data)
    except Exception as e:
        raise ValueError(f"Failed to convert {data} to {model_class.__name__}: {e}")


def models_to_pipeline_message(
    session_key: str,
    channel: DataChannel,
    models: List[BaseModel],
    timestamp: Optional[int] = None
) -> PipelineMessage:
    """Convert list of models to pipeline message"""
    if len(models) == 1:
        data = models[0]
    else:
        data = models
    
    return PipelineMessage(
        session_key=session_key,
        channel=channel,
        data=data,
        timestamp=timestamp
    )


# Type mappings for OpenF1 endpoints
ENDPOINT_MODEL_MAP = {
    "car_data": CarData,
    "location": Location,
    "position": Position,
    "intervals": Interval,
    "laps": Lap,
    "pit": PitStop,
    "stints": Stint,
    "weather": Weather,
    "race_control": RaceControl,
    "team_radio": TeamRadio,
    "sessions": Session,
    "drivers": Driver,
}