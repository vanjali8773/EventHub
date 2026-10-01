import { useEffect, useState } from "react";
import "./EventDetails.css";

function EventDetails({
  event,
  onBack,
  onEditEvent,
  onDeleteEvent,
  onOpenLiveRoom,
  onManageAttendees,
}) {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [joining, setJoining] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurrentEvent(event);
    setMessage("");
  }, [event]);

  if (!currentEvent) {
    return (
      <div className="event-pro-page">
        <div className="event-not-found">
          <div className="not-found-icon">01</div>
          <h2>Event not found</h2>
          <p>The event you're looking for is unavailable.</p>

          <button onClick={onBack}>
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId =
    loggedInUser?.id || loggedInUser?._id;

  const creatorId =
    currentEvent.createdBy?._id ||
    currentEvent.createdBy?.id ||
    currentEvent.createdBy;

  const isOwner =
    userId &&
    creatorId &&
    String(userId) === String(creatorId);

  const status = currentEvent.status || "upcoming";

  const isLive = status === "live";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  const attendees = currentEvent.attendees || [];

  const isJoined = attendees.some((attendee) => {
    const id =
      typeof attendee === "object"
        ? attendee._id || attendee.id
        : attendee;

    return String(id) === String(userId);
  });

  const organizer =
    currentEvent.createdBy?.username ||
    currentEvent.createdBy?.email ||
    "Event Organizer";

  const formattedDate = currentEvent.date
    ? new Date(currentEvent.date).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Date not available";

  const posterTheme =
    currentEvent.posterTheme || "peach";

  // ==========================================
  // JOIN / LEAVE
  // ==========================================

  const handleJoinLeave = async () => {
    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    if (isCompleted) {
      setMessage("This event has already ended.");
      return;
    }

    if (isCancelled) {
      setMessage("This event has been cancelled.");
      return;
    }

    try {
      setJoining(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/events/${currentEvent._id}/join`,
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
        setMessage(
          data.message ||
            "Unable to update attendance."
        );
        return;
      }

      setCurrentEvent(data.event || data);

      setMessage(
        isJoined
          ? "You left this event."
          : "You're registered for this event."
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setJoining(false);
    }
  };

  // ==========================================
  // START LIVE
  // ==========================================

  const handleStartLive = async () => {
    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    try {
      setLiveLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/events/${currentEvent._id}/start-live`,
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
        setMessage(
          data.message ||
            "Unable to start live event."
        );
        return;
      }

      setCurrentEvent(data.event);
      setMessage("Your event is live now.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to start live event.");
    } finally {
      setLiveLoading(false);
    }
  };

  // ==========================================
  // END LIVE
  // ==========================================

  const handleEndLive = async () => {
    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    try {
      setLiveLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/events/${currentEvent._id}/end-live`,
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
        setMessage(
          data.message ||
            "Unable to end live event."
        );
        return;
      }

      setCurrentEvent(data.event);
      setMessage("Live session ended successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to end live event.");
    } finally {
      setLiveLoading(false);
    }
  };

  // ==========================================
  // LIVE ROOM
  // ==========================================

  const handleLiveRoom = () => {
    if (!isLive) {
      setMessage("This event is not live right now.");
      return;
    }

    if (onOpenLiveRoom) {
      onOpenLiveRoom(currentEvent);
    } else {
      setMessage("Live room is not connected yet.");
    }
  };

  // ==========================================
  // SHARE
  // ==========================================

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentEvent.title,
          text: `Join ${currentEvent.title} on EventHub`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setMessage("Event link copied.");
      }
    } catch {
      console.log("Share cancelled.");
    }
  };

  // ==========================================
  // MANAGE ATTENDEES
  // ==========================================

  const handleManageAttendees = () => {
    if (!isOwner) {
      setMessage(
        "Only the event organizer can view attendees."
      );
      return;
    }

    if (onManageAttendees) {
      onManageAttendees(currentEvent);
    } else {
      setMessage(
        "Attendee Management is not connected yet."
      );
    }
  };

  return (
    <div className="event-pro-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="event-pro-header">

        <button
          className="pro-back-button"
          onClick={onBack}
        >
          <span>←</span>
          <span>My Events</span>
        </button>

        <div className="pro-logo">
          <span>Event</span>Hub
        </div>

        <button
          className="pro-share-button"
          onClick={handleShare}
        >
          Share
          <span>↗</span>
        </button>

      </header>

      {/* ======================================
          LIVE NOTIFICATION BAR
      ====================================== */}

      {isLive && (
        <div className="pro-live-strip">

          <div className="pro-live-strip-left">
            <span className="pro-live-indicator"></span>

            <strong>LIVE NOW</strong>

            <span>{currentEvent.title}</span>
          </div>

          <button onClick={handleLiveRoom}>
            Enter Live Room →
          </button>

        </div>
      )}

      <main className="event-pro-container">

        {/* ======================================
            BREADCRUMB
        ====================================== */}

        <div className="pro-breadcrumb">

          <button onClick={onBack}>
            My Space
          </button>

          <span>/</span>

          <button onClick={onBack}>
            My Events
          </button>

          <span>/</span>

          <strong>Event Details</strong>

        </div>

        {/* ======================================
            HERO
        ====================================== */}

        <section className="pro-hero">

          <div className="pro-hero-left">

            <div className="pro-category-row">

              <span className="pro-category">
                {currentEvent.category || "EVENT"}
              </span>

              <span
                className={`pro-status ${status}`}
              >
                {isLive && "LIVE"}

                {isCompleted && "COMPLETED"}

                {isCancelled && "CANCELLED"}

                {!isLive &&
                  !isCompleted &&
                  !isCancelled &&
                  "UPCOMING"}
              </span>

            </div>

            <h1>{currentEvent.title}</h1>

            <p className="pro-hero-description">
              {currentEvent.description ||
                "An experience created for the EventHub community."}
            </p>

            <div className="pro-hero-meta">

              <div className="pro-meta-item">

                <div className="pro-meta-icon">
                  <span>01</span>
                </div>

                <div>
                  <small>DATE & TIME</small>

                  <strong>
                    {formattedDate}
                  </strong>
                </div>

              </div>

              <div className="pro-meta-item">

                <div className="pro-meta-icon">
                  <span>02</span>
                </div>

                <div>
                  <small>LOCATION</small>

                  <strong>
                    {currentEvent.location}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          <div className="pro-hero-right">

            <div className="pro-attendees-number">
              <strong>{attendees.length}</strong>

              <span>
                PEOPLE
                <br />
                ATTENDING
              </span>
            </div>

          </div>

        </section>

        {/* ======================================
            MAIN AREA
        ====================================== */}

        <section className="pro-main-grid">

          {/* ====================================
              LEFT
          ==================================== */}

          <div className="pro-main-left">

            <div className="pro-section-heading">

              <div>
                <span>01 — EVENT PREVIEW</span>

                <h2>Event Poster</h2>
              </div>

              <div className="pro-heading-line"></div>

            </div>

            {/* POSTER */}

            <div className="pro-poster-wrapper">

              <div
                className={`pro-poster ${posterTheme}`}
              >

                <div className="poster-top">

                  <span>
                    {currentEvent.posterBadge ||
                      "EVENTHUB"}
                  </span>

                  <span>
                    {currentEvent.category}
                  </span>

                </div>

                <div className="poster-middle">

                  <div className="poster-small">
                    EVENT / EXPERIENCE
                  </div>

                  <h2>
                    {currentEvent.posterTitle ||
                      currentEvent.title}
                  </h2>

                  <p>
                    {currentEvent.posterSubtitle ||
                      "An experience worth remembering."}
                  </p>

                </div>

                <div className="poster-bottom">

                  <div>
                    <small>DATE</small>

                    <strong>
                      {currentEvent.date}
                    </strong>
                  </div>

                  <div>
                    <small>LOCATION</small>

                    <strong>
                      {currentEvent.location}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            {/* ABOUT */}

            <div className="pro-about">

              <div className="pro-section-heading">

                <div>
                  <span>02 — ABOUT</span>

                  <h2>
                    What to expect
                  </h2>
                </div>

                <div className="pro-heading-line"></div>

              </div>

              <p>
                {currentEvent.description ||
                  "No additional information has been provided for this event."}
              </p>

            </div>

          </div>

          {/* ====================================
              RIGHT SIDEBAR
          ==================================== */}

          <aside className="pro-sidebar">

            {/* ACTION */}

            <div className="pro-action-card">

              <div className="pro-card-top">
                <span>EVENT ACTION</span>

                <div className="pro-card-number">
                  01
                </div>
              </div>

              <h3>
                {isOwner
                  ? "Manage your event"
                  : isLive
                  ? "Join the live event"
                  : "Ready to join?"}
              </h3>

              {!isOwner && (
                <>
                  <button
                    className={
                      isJoined
                        ? "pro-leave"
                        : "pro-join"
                    }
                    onClick={handleJoinLeave}
                    disabled={
                      joining ||
                      isCompleted ||
                      isCancelled
                    }
                  >
                    {joining
                      ? "Processing..."
                      : isJoined
                      ? "✓ Registered"
                      : "Join Event"}
                  </button>

                  {isLive && isJoined && (
                    <button
                      className="pro-live-room"
                      onClick={handleLiveRoom}
                    >
                      Enter Live Room
                    </button>
                  )}
                </>
              )}

              {isOwner && (
                <div className="pro-owner-box">

                  <div className="pro-owner-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      You are the organizer
                    </strong>

                    <p>
                      Control and manage this event
                      from the organizer panel.
                    </p>
                  </div>

                </div>
              )}

              {message && (
                <div className="pro-message">
                  {message}
                </div>
              )}

            </div>

            {/* INFORMATION */}

            <div className="pro-info-card">

              <div className="pro-card-top">
                <span>EVENT INFORMATION</span>

                <div className="pro-card-number">
                  02
                </div>
              </div>

              <div className="pro-info-list">

                <div className="pro-info-item">

                  <span className="pro-info-index">
                    01
                  </span>

                  <div>
                    <small>DATE & TIME</small>

                    <strong>
                      {formattedDate}
                    </strong>
                  </div>

                </div>

                <div className="pro-info-item">

                  <span className="pro-info-index">
                    02
                  </span>

                  <div>
                    <small>LOCATION</small>

                    <strong>
                      {currentEvent.location}
                    </strong>
                  </div>

                </div>

                <div className="pro-info-item">

                  <span className="pro-info-index">
                    03
                  </span>

                  <div>
                    <small>ATTENDEES</small>

                    <strong>
                      {attendees.length} people
                    </strong>
                  </div>

                </div>

                <div className="pro-info-item">

                  <span className="pro-info-index">
                    04
                  </span>

                  <div>
                    <small>ORGANIZER</small>

                    <strong>
                      {organizer}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </aside>

        </section>

        {/* ======================================
            LIVE EVENT
        ====================================== */}

        {isLive && (
          <section className="pro-live-section">

            <div className="pro-live-section-content">

              <div className="pro-live-circle">
                <span></span>
              </div>

              <div>
                <span>LIVE EVENT</span>

                <h2>
                  This event is happening right now.
                </h2>

                <p>
                  Join the live room and participate
                  with other attendees.
                </p>
              </div>

            </div>

            <button onClick={handleLiveRoom}>
              Enter Live Room →
            </button>

          </section>
        )}

        {/* ======================================
            ORGANIZER PANEL
        ====================================== */}

        {isOwner && (
          <section className="pro-organizer">

            <div className="pro-section-heading">

              <div>
                <span>03 — ORGANIZER</span>

                <h2>
                  Manage your event
                </h2>
              </div>

              <div className="pro-heading-line"></div>

            </div>

            {/* ATTENDEE MANAGEMENT */}

            <div className="pro-live-control attendee-management-control">

              <div className="control-left">

                <div className="control-icon">
                  👥
                </div>

                <div>
                  <span>
                    ATTENDEE MANAGEMENT
                  </span>

                  <h3>
                    View your attendees
                  </h3>

                  <p>
                    See everyone who has joined
                    this event.
                  </p>
                </div>

              </div>

              <button
                className="pro-start-live"
                onClick={handleManageAttendees}
              >
                View Attendees →
              </button>

            </div>

            {/* UPCOMING */}

            {!isLive &&
              !isCompleted &&
              !isCancelled && (
                <div className="pro-live-control">

                  <div className="control-left">

                    <div className="control-icon">
                      LIVE
                    </div>

                    <div>
                      <span>
                        LIVE SESSION
                      </span>

                      <h3>
                        Start your event
                      </h3>

                      <p>
                        Start the live session when
                        the event begins.
                      </p>
                    </div>

                  </div>

                  <button
                    className="pro-start-live"
                    onClick={handleStartLive}
                    disabled={liveLoading}
                  >
                    {liveLoading
                      ? "Starting..."
                      : "Start Live Event"}
                  </button>

                </div>
              )}

            {/* LIVE */}

            {isLive && (
              <div className="pro-live-control active">

                <div className="control-left">

                  <div className="control-icon active">
                    LIVE
                  </div>

                  <div>
                    <span>
                      LIVE NOW
                    </span>

                    <h3>
                      Your event is live
                    </h3>

                    <p>
                      Attendees can join your live
                      event room.
                    </p>
                  </div>

                </div>

                <div className="pro-live-actions">

                  <button
                    className="pro-enter-live"
                    onClick={handleLiveRoom}
                  >
                    Enter Live Room
                  </button>

                  <button
                    className="pro-end-live"
                    onClick={handleEndLive}
                    disabled={liveLoading}
                  >
                    {liveLoading
                      ? "Ending..."
                      : "End Live"}
                  </button>

                </div>

              </div>
            )}

            {/* COMPLETED */}

            {isCompleted && (
              <div className="pro-completed">

                <span>✓</span>

                <div>
                  <strong>
                    Event completed
                  </strong>

                  <p>
                    This event has already ended.
                  </p>
                </div>

              </div>
            )}

            {/* EDIT DELETE */}

            <div className="pro-manage-buttons">

              <button
                className="pro-edit"
                onClick={() =>
                  onEditEvent(currentEvent)
                }
              >
                <span>✎</span>
                Edit Event
              </button>

              <button
                className="pro-delete"
                onClick={() =>
                  onDeleteEvent(currentEvent)
                }
              >
                <span>×</span>
                Delete Event
              </button>

            </div>

          </section>
        )}

        {/* ======================================
            SHARE
        ====================================== */}

        <section className="pro-share-section">

          <div>

            <span>
              SHARE THE EXPERIENCE
            </span>

            <h2>
              Bring people together.
            </h2>

            <p>
              Invite your friends and community
              to this EventHub experience.
            </p>

          </div>

          <button onClick={handleShare}>
            Share Event
            <span>↗</span>
          </button>

        </section>

      </main>
    </div>
  );
}

export default EventDetails;