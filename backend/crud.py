from sqlalchemy.orm import Session
import models
import schemas


def create_event(db: Session, event_data: schemas.EventCreate):
    event = models.Event(
        name=event_data.name,
        item_type=event_data.item_type,
        voting_method=event_data.voting_method
    )

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