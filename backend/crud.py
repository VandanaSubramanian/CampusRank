from sqlalchemy.orm import Session
import models
import schemas


def create_event(db: Session, event_data: schemas.EventCreate):
    event = models.Event(
        name=event_data.name,
        item_type=event_data.item_type,
        voting_method=event_data.voting_method
    )

    db.add(event)
    db.flush()

    for item_name in event_data.items:
        item = models.Item(
            event_id=event.id,
            name=item_name
        )
        db.add(item)

    db.commit()
    db.refresh(event)

    return event

def get_events(db: Session):
    return db.query(models.Event).all()

def get_event(db: Session, event_id: int):
    event = (
        db.query(models.Event)
        .filter(models.Event.id == event_id)
        .first()
    )

    if event is None:
        return None

    items = (
        db.query(models.Item)
        .filter(models.Item.event_id == event_id)
        .all()
    )

    return {
        "id": event.id,
        "name": event.name,
        "item_type": event.item_type,
        "voting_method": event.voting_method,
        "items": [
            {
                "id": item.id,
                "name": item.name
            }
            for item in items
        ]
    }
def submit_vote(
    db: Session,
    event_id: int,
    vote_data: schemas.VoteCreate
):
    event = (
        db.query(models.Event)
        .filter(models.Event.id == event_id)
        .first()
    )

    if event is None:
        return {"error": "event_not_found"}

    email = vote_data.email.strip().lower()

    if not email.endswith("@bu.edu"):
        return {"error": "invalid_email"}

    existing_vote = (
        db.query(models.Vote)
        .filter(
            models.Vote.event_id == event_id,
            models.Vote.email == email
        )
        .first()
    )

    if existing_vote is not None:
        return {"error": "duplicate_vote"}

    items = (
        db.query(models.Item)
        .filter(models.Item.event_id == event_id)
        .all()
    )

    valid_item_ids = {item.id for item in items}

    if (
        len(vote_data.ranking) != len(valid_item_ids)
        or len(set(vote_data.ranking)) != len(vote_data.ranking)
        or set(vote_data.ranking) != valid_item_ids
    ):
        return {"error": "invalid_ranking"}

    vote = models.Vote(
        event_id=event_id,
        email=email
    )

    db.add(vote)
    db.flush()

    for position, item_id in enumerate(vote_data.ranking, start=1):
        ranking = models.Ranking(
            vote_id=vote.id,
            item_id=item_id,
            rank=position
        )
        db.add(ranking)

    db.commit()
    db.refresh(vote)

    return {
        "message": "Vote recorded successfully",
        "vote_id": vote.id
    }
def get_results(db: Session, event_id: int):
    event = (
        db.query(models.Event)
        .filter(models.Event.id == event_id)
        .first()
    )

    if event is None:
        return None

    items = (
        db.query(models.Item)
        .filter(models.Item.event_id == event_id)
        .all()
    )

    votes = (
        db.query(models.Vote)
        .filter(models.Vote.event_id == event_id)
        .all()
    )

    item_lookup = {item.id: item.name for item in items}

    scores = {
        item.id: {
            "item_id": item.id,
            "name": item.name,
            "points": 0,
            "first_place_votes": 0
        }
        for item in items
    }

    number_of_items = len(items)

    for vote in votes:
        rankings = (
            db.query(models.Ranking)
            .filter(models.Ranking.vote_id == vote.id)
            .order_by(models.Ranking.rank)
            .all()
        )

        for ranking in rankings:
            points = number_of_items - ranking.rank + 1
            scores[ranking.item_id]["points"] += points

            if ranking.rank == 1:
                scores[ranking.item_id]["first_place_votes"] += 1

    sorted_results = sorted(
        scores.values(),
        key=lambda item: (
            item["points"],
            item["first_place_votes"]
        ),
        reverse=True
    )

    return {
        "event_id": event.id,
        "event_name": event.name,
        "total_votes": len(votes),
        "results": sorted_results
    }