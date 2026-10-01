function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav>
        <h2>EventHub 🎉</h2>

        <div>
          <button>Home</button>
          <button>Explore Events</button>
          <button>My Events</button>
          <button>Profile</button>
        </div>
      </nav>

      {/* Welcome Section */}
      <section>
        <h1>Discover Amazing Events</h1>

        <p>
          Find events, meet people, and create unforgettable experiences.
        </p>

        <button>Create Event</button>
        <button>Explore Events</button>
      </section>

      {/* Categories */}
      <section>
        <h2>Explore Categories</h2>

        <button>🎵 Music</button>
        <button>💻 Technology</button>
        <button>🎨 Art</button>
        <button>⚽ Sports</button>
        <button>📚 Education</button>
        <button>💼 Business</button>
      </section>

      {/* Upcoming Events */}
      <section>
        <h2>Upcoming Events</h2>

        <div>
          <h3>Tech Innovation Summit</h3>
          <p>📅 15 October 2026</p>
          <p>📍 Lucknow</p>
          <button>View Event</button>
        </div>

        <div>
          <h3>Music Night</h3>
          <p>📅 20 October 2026</p>
          <p>📍 Lucknow</p>
          <button>View Event</button>
        </div>

        <div>
          <h3>Startup Meetup</h3>
          <p>📅 25 October 2026</p>
          <p>📍 Lucknow</p>
          <button>View Event</button>
        </div>
      </section>
    </div>
  );
}

export default Home;