
import { useEffect, useState } from "react";
import "./MyEvents.css";

function MyEvents({
  onBack,
  onViewEvent,
  onEditEvent,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  // ==========================================
  // LOAD MY EVENTS
  // ==========================================

  const loadMyEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage("Events load nahi ho rahe.");
        return;
      }

      const myEvents = data.filter(
        (event) =>
          String(event.createdBy?._id) ===
          String(loggedInUser?.id)
      );

      setEvents(myEvents);
    } catch (error) {
      console.error(error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  // ==========================================
  // DELETE EVENT
  // ==========================================

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            createdBy: loggedInUser.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Event delete nahi hua."
        );
        return;
      }

      setEvents((previousEvents) =>
        previousEvents.filter(
          (event) => event._id !== eventId
        )
      );

      setMessage("Event deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Server se connection nahi ho raha.");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="my-events-page">
        <button onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="my-events-loading">
          <h2>Loading your events...</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="my-events-page">

      {/* HEADER */}

      <div className="my-events-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div>
          <span className="my-events-badge">
            YOUR EVENTS
          </span>

          <h1>
            My Events 🎟️
          </h1>

          <p>
            Manage, edit and view the events you created.
          </p>
        </div>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="my-events-message">
          {message}
        </div>
      )}

      {/* NO EVENTS */}

      {events.length === 0 ? (
        <div className="no-my-events">

          <div className="no-event-icon">
            🎨
          </div>

          <h2>
            You haven't created any events yet.
          </h2>

          <p>
            Create your first event and design
            your own poster.
          </p>

          <button
            onClick={onBack}
            className="create-first-event"
          >
            ← Go Back & Create Event
          </button>

        </div>
      ) : (

        /* EVENTS */

        <div className="my-events-grid">

          {events.map((event, index) => (

            <div
              className="my-event-card"
              key={event._id}
            >

              {/* POSTER */}

              <div
                className={`my-event-poster poster-theme-${
                  event.posterTheme || "purple"
                } poster-layout-${
                  event.posterLayout || "classic"
                }`}
                style={{
                  "--accent":
                    event.accentColor || "#7c3aed",
                }}
              >

                <div className="poster-decoration one"></div>
                <div className="poster-decoration two"></div>

                <span className="my-event-category">
                  {event.category}
                </span>

                <div className="my-event-poster-content">

                  <h2>
                    {event.title}
                  </h2>

                  <p>
                    📅 {event.date}
                  </p>

                  <p>
                    📍 {event.location}
                  </p>

                </div>

              </div>

              {/* DETAILS */}

              <div className="my-event-details">

                <div className="my-event-info">

                  <div>
                    <small>Created by</small>

                    <strong>
                      {event.createdBy?.username ||
                        "You"}
                    </strong>
                  </div>

                  <span className="event-number">
                    #{index + 1}
                  </span>

                </div>

                <p className="my-event-description">
                  {event.description ||
                    "No description added for this event."}
                </p>

                {/* ACTIONS */}

              <div className="my-event-actions">

  <button
    className="view-my-event"
    onClick={() => onViewEvent(event)}
  >
    👁 View
  </button>

  <button
    className="edit-my-event"
    onClick={() => onEditEvent(event)}
  >
    ✏️ Edit
  </button>

  <button
    className="delete-my-event"
    onClick={() => handleDelete(event._id)}
  >
    🗑 Delete
  </button>

</div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MyEvents;

