import { useEffect, useState } from "react";
import EventDetails from "./EventDetails";
import "./SavedEvents.css";

function SavedEvents({ onBack, onViewEvent }) {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const userId = loggedInUser?.id;

  const loadSavedEvents = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/saved/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Saved events load nahi hue."
        );
      }

      setSavedEvents(data);
    } catch (error) {
      console.error("Saved events error:", error);
      setMessage(
        error.message || "Unable to load saved events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const handleUnsave = async (event) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/unsave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove event."
        );
      }

      setSavedEvents((previousEvents) =>
        previousEvents.filter(
          (item) => item._id !== event._id
        )
      );

      setMessage("Event removed from Saved Events.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Unsave error:", error);

      setMessage(
        error.message ||
          "Unable to remove saved event."
      );
    }
  };

  if (loading) {
    return (
      <div className="saved-events-page">
        <div className="saved-loading">
          <div className="saved-loading-circle"></div>
          <h2>Loading Saved Events...</h2>
          <p>Finding the events you saved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-events-page">

      {/* HEADER */}

      <header className="saved-events-header">

        <button
          className="saved-back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="saved-header-content">
          <span>SAVED • EVENTS</span>

          <h1>
            Events you want to
            <br />
            <strong>remember.</strong>
          </h1>

          <p>
            Your saved EventHub experiences,
            all in one place.
          </p>
        </div>

        <div className="saved-count">
          <strong>{savedEvents.length}</strong>
          <span>Saved</span>
        </div>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="saved-message">
          {message}
        </div>
      )}

      {/* EVENTS */}

      {savedEvents.length > 0 ? (

        <div className="saved-events-grid">

          {savedEvents.map((event, index) => (

            <article
              className="saved-event-card"
              key={event._id}
            >

              {/* POSTER */}

              <div
                className={`saved-poster saved-poster-${
                  index % 6
                }`}
              >

                <span className="saved-category">
                  {event.category}
                </span>

                <button
                  className="saved-heart"
                  onClick={() =>
                    handleUnsave(event)
                  }
                  title="Remove from saved events"
                >
                  ♥
                </button>

                <div className="saved-poster-content">

                  <small>EVENTHUB</small>

                  <h2>
                    {event.title}
                  </h2>

                  <div>
                    📅 {event.date}
                  </div>

                  <div>
                    📍 {event.location}
                  </div>

                </div>

              </div>

              {/* DETAILS */}

              <div className="saved-event-details">

                <div className="saved-creator">

                  <div className="saved-avatar">
                    {(event.createdBy?.username ||
                      "E")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <small>Created by</small>

                    <strong>
                      {event.createdBy?.username ||
                        "EventHub User"}
                    </strong>
                  </div>

                </div>

                <p>
                  {event.description ||
                    `Join us for an amazing ${event.category} experience.`}
                </p>

                <div className="saved-meta">

                  <span>
                    📅 {event.date}
                  </span>

                  <span>
                    📍 {event.location}
                  </span>

                </div>

                <div className="saved-actions">

                  <button
                    className="saved-view-btn"
                    onClick={() =>
                      onViewEvent(event)
                    }
                  >
                    View Event →
                  </button>

                  <button
                    className="saved-remove-btn"
                    onClick={() =>
                      handleUnsave(event)
                    }
                  >
                    ♥ Saved
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

      ) : (

        <div className="saved-empty">

          <div className="saved-empty-icon">
            ♡
          </div>

          <span>YOUR SAVED EVENTS</span>

          <h2>
            Nothing saved yet.
          </h2>

          <p>
            When you find an event you love,
            tap the ♡ button to save it here.
          </p>

          <button
            className="saved-explore-btn"
            onClick={() =>
              window.history.back()
            }
          >
            Explore Events →
          </button>

        </div>

      )}

    </div>
  );
}

export default SavedEvents;