from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi import Depends
from sqlalchemy.orm import Session
import crud
import schemas
from database import SessionLocal
from database import engine
import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
events = []
class EventCreate(BaseModel):
    name: str
    item_type: str 
    items: list[str]
    voting_method:str = "borda"
class VoteCreate(BaseModel):
    email: str
    ranking: list[str]
def find_event(event_id: int):
    for event in events:
        if event["id"] == event_id:
            return event
    raise HTTPException(status_code=404,detail="Event not found")
@app.get("/")
def root():
    return{"message":"CampusRank backend is running"}
@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return crud.get_events(db)
@app.get("/events/{event_id}")
def get_event(event_id:int):
    return find_event(event_id)
@app.post("/events")
def create_event(event_data: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, event_data)
@app.post("/events/{event_id}/vote")
def submit_vote(event_id:int, vote_data: VoteCreate):
    event = find_event(event_id)
    if event is None:
        raise HTTPException(status_code = 404, detail = "Event not found")
    if not vote_data.email.endswith("@bu.edu"):
        raise HTTPException(status_code = 400, detail = "Only BU emails are allowed to vote")
    for vote in event["votes"]:
        if vote["email"] == vote_data.email:
            raise HTTPException(status_code = 400, detail="This email has already voted")
    if set(vote_data.ranking) != set(event["items"]):
        raise HTTPException(status_code = 400, detail = "Ranking must include every item exactly once")
    vote = {"email": vote_data.email, "ranking":vote_data.ranking}
    event["votes"].append(vote)
    return{"message": "Vote recorded successfully", "vote": vote}
@app.get("/events/{event_id}/results")
def get_results(event_id:int):
    event = find_event(event_id)
    if event is None:
        raise HTTPException(status_code = 404, detail = "Event not found")
    score = {}
    for item in event["items"]:
        score[item] = 0
    num_items = len(event["items"])
    for vote in event["votes"]:
        ranking = vote["ranking"]
        for position in range(len(ranking)):
            item = ranking[position]
            points = num_items - position
            score[item] += points
    return score