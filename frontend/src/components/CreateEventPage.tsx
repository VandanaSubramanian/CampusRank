type CreateEventPageProps = {
  eventName: string;
  itemType: string;
  itemNames: string[];

  onEventNameChange: (value: string) => void;
  onItemTypeChange: (value: string) => void;
  onItemNameChange: (index: number, value: string) => void;

  onAddItem: () => void;
  onRemoveItem: (index: number) => void;

  onCreateEvent: () => void;
  onBack: () => void;

  createError: string;
  isCreating: boolean;
};

function CreateEventPage({
  eventName,
  itemType,
  itemNames,

  onEventNameChange,
  onItemTypeChange,
  onItemNameChange,

  onAddItem,
  onRemoveItem,

  onCreateEvent,
  onBack,

  createError,
  isCreating,
}: CreateEventPageProps) {
  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <button onClick={onBack}>
        ← Back
      </button>

      <h1>Create Event</h1>

      <label>Event Name</label>

      <input
        value={eventName}
        onChange={(e) =>
          onEventNameChange(e.target.value)
        }
      />

      <label
        style={{ marginTop: 20, display: "block" }}
      >
        What are users ranking?
      </label>

      <input
        value={itemType}
        onChange={(e) =>
          onItemTypeChange(e.target.value)
        }
      />

      <h2>Items</h2>

      {itemNames.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <input
            value={item}
            onChange={(e) =>
              onItemNameChange(
                index,
                e.target.value
              )
            }
          />

          {itemNames.length > 2 && (
            <button
              onClick={() =>
                onRemoveItem(index)
              }
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button onClick={onAddItem}>
        + Add Item
      </button>

      {createError && (
        <p style={{ color: "tomato" }}>
          {createError}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          disabled={isCreating}
          onClick={onCreateEvent}
        >
          {isCreating
            ? "Creating..."
            : "Create Event"}
        </button>
      </div>
    </main>
  );
}

export default CreateEventPage;