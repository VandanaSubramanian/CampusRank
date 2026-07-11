import { useEffect, useState } from "react";


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
type Screen = "home" | "vote" | "review" | "success";

function App() {
  const [screen, setScreen] = useState<Screen>("vote");
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events/1")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        return response.json();
      })
      .then((data: Event) => {
        setEvent(data);
      })
      .catch((fetchError: Error) => {
        console.error(fetchError);
        setError(fetchError.message);
      });
  }, []);

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

  function getRank(itemId: number) {
    const position = selectedItemIds.indexOf(itemId);

    if (position === -1) {
      return null;
    }

    return position + 1;
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

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  if (!event) {
    return <h2>Loading...</h2>;
  }

  const allItemsRanked =
    selectedItemIds.length === event.items.length;
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
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1>Review Your Vote</h1>

      <p>Please confirm your ranking before submitting.</p>

      <ol>
        {selectedItemIds.map((itemId) => {
          const item = event.items.find(
            (eventItem) => eventItem.id === itemId
          );

          return <li key={itemId}>{item?.name}</li>;
        })}
      </ol>
      <label
  style={{
    display: "block",
    marginTop: "24px",
    marginBottom: "8px",
  }}
>
  BU email
</label>

<input
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  placeholder="student@bu.edu"
  style={{
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "20px",
  }}
/>

{submissionError && (
  <p style={{ color: "tomato" }}>{submissionError}</p>
)}

      <button
        type="button"
        onClick={() => setScreen("vote")}
      >
        Go Back
      </button>

      <button
  type="button"
  onClick={handleSubmitVote}
  disabled={!email || isSubmitting}
  style={{ marginLeft: "12px" }}
>
  {isSubmitting ? "Submitting..." : "Confirm and Submit"}
</button>
    </main>
  );
}

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1>CampusRank</h1>

      <h2>{event.name}</h2>

      <p>
        Click each {event.item_type.slice(0, -1)} in order from your
        favorite to least favorite.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        {event.items.map((item) => {
          const rank = getRank(item.id);
          const isSelected = rank !== null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                fontSize: "18px",
                cursor: "pointer",
                border: isSelected
                  ? "2px solid white"
                  : "1px solid gray",
              }}
            >
              <span
                style={{
                  width: "32px",
                  fontWeight: "bold",
                }}
              >
                {rank ?? "—"}
              </span>

              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <button
  type="button"
  disabled={!allItemsRanked}
  onClick={() => setScreen("review")}
  style={{
    marginTop: "24px",
    padding: "12px 24px",
    cursor: allItemsRanked ? "pointer" : "not-allowed",
  }}
>
  Review Vote
</button>

      <p>
        Ranked {selectedItemIds.length} of {event.items.length}
      </p>
    </main>
  );
}

export default App;