
import { useEffect, useState } from "react";
import "./Profile.css";

function Profile({ onBack }) {
  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // SAFE JSON RESPONSE
  // =====================================================

  const readResponse = async (response) => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error(
        "Server returned non-JSON response:",
        text
      );

      throw new Error(
        `Server returned an invalid response (${response.status}).`
      );
    }
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {
    if (!loggedInUser?.id) {
      setError("User information not found.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${loggedInUser.id}`
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Profile load nahi hui."
        );
      }

      setProfile(data);

      setUsername(data.username || "");
      setEmail(data.email || "");
      setProfilePhoto(data.profilePhoto || "");
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setError(
        error.message || "Profile load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  const loadEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await readResponse(response);

      if (response.ok && Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error(
        "Events loading error:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile();
    loadEvents();
  }, []);

  // =====================================================
  // OPEN EDIT MODE
  // =====================================================

  const handleEditProfile = () => {
    setError("");
    setMessage("");

    // Load latest saved values before opening editor
    setUsername(profile?.username || "");
    setEmail(profile?.email || "");
    setProfilePhoto(profile?.profilePhoto || "");

    setEditing(true);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditing(false);

    setError("");
    setMessage("");

    setUsername(profile?.username || "");
    setEmail(profile?.email || "");
    setProfilePhoto(profile?.profilePhoto || "");
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${loggedInUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            profilePhoto: profilePhoto.trim(),
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Profile update nahi hui."
        );
      }

      const updatedUser = data.user;

      setProfile(updatedUser);

      // Keep localStorage user updated
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUsername(updatedUser.username || "");
      setEmail(updatedUser.email || "");
      setProfilePhoto(
        updatedUser.profilePhoto || ""
      );

      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.message ||
          "Profile update nahi hui."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");

    window.location.reload();
  };

  // =====================================================
  // PROFILE EVENTS
  // =====================================================

  const userCreatedEvents = events.filter(
    (event) =>
      String(event.createdBy?._id) ===
      String(loggedInUser?.id)
  );

  const userJoinedEvents = events.filter(
    (event) =>
      Array.isArray(event.attendees) &&
      event.attendees.some(
        (attendee) =>
          String(
            attendee?._id || attendee
          ) === String(loggedInUser?.id)
      )
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>

          <h2>Loading your profile...</h2>

          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="profile-error-icon">
            !
          </div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            className="profile-primary-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="profile-page">

      {/* HEADER */}

      <header className="profile-header">

        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="profile-header-title">
          <span>EVENTHUB • ACCOUNT</span>

          <h1>My Profile</h1>
        </div>

        <button
          type="button"
          className="profile-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="profile-main">

        {/* PROFILE HERO */}

        <section className="profile-hero">

          <div className="profile-avatar-large">

            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <span>
                {(
                  profile?.username ||
                  username ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

          </div>

          <div className="profile-hero-info">

            <span className="profile-eyebrow">
              EVENTHUB MEMBER
            </span>

            <h2>
              {profile?.username || username}
            </h2>

            <p>
              {profile?.email || email}
            </p>

            <span className="profile-member">
              Member since{" "}
              {profile?.createdAt
                ? new Date(
                    profile.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "Recently"}
            </span>

          </div>

          {/* EDIT PROFILE BUTTON */}

          {!editing && (
            <button
              type="button"
              className="profile-edit-button"
              onClick={handleEditProfile}
            >
              ✎ Edit Profile
            </button>
          )}

        </section>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="profile-success-message">
            ✓ {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="profile-error-message">
            {error}
          </div>
        )}

        {/* STATS */}

        <section className="profile-stats">

          <div className="profile-stat-card">
            <span>CREATED</span>

            <strong>
              {userCreatedEvents.length}
            </strong>

            <p>Events created</p>
          </div>

          <div className="profile-stat-card">
            <span>JOINED</span>

            <strong>
              {userJoinedEvents.length}
            </strong>

            <p>Events joined</p>
          </div>

          <div className="profile-stat-card">
            <span>SAVED</span>

            <strong>
              {profile?.savedEvents?.length || 0}
            </strong>

            <p>Saved events</p>
          </div>

        </section>

        {/* EDIT PROFILE */}

        {editing && (
          <section className="profile-edit-section">

            <div className="profile-section-heading">

              <span>ACCOUNT SETTINGS</span>

              <h2>Edit your profile</h2>

              <p>
                Keep your EventHub information
                up to date.
              </p>

            </div>

            <form
              className="profile-form"
              onSubmit={handleSaveProfile}
            >

              <div className="profile-form-grid">

                {/* USERNAME */}

                <div className="profile-field">

                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                      )
                    }
                    placeholder="Enter username"
                  />

                </div>

                {/* EMAIL */}

                <div className="profile-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter email"
                  />

                </div>

              </div>

              {/* PROFILE PHOTO */}

              <div className="profile-field">

                <label>
                  Profile Photo URL
                </label>

                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(event) =>
                    setProfilePhoto(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/photo.jpg"
                />

                <small>
                  Paste a public image URL for
                  your profile photo.
                </small>

              </div>

              {/* ACTIONS */}

              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes →"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* ACCOUNT OVERVIEW */}

        {!editing && (
          <section className="profile-overview">

            <div className="profile-section-heading">

              <span>ACCOUNT</span>

              <h2>
                Your EventHub identity.
              </h2>

            </div>

            <div className="profile-info-list">

              <div className="profile-info-row">

                <span>
                  Username
                </span>

                <strong>
                  {profile?.username}
                </strong>

              </div>

              <div className="profile-info-row">

                <span>
                  Email
                </span>

                <strong>
                  {profile?.email}
                </strong>

              </div>

              <div className="profile-info-row">

                <span>
                  Events created
                </span>

                <strong>
                  {userCreatedEvents.length}
                </strong>

              </div>

              <div className="profile-info-row">

                <span>
                  Events joined
                </span>

                <strong>
                  {userJoinedEvents.length}
                </strong>

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Profile;
