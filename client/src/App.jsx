
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import ExploreEvents from "./ExploreEvents";
import EventDetails from "./EventDetails";

function App() {
  const [page, setPage] = useState("landing");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleLoginSuccess = () => {
    setPage("dashboard");
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setPage("eventDetails");
  };

  return (
    <div>
      {/* LANDING */}
      {page === "landing" && (
        <Landing
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
          onExplore={() => setPage("explore")}
        />
      )}

      {/* EXPLORE EVENTS */}
      {page === "explore" && (
        <div>
          <button onClick={() => setPage("landing")}>
            ← Back to EventHub
          </button>

          <ExploreEvents onViewEvent={handleViewEvent} />
        </div>
      )}

      {/* EVENT DETAILS */}
      {page === "eventDetails" && (
        <EventDetails
          event={selectedEvent}
          onBack={() => {
            setSelectedEvent(null);
            setPage("explore");
          }}
        />
      )}

      {/* LOGIN */}
      {page === "login" && (
        <>
          <Login
  onLoginSuccess={handleLoginSuccess}
  onRegister={() => setPage("register")}
/>

          <button onClick={() => setPage("register")}>
            Create New Account
          </button>

          <br />
          <br />

          <button onClick={() => setPage("landing")}>
            ← Back to EventHub
          </button>
        </>
      )}

      {/* REGISTER */}
      {page === "register" && (
        <>
          <Register onLogin={() => setPage("login")} />

          <button onClick={() => setPage("login")}>
            Already have an account? Login
          </button>

          <br />
          <br />

          <button onClick={() => setPage("landing")}>
            ← Back to EventHub
          </button>
        </>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && <Dashboard />}
    </div>
  );
}

export default App;

