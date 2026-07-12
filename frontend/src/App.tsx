import { useState } from "react";
import VotePage from "./components/VotePage";
import ReviewPage from "./components/ReviewPage";
import HomePage from "./components/HomePage";


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
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <button
        type="button"
        onClick={() => setScreen("home")}
      >
        ← Back
      </button>

      <h1>Create an Event</h1>

      <p>The organizer form will go here.</p>
    </main>
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