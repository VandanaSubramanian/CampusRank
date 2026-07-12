type Item = {
  id: number;
  name: string;
};

type EventData = {
  id: number;
  name: string;
  item_type: string;
  voting_method: string;
  items: Item[];
};

type ReviewPageProps = {
  event: EventData;
  selectedItemIds: number[];
  email: string;
  submissionError: string;
  isSubmitting: boolean;
  onEmailChange: (email: string) => void;
  onGoBack: () => void;
  onSubmit: () => void;
};

function ReviewPage({
  event,
  selectedItemIds,
  email,
  submissionError,
  isSubmitting,
  onEmailChange,
  onGoBack,
  onSubmit,
}: ReviewPageProps) {
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
        onChange={(inputEvent) =>
          onEmailChange(inputEvent.target.value)
        }
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
        <p style={{ color: "tomato" }}>
          {submissionError}
        </p>
      )}

      <button
        type="button"
        onClick={onGoBack}
      >
        Go Back
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!email || isSubmitting}
        style={{ marginLeft: "12px" }}
      >
        {isSubmitting ? "Submitting..." : "Confirm and Submit"}
      </button>
    </main>
  );
}

export default ReviewPage;