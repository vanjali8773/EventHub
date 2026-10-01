import { useEffect, useState } from "react";
import "./AttendeeManagement.css";

function AttendeeManagement({ eventId, onBack }) {
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const loadAttendees = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Event load nahi hua.");
        return;
      }

      setEvent(data);

      // Attendees populated hain to directly use honge
      if (Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
      } else {
        setAttendees([]);
      }
    } catch (error) {
      console.error("Attendees load error:", error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadAttendees();
    }
  }, [eventId]);

  const isOrganizer =
    event &&
    loggedInUser &&
    event.createdBy &&
    (event.createdBy._id === loggedInUser.id ||
      event.createdBy === loggedInUser.id);

  if (loading) {
    return (
      <div className="attendee-page">
        <div className="attendee-loading">
          <div className="attendee-loader"></div>
          <h3>Loading attendees...</h3>
          <p>Please wait while we get the attendee list.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="attendee-page">
        <div className="attendee-empty">
          <div className="attendee-empty-icon">!</div>
          <h2>Event not found</h2>
          <p>
            We couldn't find the event you're looking for.
          </p>

          <button
            type="button"
            className="attendee-back-btn"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="attendee-page">
        <div className="attendee-empty">
          <div className="attendee-empty-icon">🔒</div>

          <h2>Organizer access only</h2>

          <p>
            Only the event organizer can view the attendee list.
          </p>

          <button
            type="button"
            className="attendee-back-btn"
            onClick={onBack}
          >
            ← Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendee-page">
      {/* HEADER */}
      <header className="attendee-header">
        <button
          type="button"
          className="attendee-back-link"
          onClick={onBack}
        >
          ← Back to Event
        </button>

        <div className="attendee-heading">
          <span className="attendee-eyebrow">
            EVENTHUB · ATTENDEES
          </span>

          <h1>Who's attending?</h1>

          <p>
            Manage and view the people who joined your event.
          </p>
        </div>
      </header>

      {/* EVENT SUMMARY */}
      <section className="attendee-event-card">
        <div className="attendee-event-info">
          <span className="attendee-category">
            {event.category || "EVENT"}
          </span>

          <h2>{event.title}</h2>

          <div className="attendee-event-meta">
            <span>📅 {event.date}</span>
            <span>📍 {event.location}</span>
          </div>
        </div>

        <div className="attendee-count-box">
          <strong>{attendees.length}</strong>
          <span>
            {attendees.length === 1
              ? "Attendee"
              : "Attendees"}
          </span>
        </div>
      </section>

      {/* MESSAGE */}
      {message && (
        <div className="attendee-message">
          {message}
        </div>
      )}

      {/* ATTENDEE SECTION */}
      <section className="attendee-list-section">
        <div className="attendee-list-header">
          <div>
            <span>YOUR EVENT</span>
            <h2>Attendee list</h2>
          </div>

          <button
            type="button"
            className="attendee-refresh"
            onClick={loadAttendees}
          >
            ↻ Refresh
          </button>
        </div>

        {attendees.length === 0 ? (
          <div className="attendee-no-data">
            <div className="no-data-icon">◎</div>

            <h3>No attendees yet</h3>

            <p>
              People who join your event will appear here.
            </p>
          </div>
        ) : (
          <div className="attendee-list">
            {attendees.map((attendee, index) => {
              const username =
                attendee?.username ||
                attendee?.name ||
                `Attendee ${index + 1}`;

              const email =
                attendee?.email || "Email not available";

              const photo =
                attendee?.profilePhoto || "";

              return (
                <div
                  className="attendee-row"
                  key={attendee?._id || index}
                >
                  <div className="attendee-avatar">
                    {photo ? (
                      <img
                        src={photo}
                        alt={username}
                      />
                    ) : (
                      <span>
                        {username
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="attendee-user-info">
                    <h3>{username}</h3>
                    <p>{email}</p>
                  </div>

                  <div className="attendee-number">
                    #{String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AttendeeManagement;