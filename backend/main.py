from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import crud
import schemas
from database import SessionLocal
from database import engine
import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
class EventCreate(BaseModel):
    name: str
    item_type: str 
    items: list[str]
    voting_method:str = "borda"
class VoteCreate(BaseModel):
    email: str
    ranking: list[str]
@app.get("/")
def root():
    return{"message":"CampusRank backend is running"}
@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return crud.get_events(db)
@app.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud.get_event(db, event_id)

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
@app.post("/events")
def create_event(event_data: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, event_data)
@app.post("/events/{event_id}/vote")
def submit_vote(
    event_id: int,
    vote_data: schemas.VoteCreate,
    db: Session = Depends(get_db)
):
    result = crud.submit_vote(db, event_id, vote_data)

    if result.get("error") == "event_not_found":
        raise HTTPException(status_code=404, detail="Event not found")

    if result.get("error") == "invalid_email":
        raise HTTPException(
            status_code=400,
            detail="Only BU emails are allowed to vote"
        )

    if result.get("error") == "duplicate_vote":
        raise HTTPException(
            status_code=409,
            detail="This email has already voted in this event"
        )

    if result.get("error") == "invalid_ranking":
        raise HTTPException(
            status_code=400,
            detail="Ranking must include every event item exactly once"
        )

    return result
@app.get("/events/{event_id}/results")
def get_results(
    event_id: int,
    db: Session = Depends(get_db)
):
    results = crud.get_results(db, event_id)

    if results is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return results