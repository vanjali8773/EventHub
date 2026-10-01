
import "./Landing.css";

function Landing({ onLogin, onRegister, onExplore }) {
  return (
    <div>
      {/* ================= NAVBAR ================= */}
      <nav className="eventhub-navbar">
        <div className="eventhub-logo">
          EventHub 🎉
        </div>

        <div className="nav-buttons">
          <button
            className="nav-login"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            className="nav-register"
            onClick={onRegister}
          >
            Register
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-content">

          <p className="hero-tag">
            WELCOME TO EVENTHUB
          </p>

          <h1 className="hero-title">
            Discover Events.
            <br />
            Create Experiences.
          </h1>

          <p className="hero-description">
            Explore exciting events around you, connect with people,
            and create unforgettable experiences.
          </p>

          <button
            className="primary-button"
            onClick={onExplore}
          >
            Explore Events
          </button>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="categories-section">

        <h2 className="section-title">
          Explore by Category
        </h2>

        <div className="category-container">

          <button className="category-button">
            🎵 Music
          </button>

          <button className="category-button">
            💻 Technology
          </button>

          <button className="category-button">
            🎨 Art & Culture
          </button>

          <button className="category-button">
            ⚽ Sports
          </button>

          <button className="category-button">
            📚 Education
          </button>

          <button className="category-button">
            💼 Business
          </button>

        </div>

      </section>

      {/* ================= FEATURED EVENTS ================= */}
      <section className="events-section">

        <h2 className="section-title">
          Featured Events
        </h2>

        <div className="event-container">

          <div className="event-card">
            <h3>
              Tech Innovation Summit
            </h3>

            <p>📅 15 October 2026</p>

            <p>📍 Lucknow</p>

            <button
              className="event-button"
              onClick={onExplore}
            >
              View Event
            </button>
          </div>

          <div className="event-card">
            <h3>
              Music Night
            </h3>

            <p>📅 20 October 2026</p>

            <p>📍 Lucknow</p>

            <button
              className="event-button"
              onClick={onExplore}
            >
              View Event
            </button>
          </div>

          <div className="event-card">
            <h3>
              Startup Meetup
            </h3>

            <p>📅 25 October 2026</p>

            <p>📍 Lucknow</p>

            <button
              className="event-button"
              onClick={onExplore}
            >
              View Event
            </button>
          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">

        <h2>
          Ready to create your own event?
        </h2>

        <p>
          Join EventHub and start creating amazing experiences.
        </p>

        <button
          className="cta-button"
          onClick={onRegister}
        >
          Create Your Event
        </button>

      </section>

    </div>
  );
}

export default Landing;
