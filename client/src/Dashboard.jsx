import { useEffect, useState } from "react";

import ExploreEvents from "./ExploreEvents";
import EventDetails from "./EventDetails";
import EventEditor from "./EventEditor";
import MyEvents from "./MyEvents";
import SavedEvents from "./SavedEvents";
import Notifications from "./Notifications";
import Profile from "./Profile";
import AttendeeManagement from "./AttendeeManagement";

import "./Dashboard.css";

function Dashboard() {
  const [page, setPage] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const username = loggedInUser?.username || "there";

  /* =====================================================
     LOAD EVENTS
  ===================================================== */

  const loadEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Events loading error:", error);
    }
  };

  /* =====================================================
     LOAD NOTIFICATION COUNT
  ===================================================== */

  const loadNotificationCount = async () => {
    if (!loggedInUser?.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${loggedInUser.id}`
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const unread = data.filter(
          (notification) => !notification.read
        ).length;

        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error(
        "Notification count loading error:",
        error
      );
    }
  };

  useEffect(() => {
    loadEvents();
    loadNotificationCount();
  }, []);

  /* =====================================================
     VIEW EVENT
  ===================================================== */

  const handleViewEvent = (event, from = "dashboard") => {
    setSelectedEvent({
      ...event,
      _sourcePage: from,
    });

    setPage("eventDetails");
  };

  /* =====================================================
     EDIT EVENT
  ===================================================== */

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setPage("editEvent");
  };

  /* =====================================================
     ATTENDEE MANAGEMENT
  ===================================================== */

  const handleManageAttendees = (event) => {
    setSelectedEvent(event);
    setPage("attendees");
  };

  /* =====================================================
     DELETE EVENT
  ===================================================== */

  const handleDeleteEvent = async (event) => {
    const confirmDelete = window.confirm(
      `Delete "${event.title}" permanently?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            createdBy: loggedInUser?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Event delete nahi hua.");
        return;
      }

      setEvents((oldEvents) =>
        oldEvents.filter(
          (item) => item._id !== event._id
        )
      );

      setSelectedEvent(null);
      setPage("myEvents");

      loadNotificationCount();
    } catch (error) {
      console.error(error);
      alert("Server se connection nahi ho raha.");
    }
  };

  /* =====================================================
     EVENT DETAILS PAGE
  ===================================================== */

  if (page === "eventDetails") {
    return (
      <EventDetails
        event={selectedEvent}
        onBack={() => {
          const source =
            selectedEvent?._sourcePage || "dashboard";

          setSelectedEvent(null);
          setPage(source);
        }}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onManageAttendees={handleManageAttendees}
      />
    );
  }

  /* =====================================================
     ATTENDEE MANAGEMENT PAGE
  ===================================================== */

  if (page === "attendees") {
    return (
      <AttendeeManagement
        eventId={selectedEvent?._id}
        onBack={() => {
          setPage("eventDetails");
        }}
      />
    );
  }

  /* =====================================================
     SAVED EVENTS PAGE
  ===================================================== */

  if (page === "savedEvents") {
    return (
      <SavedEvents
        onBack={() => setPage("dashboard")}
        onViewEvent={(event) =>
          handleViewEvent(event, "savedEvents")
        }
      />
    );
  }

  /* =====================================================
     NOTIFICATIONS PAGE
  ===================================================== */

  if (page === "notifications") {
    return (
      <Notifications
        onBack={() => {
          loadNotificationCount();
          setPage("dashboard");
        }}
        onViewEvent={(event) => {
          loadNotificationCount();
          handleViewEvent(event, "notifications");
        }}
      />
    );
  }

  /* =====================================================
     PROFILE PAGE
  ===================================================== */

  if (page === "profile") {
    return (
      <Profile
        onBack={() => setPage("dashboard")}
      />
    );
  }

  /* =====================================================
     DISCOVER PAGE
  ===================================================== */

  if (page === "explore") {
    return (
      <div className="dashboard-full-page">
        <ExploreEvents
          onViewEvent={(event) =>
            handleViewEvent(event, "explore")
          }
        />
      </div>
    );
  }

  /* =====================================================
     CREATE EVENT PAGE
  ===================================================== */

  if (page === "createEvent") {
    return (
      <EventEditor
        onBack={() => setPage("dashboard")}
        onSaved={() => {
          loadEvents();
          setSelectedEvent(null);
          setPage("myEvents");
        }}
      />
    );
  }

  /* =====================================================
     MY EVENTS PAGE
  ===================================================== */

  if (page === "myEvents") {
    return (
      <MyEvents
        onBack={() => setPage("dashboard")}
        onViewEvent={(event) =>
          handleViewEvent(event, "myEvents")
        }
        onEditEvent={handleEditEvent}
      />
    );
  }

  /* =====================================================
     EDIT EVENT PAGE
  ===================================================== */

  if (page === "editEvent") {
    return (
      <EventEditor
        event={selectedEvent}
        onBack={() => {
          setSelectedEvent(null);
          setPage("myEvents");
        }}
        onSaved={() => {
          loadEvents();
          setSelectedEvent(null);
          setPage("myEvents");
        }}
      />
    );
  }

  /* =====================================================
     PEOPLE DATA
  ===================================================== */

  const organizers = [];

  events.forEach((event) => {
    const organizer = event.createdBy;

    if (!organizer?._id) return;

    const existing = organizers.find(
      (item) =>
        String(item.id) === String(organizer._id)
    );

    if (existing) {
      existing.eventCount += 1;

      if (!existing.events.includes(event._id)) {
        existing.events.push(event._id);
      }
    } else {
      organizers.push({
        id: organizer._id,
        username:
          organizer.username || "Event Organizer",
        eventCount: 1,
        events: [event._id],
      });
    }
  });

  /* =====================================================
     PEOPLE PAGE
  ===================================================== */

  if (page === "people") {
    return (
      <div className="dashboard-page">

        {/* NAVBAR */}

        <header className="dashboard-navbar">

          <div
            className="dashboard-brand"
            onClick={() => setPage("dashboard")}
          >
            <div className="dashboard-brand-icon">
              E
            </div>

            <div>
              <strong>EventHub</strong>

              <span>
                CREATE • DISCOVER • CONNECT
              </span>
            </div>
          </div>

          <nav className="dashboard-nav">

            <button
              onClick={() => setPage("dashboard")}
            >
              Home
            </button>

            <button
              onClick={() => setPage("explore")}
            >
              Explore
            </button>

            <button
              className="active"
              onClick={() => setPage("people")}
            >
              People
            </button>

            <button
              onClick={() => setPage("myEvents")}
            >
              My Events
            </button>

            <button
              onClick={() => setPage("savedEvents")}
            >
              Saved
            </button>

            <button
              className="notification-nav-button"
              onClick={() => setPage("notifications")}
            >
              Notifications

              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 99
                    ? "99+"
                    : unreadNotifications}
                </span>
              )}
            </button>

          </nav>

          {/* PROFILE BUTTON */}

          <button
            type="button"
            className="dashboard-profile"
            onClick={() => setPage("profile")}
          >
            <div className="dashboard-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <small>Welcome back</small>
              <strong>{username}</strong>
            </div>
          </button>

        </header>

        <main className="dashboard-main">

          {/* HERO */}

          <section className="dashboard-hero">

            <div className="dashboard-hero-content">

              <span className="dashboard-eyebrow">
                EVENTHUB COMMUNITY
              </span>

              <h1>
                Meet the
                <br />
                <span>organizers.</span>
              </h1>

              <p>
                Discover people creating experiences
                and events on EventHub.
              </p>

              <div className="dashboard-hero-actions">

                <button
                  className="primary-dashboard-btn"
                  onClick={() => setPage("explore")}
                >
                  Explore Events →
                </button>

              </div>

            </div>

            <div className="dashboard-hero-art">

              <div className="hero-art-circle circle-one"></div>
              <div className="hero-art-circle circle-two"></div>

              <div className="hero-event-card">

                <div className="hero-card-top">
                  <span>EVENTHUB</span>
                  <span>PEOPLE</span>
                </div>

                <div className="hero-card-center">

                  <small>CREATE</small>

                  <strong>
                    MEET
                    <br />
                    PEOPLE
                  </strong>

                </div>

                <div className="hero-card-bottom">
                  <span>CREATE</span>
                  <span>CONNECT</span>
                  <span>EXPERIENCE</span>
                </div>

              </div>

            </div>

          </section>

          {/* ORGANIZERS */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <span>ORGANIZERS</span>

              <h2>
                People behind EventHub events.
              </h2>

            </div>

            {loadingPeople ? (

              <div className="dashboard-empty-state">
                Loading people...
              </div>

            ) : organizers.length === 0 ? (

              <div className="dashboard-empty-state">

                <h3>
                  No organizers yet
                </h3>

                <p>
                  Be the first person to create an
                  EventHub event.
                </p>

                <button
                  className="primary-dashboard-btn"
                  onClick={() =>
                    setPage("createEvent")
                  }
                >
                  ＋ Create Event
                </button>

              </div>

            ) : (

              <div className="quick-action-grid">

                {organizers.map((organizer) => (

                  <button
                    key={organizer.id}
                    className="quick-action-card"
                    onClick={() => {

                      const organizerEvent =
                        events.find(
                          (event) =>
                            String(
                              event.createdBy?._id
                            ) ===
                            String(organizer.id)
                        );

                      if (organizerEvent) {
                        handleViewEvent(
                          organizerEvent,
                          "people"
                        );
                      }

                    }}
                  >

                    <div className="dashboard-avatar">
                      {organizer.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3>
                        {organizer.username}
                      </h3>

                      <p>
                        {organizer.eventCount}{" "}
                        {organizer.eventCount === 1
                          ? "event"
                          : "events"}{" "}
                        created
                      </p>

                    </div>

                    <span className="quick-arrow">
                      →
                    </span>

                  </button>

                ))}

              </div>

            )}

          </section>

        </main>

      </div>
    );
  }

  /* =====================================================
     HOME PAGE
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <header className="dashboard-navbar">

        <div
          className="dashboard-brand"
          onClick={() => setPage("dashboard")}
        >
          <div className="dashboard-brand-icon">
            E
          </div>

          <div>
            <strong>EventHub</strong>

            <span>
              CREATE • DISCOVER • CONNECT
            </span>
          </div>
        </div>

        <nav className="dashboard-nav">

          <button
            className="active"
            onClick={() => setPage("dashboard")}
          >
            Home
          </button>

          <button
            onClick={() => setPage("explore")}
          >
            Explore
          </button>

          <button
            onClick={() => setPage("people")}
          >
            People
          </button>

          <button
            onClick={() => setPage("myEvents")}
          >
            My Events
          </button>

          <button
            onClick={() => setPage("savedEvents")}
          >
            Saved
          </button>

          <button
            className="notification-nav-button"
            onClick={() => setPage("notifications")}
          >
            🔔 Notifications

            {unreadNotifications > 0 && (
              <span className="notification-badge">
                {unreadNotifications > 99
                  ? "99+"
                  : unreadNotifications}
              </span>
            )}
          </button>

        </nav>

        {/* PROFILE BUTTON */}

        <button
          type="button"
          className="dashboard-profile"
          onClick={() => setPage("profile")}
        >
          <div className="dashboard-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <small>Welcome back</small>
            <strong>{username}</strong>
          </div>
        </button>

      </header>

      <main className="dashboard-main">

        {/* HERO */}

        <section className="dashboard-hero">

          <div className="dashboard-hero-content">

            <span className="dashboard-eyebrow">
              YOUR EVENT SPACE
            </span>

            <h1>
              Make something
              <br />
              <span>worth attending.</span>
            </h1>

            <p>
              Discover experiences, create your own
              events and bring people together on
              EventHub.
            </p>

            <div className="dashboard-hero-actions">

              <button
                className="primary-dashboard-btn"
                onClick={() => setPage("createEvent")}
              >
                <span>＋</span>
                Create an Event
              </button>

              <button
                className="secondary-dashboard-btn"
                onClick={() => setPage("explore")}
              >
                Explore Events
                <span>→</span>
              </button>

            </div>

          </div>

          <div className="dashboard-hero-art">

            <div className="hero-art-circle circle-one"></div>
            <div className="hero-art-circle circle-two"></div>

            <div className="hero-event-card">

              <div className="hero-card-top">
                <span>EVENTHUB</span>
                <span>LIVE</span>
              </div>

              <div className="hero-card-center">

                <small>YOUR NEXT</small>

                <strong>
                  GREAT
                  <br />
                  EVENT
                </strong>

              </div>

              <div className="hero-card-bottom">
                <span>DISCOVER</span>
                <span>CONNECT</span>
                <span>EXPERIENCE</span>
              </div>

            </div>

          </div>

        </section>

        {/* ACTIONS */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>YOUR EVENTHUB</span>

            <h2>
              What do you want to do?
            </h2>

          </div>

          <div className="quick-action-grid">

            {/* DISCOVER */}

            <button
              className="quick-action-card"
              onClick={() => setPage("explore")}
            >

              <div className="quick-icon">
                ↗
              </div>

              <div>
                <h3>Discover</h3>

                <p>
                  Explore real events created
                  by the EventHub community.
                </p>
              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

            {/* DESIGN */}

            <button
              className="quick-action-card featured"
              onClick={() => setPage("createEvent")}
            >

              <div className="quick-icon">
                ✦
              </div>

              <div>
                <h3>Design</h3>

                <p>
                  Create an event and design
                  its professional poster.
                </p>
              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

            {/* PEOPLE */}

            <button
              className="quick-action-card"
              onClick={() => setPage("people")}
            >

              <div className="quick-icon">
                ◉
              </div>

              <div>
                <h3>People</h3>

                <p>
                  Meet organizers and discover
                  event communities.
                </p>
              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

            {/* MY SPACE */}

            <button
              className="quick-action-card"
              onClick={() => setPage("myEvents")}
            >

              <div className="quick-icon">
                ▣
              </div>

              <div>
                <h3>My Space</h3>

                <p>
                  Manage your created events
                  and event activity.
                </p>
              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

            {/* SAVED */}

            <button
              className="quick-action-card"
              onClick={() => setPage("savedEvents")}
            >

              <div className="quick-icon">
                ♡
              </div>

              <div>
                <h3>Saved Events</h3>

                <p>
                  Keep your favorite events
                  ready for later.
                </p>
              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

            {/* NOTIFICATIONS */}

            <button
              className="quick-action-card notification-action-card"
              onClick={() => setPage("notifications")}
            >

              <div className="quick-icon">
                🔔
              </div>

              <div>

                <h3>
                  Notifications

                  {unreadNotifications > 0 && (
                    <span className="notification-inline-count">
                      {unreadNotifications}
                    </span>
                  )}

                </h3>

                <p>
                  See updates, joins and activity
                  from your events.
                </p>

              </div>

              <span className="quick-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* STATS */}

        <section className="dashboard-stats">

          <div className="dashboard-stat">

            <span>
              01 • DISCOVER
            </span>

            <strong>
              Find
            </strong>

            <p>
              Discover events from the community.
            </p>

          </div>

          <div className="dashboard-stat">

            <span>
              02 • DESIGN
            </span>

            <strong>
              Create
            </strong>

            <p>
              Build and customize your event.
            </p>

          </div>

          <div className="dashboard-stat">

            <span>
              03 • CONNECT
            </span>

            <strong>
              Meet
            </strong>

            <p>
              Discover people behind events.
            </p>

          </div>

          <div className="dashboard-stat dark">

            <span>
              04 • MY SPACE
            </span>

            <strong>
              Manage
            </strong>

            <p>
              Manage your own EventHub events.
            </p>

          </div>

        </section>

        {/* DISCOVER PREVIEW */}

        <section className="dashboard-events-section">

          <div className="dashboard-events-heading">

            <div>

              <span>
                DISCOVER
              </span>

              <h2>
                Events worth showing up for.
              </h2>

            </div>

            <button
              onClick={() => setPage("explore")}
            >
              View all events →
            </button>

          </div>

          <ExploreEvents
            onViewEvent={(event) =>
              handleViewEvent(
                event,
                "dashboard"
              )
            }
          />

        </section>

        {/* CREATE CTA */}

        <section className="dashboard-section">

          <div className="dashboard-events-heading">

            <div>

              <span>
                CREATE
              </span>

              <h2>
                Have an event in mind?
              </h2>

              <p>
                Turn your idea into a real
                EventHub experience.
              </p>

            </div>

            <button
              className="primary-dashboard-btn"
              onClick={() =>
                setPage("createEvent")
              }
            >
              ＋ Create Event →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;