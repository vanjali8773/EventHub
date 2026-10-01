import { useState } from "react";
import "./Auth.css";

function Register({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !phone || !email || !password) {
      setMessage("Please fill all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            phone,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully!");

      setUsername("");
      setPhone("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-shell">

        {/* LEFT BRAND SECTION */}
        <div className="auth-brand register-brand">

          <div className="brand-top">
            <div className="brand-mark">E</div>
            <span>EventHub</span>
          </div>

          <div className="brand-content">

            <span className="brand-eyebrow">
              CREATE • DISCOVER • CONNECT
            </span>

            <h1>
              Your next
              <br />
              <em>moment starts here.</em>
            </h1>

            <p>
              Create your EventHub identity and step into a world
              of events, experiences and people worth meeting.
            </p>

            <div className="register-highlight">

              <div className="highlight-item">
                <div className="highlight-icon">01</div>
                <div>
                  <strong>Discover</strong>
                  <span>Find events around you</span>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon">02</div>
                <div>
                  <strong>Connect</strong>
                  <span>Meet people with similar interests</span>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon">03</div>
                <div>
                  <strong>Create</strong>
                  <span>Build experiences of your own</span>
                </div>
              </div>

            </div>

          </div>

          <div className="brand-footer">
            <span>EVENTHUB</span>
            <div className="brand-line"></div>
            <span>01 / 03</span>
          </div>

        </div>


        {/* RIGHT FORM SECTION */}
        <div className="auth-form-area">

          <div className="auth-form-card">

            <div className="mobile-logo">
              <div className="brand-mark">E</div>
              <span>EventHub</span>
            </div>


            <div className="auth-heading">

              <div className="heading-number">
                <span>01</span>
                <div></div>
                <span>ACCOUNT</span>
              </div>

              <h2>
                Create your
                <br />
                account.
              </h2>

              <p>
                A few details and you're ready to explore EventHub.
              </p>

            </div>


            <form onSubmit={handleRegister}>

              <div className="form-row">

                {/* USERNAME */}
                <div className="auth-field">

                  <label>
                    <span className="field-number">01</span>
                    User ID
                  </label>

                  <div className="input-wrapper">

                    <span className="input-icon">@</span>

                    <input
                      type="text"
                      placeholder="Choose your username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                    />

                  </div>

                </div>


                {/* PHONE */}
                <div className="auth-field">

                  <label>
                    <span className="field-number">02</span>
                    Phone Number
                  </label>

                  <div className="input-wrapper">

                    <span className="input-icon">+91</span>

                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      maxLength="10"
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(/\D/g, "");

                        setPhone(value);
                      }}
                    />

                  </div>

                </div>

              </div>


              {/* EMAIL */}
              <div className="auth-field">

                <label>
                  <span className="field-number">03</span>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">✉</span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="auth-field">

                <label>
                  <span className="field-number">04</span>
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">••</span>

                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                </div>

                <div className="password-hint">
                  Minimum 6 characters
                </div>

              </div>


              {message && (
                <div className="auth-message">
                  <span>!</span>
                  {message}
                </div>
              )}


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </span>

                {!loading && (
                  <span className="submit-arrow">↗</span>
                )}

              </button>

            </form>


            <div className="auth-switch">

              <span>Already part of EventHub?</span>

              <button
                type="button"
                onClick={onLogin}
              >
                Sign in
              </button>

            </div>


            <button
              type="button"
              className="auth-back"
              onClick={onBack}
            >
              ← Back to EventHub
            </button>


            <div className="auth-bottom">
              <span>EVENTHUB</span>
              <span>•</span>
              <span>CREATE • DISCOVER • CONNECT</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;