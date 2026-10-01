
import { useEffect, useState } from "react";
import "./Notifications.css";

function Notifications({ onBack, onViewEvent }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // ================================
  // LOAD NOTIFICATIONS
  // ================================
  const loadNotifications = async () => {
    if (!loggedInUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/notifications/${loggedInUser.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Notifications load nahi hui."
        );
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification load error:", error);
      setMessage("Notifications load nahi hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ================================
  // MARK ONE AS READ
  // ================================
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Notification read nahi hui."
        );
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark read error:", error);
      setMessage("Notification update nahi hui.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  // ================================
  // MARK ALL AS READ
  // ================================
  const markAllAsRead = async () => {
    if (!loggedInUser?.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${loggedInUser.id}/read-all`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Notifications update nahi hui."
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setMessage("All notifications marked as read.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Mark all read error:", error);
      setMessage("Notifications update nahi hui.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  // ================================
  // DELETE NOTIFICATION
  // ================================
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Notification delete nahi hui."
        );
      }

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );

      setMessage("Notification deleted.");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Delete notification error:", error);
      setMessage("Notification delete nahi hui.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  // ================================
  // CLICK NOTIFICATION
  // ================================
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.event && onViewEvent) {
      onViewEvent(notification.event);
    }
  };

  // ================================
  // UNREAD COUNT
  // ================================
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // ================================
  // FORMAT DATE
  // ================================
  const formatDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ================================
  // NOTIFICATION TYPE
  // ================================
  const getNotificationType = (type) => {
    if (type === "event_join") {
      return "EVENT JOINED";
    }

    if (type === "event_leave") {
      return "EVENT LEFT";
    }

    if (type === "event_update") {
      return "EVENT UPDATED";
    }

    return "EVENT ACTIVITY";
  };

  // ================================
  // NOTIFICATION ICON
  // ================================
  const getNotificationIcon = (type) => {
    if (type === "event_join") {
      return "↗";
    }

    if (type === "event_leave") {
      return "↙";
    }

    if (type === "event_update") {
      return "✦";
    }

    return "•";
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="notifications-page">

      {/* ================= HEADER ================= */}
      <div className="notifications-header">

        <button
          className="notifications-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="notifications-heading">

          <span className="notifications-eyebrow">
            EVENTHUB • ACTIVITY
          </span>

          <h1>Notifications</h1>

          <p>
            Stay updated with everything happening around
            your events.
          </p>

        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}

      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <div className="notification-message">
          {message}
        </div>
      )}

      {/* ================= SUMMARY ================= */}
      <div className="notification-summary">

        <div className="summary-box">

          <span className="summary-number">
            {notifications.length}
          </span>

          <span className="summary-label">
            Total notifications
          </span>

        </div>

        <div className="summary-box">

          <span className="summary-number unread-number">
            {unreadCount}
          </span>

          <span className="summary-label">
            Unread
          </span>

        </div>

      </div>

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="notifications-state">

          <div className="notification-loader"></div>

          <h3>
            Loading notifications...
          </h3>

          <p>
            Please wait a moment.
          </p>

        </div>

      ) : notifications.length === 0 ? (

        /* ================= EMPTY ================= */

        <div className="notifications-empty">

          <div className="empty-icon">
            ✓
          </div>

          <span className="notifications-eyebrow">
            ALL CLEAR
          </span>

          <h2>
            No notifications yet
          </h2>

          <p>
            When someone joins your event or an event
            gets updated, you'll see it here.
          </p>

          <button onClick={onBack}>
            Back to Dashboard
          </button>

        </div>

      ) : (

        /* ================= NOTIFICATION LIST ================= */

        <div className="notifications-list">

          {notifications.map((notification) => (

            <div
              key={notification._id}
              className={`notification-card ${
                notification.read
                  ? "read"
                  : "unread"
              }`}
            >

              {/* Notification Content */}

              <button
                className="notification-content"
                onClick={() =>
                  handleNotificationClick(notification)
                }
              >

                <div className="notification-icon">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-main">

                  <div className="notification-top">

                    <span className="notification-type">
                      {getNotificationType(
                        notification.type
                      )}
                    </span>

                    {!notification.read && (
                      <span className="unread-dot"></span>
                    )}

                  </div>

                  <h3>
                    {notification.message}
                  </h3>

                  {notification.event && (
                    <div className="notification-event">

                      <strong>
                        {notification.event.title}
                      </strong>

                      {notification.event.location && (
                        <span>
                          •{" "}
                          {notification.event.location}
                        </span>
                      )}

                    </div>
                  )}

                  {notification.sender && (
                    <p className="notification-sender">
                      From{" "}
                      <strong>
                        {notification.sender.username}
                      </strong>
                    </p>
                  )}

                  <span className="notification-time">
                    {formatDate(
                      notification.createdAt
                    )}
                  </span>

                </div>

              </button>

              {/* Delete */}

              <button
                className="delete-notification"
                onClick={() =>
                  deleteNotification(
                    notification._id
                  )
                }
                title="Delete notification"
              >
                ×
              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Notifications;

