type HomePageProps = {
  onCreateEvent: () => void;
};

function HomePage({ onCreateEvent }: HomePageProps) {
  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1>CampusRank</h1>

      <p>
        Create ranked voting events for all kinds of competition
      </p>

      <button
        type="button"
        onClick={onCreateEvent}
      >
        Create Event
      </button>
    </main>
  );
}

export default HomePage;