
import { useState } from "react";
import "./Auth.css";

function Login({ onLoginSuccess, onRegister, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      onLoginSuccess();
    } catch (error) {
      console.error(error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">

        {/* LEFT BRAND SECTION */}
        <div className="auth-brand">

          <div className="brand-top">
            <div className="brand-mark">E</div>
            <span>EventHub</span>
          </div>

          <div className="brand-content">
            <span className="brand-eyebrow">
              CREATE • DISCOVER • CONNECT
            </span>

            <h1>
              Your events.
              <br />
              <em>Your people.</em>
            </h1>

            <p>
              Discover meaningful experiences, connect with people
              and create moments worth remembering.
            </p>
          </div>

          <div className="brand-footer">
            <span>01</span>
            <div className="brand-line"></div>
            <span>EVENTHUB</span>
          </div>

        </div>

        {/* RIGHT LOGIN SECTION */}
        <div className="auth-form-area">

          <div className="auth-form-card">

            {/* MOBILE LOGO */}
            <div className="mobile-logo">
              <div className="brand-mark">E</div>
              <span>EventHub</span>
            </div>

            {/* HEADING */}
            <div className="auth-heading">
              <span>WELCOME BACK</span>

              <h2>Sign in to EventHub</h2>

              <p>
                Continue discovering events and experiences made for you.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin}>

              <div className="auth-field">
                <label>Email address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && (
                <div className="auth-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <span>→</span>}
              </button>

            </form>

            {/* REGISTER LINK */}
            <div className="auth-switch">
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={onRegister}
              >
                Create account
              </button>
            </div>

            {/* BACK BUTTON */}
            <button
              type="button"
              className="auth-back"
              onClick={onBack}
            >
              ← Back to EventHub
            </button>

            {/* FOOTER */}
            <div className="auth-bottom">
              EVENTHUB
              <span>•</span>
              CREATE • DISCOVER • CONNECT
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;

