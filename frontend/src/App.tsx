import { useEffect, useState } from "react";

function App() {
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events/1")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEvent(data);
      });
  }, []);

  if (!event) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>CampusRank</h1>

      <h2>{event.name}</h2>

      <p>Rank the following {event.item_type}:</p>

      <ul>
        {event.items.map((item: any) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;