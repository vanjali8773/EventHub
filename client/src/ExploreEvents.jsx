import { useEffect, useState } from "react";
import "./ExploreEvents.css";

function ExploreEvents({ onViewEvent }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);

  const [joiningEvent, setJoiningEvent] = useState(null);
  const [joinMessage, setJoinMessage] = useState("");

  const [savingEvent, setSavingEvent] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId = loggedInUser?.id;

  // ================================
  // LOAD EVENTS
  // ================================

  const loadEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await response.json();

      if (response.ok) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Events loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ================================
  // SAVED EVENT
  // ================================

  const isEventSaved = (event) => {
    return event.isSaved === true;
  };

  // ================================
  // SAVE / UNSAVE
  // ================================

  const handleSaveEvent = async (event) => {
    if (!userId) {
      setSaveMessage("Please login to save an event.");
      return;
    }

    const alreadySaved = isEventSaved(event);
    const action = alreadySaved ? "unsave" : "save";

    setSavingEvent(event._id);
    setSaveMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/${action}`,
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
          data.message || "Something went wrong."
        );
      }

      setEvents((previousEvents) =>
        previousEvents.map((item) =>
          item._id === event._id
            ? {
                ...item,
                isSaved: data.saved,
              }
            : item
        )
      );

      setSaveMessage(
        action === "save"
          ? "Event saved successfully! ♥"
          : "Event removed from saved events."
      );
    } catch (error) {
      console.error("Save/Unsave error:", error);

      setSaveMessage(
        error.message || "Unable to update saved event."
      );
    } finally {
      setSavingEvent(null);

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }
  };

  // ================================
  // JOIN / LEAVE
  // ================================

  const handleJoinLeave = async (event) => {
    if (!userId) {
      setJoinMessage("Please login to join an event.");
      return;
    }

    const isOwner =
      event.createdBy?._id &&
      String(event.createdBy._id) === String(userId);

    if (isOwner) {
      setJoinMessage("You are the organizer of this event.");
      return;
    }

    const attendees = event.attendees || [];

    const isJoined = attendees.some(
      (attendee) =>
        String(attendee?._id || attendee) === String(userId)
    );

    const action = isJoined ? "leave" : "join";

    setJoiningEvent(event._id);
    setJoinMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/${action}`,
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
          data.message || "Something went wrong."
        );
      }

      setEvents((previousEvents) =>
        previousEvents.map((item) =>
          item._id === event._id
            ? data.event
            : item
        )
      );

      setJoinMessage(
        action === "join"
          ? "You joined the event successfully!"
          : "You left the event."
      );
    } catch (error) {
      console.error("Join/Leave error:", error);

      setJoinMessage(
        error.message || "Unable to update event."
      );
    } finally {
      setJoiningEvent(null);

      setTimeout(() => {
        setJoinMessage("");
      }, 3000);
    }
  };

  // ================================
  // FILTER
  // ================================

  let filteredEvents = events.filter((event) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      event.title?.toLowerCase().includes(searchText) ||
      event.location?.toLowerCase().includes(searchText) ||
      event.category?.toLowerCase().includes(searchText) ||
      event.description?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" ||
      event.category === category;

    const matchesLocation =
      location === "All" ||
      event.location === location;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation
    );
  });

  // ================================
  // SORT
  // ================================

  if (sortBy === "latest") {
    filteredEvents = [...filteredEvents].reverse();
  }

  if (sortBy === "oldest") {
    filteredEvents = [...filteredEvents];
  }

  // ================================
  // LOCATIONS
  // ================================

  const locations = [
    "All",
    ...new Set(
      events
        .map((event) => event.location)
        .filter(Boolean)
    ),
  ];

  // ================================
  // STATUS
  // ================================

  const getStatus = (event) => {
    if (event.status) {
      return event.status.toLowerCase();
    }

    return "upcoming";
  };

  const getStatusLabel = (status) => {
    if (status === "live") return "● Live Now";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";

    return "Upcoming";
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="explore-page">
        <div className="explore-loading">
          <div className="loading-circle"></div>

          <p className="loading-small">
            EVENTHUB
          </p>

          <h2>Discovering events...</h2>

          <p>
            Finding experiences worth showing up for.
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <div className="explore-page">

      {/* HEADER */}

      <header className="explore-header">
        <div className="explore-heading">

          <span className="explore-badge">
            DISCOVER · CONNECT · EXPERIENCE
          </span>

          <h1>
            Find something
            <span> worth experiencing.</span>
          </h1>

          <p>
            Explore events, meet people and discover
            your next memorable experience.
          </p>

        </div>

        <div className="explore-header-number">
          <strong>
            {events.length}
          </strong>

          <span>
            EVENTS
            <br />
            DISCOVERED
          </span>
        </div>
      </header>

      {/* FILTER PANEL */}

      <section className="filter-panel">

        <div className="search-box">
          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search events, categories, locations..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="All">
            All Categories
          </option>

          <option value="Technology">
            Technology
          </option>

          <option value="Music">
            Music
          </option>

          <option value="Business">
            Business
          </option>

          <option value="Sports">
            Sports
          </option>

          <option value="Education">
            Education
          </option>

          <option value="Art & Culture">
            Art & Culture
          </option>
        </select>

        <select
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        >
          {locations.map((place) => (
            <option
              key={place}
              value={place}
            >
              {place === "All"
                ? "All Locations"
                : place}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="latest">
            Latest
          </option>

          <option value="oldest">
            Oldest
          </option>
        </select>

      </section>

      {/* RESULT ROW */}

      <div className="result-row">

        <div className="result-count">
          <span>
            Showing
          </span>

          <strong>
            {filteredEvents.length}
          </strong>

          <span>
            {filteredEvents.length === 1
              ? "event"
              : "events"}
          </span>
        </div>

        <button
          className="clear-filter"
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("All");
            setLocation("All");
            setSortBy("latest");
          }}
        >
          Reset filters
          <span>↗</span>
        </button>

      </div>

      {/* MESSAGES */}

      {(joinMessage || saveMessage) && (
        <div className="explore-message">
          <span>✦</span>

          <p>
            {joinMessage || saveMessage}
          </p>
        </div>
      )}

      {/* EVENTS */}

      {filteredEvents.length > 0 ? (

        <div className="poster-grid">

          {filteredEvents.map((event, index) => {

            const attendees =
              event.attendees || [];

            const isOwner =
              userId &&
              event.createdBy?._id &&
              String(event.createdBy._id) ===
                String(userId);

            const isJoined =
              attendees.some(
                (attendee) =>
                  String(
                    attendee?._id || attendee
                  ) === String(userId)
              );

            const isSaved =
              isEventSaved(event);

            const status =
              getStatus(event);

            return (
              <article
                className="event-poster-card"
                key={event._id || event.id}
              >

                {/* POSTER */}

                <div
                  className={`poster-image poster-${
                    index % 6
                  }`}
                >

                  <div className="poster-overlay"></div>

                  <div className="poster-top-row">

                    <span className="poster-category">
                      {event.category}
                    </span>

                    <span
                      className={`poster-status status-${status}`}
                    >
                      {getStatusLabel(status)}
                    </span>

                  </div>

                  {/* SAVE */}

                  <button
                    className={`poster-like ${
                      isSaved
                        ? "saved-event"
                        : ""
                    }`}
                    type="button"
                    onClick={() =>
                      handleSaveEvent(event)
                    }
                    disabled={
                      savingEvent === event._id
                    }
                    title={
                      isSaved
                        ? "Remove from saved events"
                        : "Save event"
                    }
                  >
                    {savingEvent === event._id
                      ? "..."
                      : isSaved
                      ? "♥"
                      : "♡"}
                  </button>

                  <div className="poster-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="poster-content">

                    <span className="poster-eyebrow">
                      EVENTHUB PRESENTS
                    </span>

                    <h2>
                      {event.title}
                    </h2>

                    <div className="poster-date">
                      <span>DATE</span>
                      {event.date}
                    </div>

                    <div className="poster-location">
                      <span>LOCATION</span>
                      {event.location}
                    </div>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="poster-details">

                  {/* CREATOR */}

                  <div className="creator">

                    <div className="creator-avatar">
                      {event.createdBy?.username
                        ?.charAt(0)
                        ?.toUpperCase() || "E"}
                    </div>

                    <div className="creator-info">

                      <small>
                        HOSTED BY
                      </small>

                      <strong>
                        {event.createdBy?.username ||
                          "EventHub User"}
                      </strong>

                    </div>

                    <div className="attendee-mini">
                      <strong>
                        {attendees.length}
                      </strong>

                      <span>
                        joined
                      </span>
                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <p className="event-description">
                    {event.description ||
                      `Join us for an amazing ${event.category} experience. Connect, discover and create unforgettable memories.`}
                  </p>

                  {/* META */}

                  <div className="event-meta">

                    <span>
                      <b>DATE</b>
                      {event.date}
                    </span>

                    <span>
                      <b>VENUE</b>
                      {event.location}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="poster-actions">

                    <button
                      className="view-event-btn"
                      type="button"
                      onClick={() =>
                        onViewEvent(event)
                      }
                    >
                      View Event
                      <span>→</span>
                    </button>

                    {!isOwner && (
                      <button
                        className={`join-event-btn ${
                          isJoined
                            ? "joined"
                            : ""
                        }`}
                        type="button"
                        onClick={() =>
                          handleJoinLeave(event)
                        }
                        disabled={
                          joiningEvent ===
                          event._id ||
                          status === "completed" ||
                          status === "cancelled"
                        }
                      >
                        {joiningEvent === event._id
                          ? "Please wait..."
                          : isJoined
                          ? "✓ Joined"
                          : status === "completed"
                          ? "Ended"
                          : status === "cancelled"
                          ? "Cancelled"
                          : "Join Event"}
                      </button>
                    )}

                    {isOwner && (
                      <button
                        className="join-event-btn organizer-btn"
                        type="button"
                        disabled
                      >
                        Your Event
                      </button>
                    )}

                    {/* SHARE */}

                    <button
                      className="share-event-btn"
                      type="button"
                      onClick={async () => {

                        const shareUrl =
                          `${window.location.origin}/event/${event._id}`;

                        try {
                          if (
                            navigator.share
                          ) {
                            await navigator.share({
                              title:
                                event.title,
                              text:
                                `Check out ${event.title} on EventHub`,
                              url:
                                shareUrl,
                            });
                          } else {
                            await navigator.clipboard.writeText(
                              shareUrl
                            );

                            alert(
                              "Event link copied! 🔗"
                            );
                          }
                        } catch (error) {
                          console.log(
                            "Share cancelled"
                          );
                        }
                      }}
                      title="Share Event"
                    >
                      ↗
                    </button>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      ) : (

        <div className="empty-events">

          <div className="empty-art">
            <span>EH</span>
          </div>

          <span className="empty-label">
            NOTHING HERE YET
          </span>

          <h2>
            No events found.
          </h2>

          <p>
            Try another search or clear your filters
            to discover more events.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setLocation("All");
              setSortBy("latest");
            }}
          >
            Clear all filters →
          </button>

        </div>

      )}

    </div>
  );
}

export default ExploreEvents;