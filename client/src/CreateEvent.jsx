import { useState } from "react";
import "./CreateEvent.css";

function CreateEvent({ onBack }) {
const loggedInUser = JSON.parse(
localStorage.getItem("user") || "null"
);

const [title, setTitle] = useState("");
const [date, setDate] = useState("");
const [location, setLocation] = useState("");
const [category, setCategory] = useState("Technology");
const [description, setDescription] = useState("");
const [message, setMessage] = useState("");
const [creating, setCreating] = useState(false);

const handleCreateEvent = async (e) => {
e.preventDefault();
setMessage("");

```
if (!loggedInUser) {
  setMessage("Please login first.");
  return;
}

setCreating(true);

try {
  const response = await fetch(
    "http://localhost:5000/api/events",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        location,
        category,
        description,
        createdBy: loggedInUser.id,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setMessage(
      data.message || "Event create nahi hua."
    );
    return;
  }

  setMessage("🎉 Event created successfully!");

  setTitle("");
  setDate("");
  setLocation("");
  setCategory("Technology");
  setDescription("");
} catch (error) {
  console.error(error);
  setMessage(
    "Server se connection nahi ho raha."
  );
} finally {
  setCreating(false);
}
```

};

return ( <div className="create-event-page">

```
  {/* HEADER */}

  <div className="create-event-header">

    <button
      className="create-event-back"
      onClick={onBack}
      type="button"
    >
      ← Back to Dashboard
    </button>

    <span className="create-event-badge">
      EVENTHUB · CREATE
    </span>

    <h1>
      Create your next
      <span> great event.</span>
    </h1>

    <p>
      Bring people together around something
      worth experiencing.
    </p>

  </div>

  {/* MAIN CONTENT */}

  <div className="create-event-layout">

    {/* FORM CARD */}

    <div className="create-event-form-card">

      <div className="form-card-heading">
        <div>
          <span>EVENT DETAILS</span>

          <h2>
            Tell us about your event
          </h2>
        </div>

        <div className="form-step">
          01
        </div>
      </div>

      <form onSubmit={handleCreateEvent}>

        {/* EVENT NAME */}

        <div className="form-field full-width">

          <label>
            Event name
          </label>

          <input
            type="text"
            placeholder="e.g. Future of Artificial Intelligence"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

        </div>

        {/* DATE + CATEGORY */}

        <div className="form-row">

          <div className="form-field">

            <label>
              Event date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />

          </div>

          <div className="form-field">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
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

          </div>

        </div>

        {/* LOCATION */}

        <div className="form-field full-width">

          <label>
            Location
          </label>

          <input
            type="text"
            placeholder="e.g. Convention Centre, Lucknow"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            required
          />

        </div>

        {/* DESCRIPTION */}

        <div className="form-field full-width">

          <div className="label-with-count">

            <label>
              Event description
            </label>

            <span>
              {description.length}/500
            </span>

          </div>

          <textarea
            placeholder="Tell people what makes this event worth attending..."
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setDescription(e.target.value);
              }
            }}
            rows="6"
            required
          />

        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`create-event-message ${
              message.includes("successfully")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          className="create-event-submit"
          disabled={creating}
        >
          {creating
            ? "Creating Event..."
            : "Create Event →"}
        </button>

      </form>

    </div>

    {/* PREVIEW / INFORMATION */}

    <aside className="create-event-side">

      <div className="create-preview-card">

        <div className="preview-top">

          <span>
            EVENT PREVIEW
          </span>

          <span className="preview-dot">
            ●
          </span>

        </div>

        <div className="preview-poster">

          <div className="preview-category">
            {category || "CATEGORY"}
          </div>

          <div className="preview-content">

            <h3>
              {title ||
                "Your Event Title"}
            </h3>

            <p>
              📅{" "}
              {date ||
                "Choose an event date"}
            </p>

            <p>
              📍{" "}
              {location ||
                "Add your event location"}
            </p>

          </div>

          <div className="preview-decoration preview-one" />
          <div className="preview-decoration preview-two" />

        </div>

        <div className="preview-description">

          <span>
            ABOUT THIS EVENT
          </span>

          <p>
            {description ||
              "Your event description will appear here as you create your event."}
          </p>

        </div>

      </div>

      <div className="create-event-tip">

        <div className="tip-icon">
          ✦
        </div>

        <div>
          <strong>
            Make it memorable
          </strong>

          <p>
            Use a clear title and useful
            event details so people know
            exactly what to expect.
          </p>
        </div>

      </div>

    </aside>

  </div>

</div>


);
}

export default CreateEvent;
