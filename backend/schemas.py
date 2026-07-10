from pydantic import BaseModel


class EventCreate(BaseModel):
    name: str
    item_type: str
    items: list[str]
    voting_method: str = "borda"


class VoteCreate(BaseModel):
    email: str
    ranking: list[int]