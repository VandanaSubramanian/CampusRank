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

type VotePageProps = {
  event: EventData;
  selectedItemIds: number[];
  onItemClick: (itemId: number) => void;
  onReviewVote: () => void;
};

function VotePage({
  event,
  selectedItemIds,
  onItemClick,
  onReviewVote,
}: VotePageProps) {
  function getRank(itemId: number) {
    const position = selectedItemIds.indexOf(itemId);
    return position === -1 ? null : position + 1;
  }

  const allItemsRanked =
    selectedItemIds.length === event.items.length;

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
        Click each option from your favorite to least favorite.
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
              onClick={() => onItemClick(item.id)}
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
        onClick={onReviewVote}
        style={{
          marginTop: "24px",
          padding: "12px 24px",
          cursor: allItemsRanked
            ? "pointer"
            : "not-allowed",
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

export default VotePage;