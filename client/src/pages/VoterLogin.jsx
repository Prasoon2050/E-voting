import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VoterLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginVoter } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "Failed to login.");
      }

      const data = await response.json();
  loginVoter(data.token, data.voter || { voterId: identifier });
      navigate("/voter/vote", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Voter Login</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        Authenticate with your assigned voter hash or Aadhaar number. After login you can cast your ballot and monitor turnout results.
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleLogin} className="form-grid">
        <div className="field">
          <label htmlFor="voter-id-login">Voter Hash or Aadhaar</label>
          <input
            id="voter-id-login"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="voter-password">Password / Passphrase</label>
          <input
            id="voter-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}
