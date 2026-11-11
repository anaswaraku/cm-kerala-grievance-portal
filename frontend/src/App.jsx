import { useEffect, useState } from "react";
import { getApiStatus } from "./services/api";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    getApiStatus()
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Backend connection failed!");
      });
  }, []);

  return (
    <div>
      <h1>Kerala CM Grievance Portal</h1>
      <h3>Backend Status:</h3>
      <p>{message}</p>
    </div>
  );
}

export default App;
