type EventData = {
  id: number;
  name: string;
};

type EventCreatedPageProps = {
  event: EventData;
  onStartVoting: () => void;
  onBackHome: () => void;
};

function EventCreatedPage({
  event,
  onStartVoting,
  onBackHome,
}: EventCreatedPageProps) {
  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h1>Event Created!</h1>

      <h2>{event.name}</h2>

      <p>Your event is ready for voters.</p>

      <p>
        Event ID: <strong>{event.id}</strong>
      </p>

      <div style={{ marginTop: "24px" }}>
        <button
          type="button"
          onClick={onStartVoting}
        >
          Open Voting Page
        </button>

        <button
          type="button"
          onClick={onBackHome}
          style={{ marginLeft: "12px" }}
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}

export default EventCreatedPage;