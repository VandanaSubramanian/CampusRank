import { useState } from "react";
import VotePage from "./components/VotePage";
import ReviewPage from "./components/ReviewPage";
import HomePage from "./components/HomePage";
import CreateEventPage from "./components/CreateEventPage";

type Item = {
  id: number;
  name: string;
};

type Event = {
  id: number;
  name: string;
  item_type: string;
  voting_method: string;
  items: Item[];
};
type Screen = "home" | "create" | "vote" | "review" | "success";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventName, setEventName] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemNames, setItemNames] = useState(["", ""]);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function updateItemName(index: number, value: string) {
  setItemNames((currentItems) =>
    currentItems.map((item, itemIndex) =>
      itemIndex === index ? value : item
    )
  );
}
async function loadEvent(eventId: number) {
  const response = await fetch(
    `http://127.0.0.1:8000/events/${eventId}`
  );

  if (!response.ok) {
    throw new Error("Unable to load the created event");
  }

  const data: Event = await response.json();

  setEvent(data);
  setSelectedItemIds([]);
  setScreen("vote");
}
async function handleCreateEvent() {
  setCreateError("");

  const cleanedItems = itemNames
    .map((item) => item.trim())
    .filter((item) => item !== "");

  if (!eventName.trim()) {
    setCreateError("Please enter an event name.");
    return;
  }

  if (!itemType.trim()) {
    setCreateError("Please enter what voters will rank.");
    return;
  }

  if (cleanedItems.length < 2) {
    setCreateError("Please enter at least two items.");
    return;
  }

  if (new Set(cleanedItems).size !== cleanedItems.length) {
    setCreateError("Item names must be unique.");
    return;
  }

  setIsCreating(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName.trim(),
          item_type: itemType.trim(),
          items: cleanedItems,
          voting_method: "borda",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail ?? "Unable to create event");
    }

    await loadEvent(data.id);
  } catch (createEventError) {
    if (createEventError instanceof Error) {
      setCreateError(createEventError.message);
    } else {
      setCreateError("Unable to create event");
    }
  } finally {
    setIsCreating(false);
  }
}

function addItemField() {
  setItemNames((currentItems) => [...currentItems, ""]);
}

function removeItemField(index: number) {
  setItemNames((currentItems) =>
    currentItems.filter((_, itemIndex) => itemIndex !== index)
  );
}

  function handleItemClick(itemId: number) {
    setSelectedItemIds((currentSelection) => {
      const isAlreadySelected = currentSelection.includes(itemId);

      if (isAlreadySelected) {
        return currentSelection.filter(
          (selectedId) => selectedId !== itemId
        );
      }

      return [...currentSelection, itemId];
    });
  }


  async function handleSubmitVote() {
  if (!event) {
    return;
  }

  setIsSubmitting(true);
  setSubmissionError("");

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/events/${event.id}/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          ranking: selectedItemIds,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail ?? "Unable to submit vote");
    }

    setSubmissionMessage(data.message);
    setScreen("success");
  } catch (submitError) {
    if (submitError instanceof Error) {
      setSubmissionError(submitError.message);
    } else {
      setSubmissionError("Unable to submit vote");
    }
  } finally {
    setIsSubmitting(false);
  }
}
if (screen === "home") {
  return (
    <HomePage
      onCreateEvent={() => setScreen("create")}
    />
  );
}if (screen === "create") {
  return (
    <CreateEventPage
      eventName={eventName}
      itemType={itemType}
      itemNames={itemNames}
      onEventNameChange={setEventName}
      onItemTypeChange={setItemType}
      onItemNameChange={updateItemName}
      onAddItem={addItemField}
      onRemoveItem={removeItemField}
      onCreateEvent={handleCreateEvent}
      onBack={() => setScreen("home")}
      createError={createError}
      isCreating={isCreating}
    />
  );
}

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  if (!event) {
    return <h2>Loading...</h2>;
  }

  
    if (screen === "success") {
  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1>CampusRank</h1>
      <h2>Your submission has been recorded.</h2>
      <p>{submissionMessage}</p>
    </main>
  );
}
   if (screen === "review") {
  return (
    <ReviewPage
      event={event}
      selectedItemIds={selectedItemIds}
      email={email}
      submissionError={submissionError}
      isSubmitting={isSubmitting}
      onEmailChange={setEmail}
      onGoBack={() => setScreen("vote")}
      onSubmit={handleSubmitVote}
    />
  );
}

  return (
  <VotePage
    event={event}
    selectedItemIds={selectedItemIds}
    onItemClick={handleItemClick}
    onReviewVote={() => setScreen("review")}
  />
);
}

export default App;