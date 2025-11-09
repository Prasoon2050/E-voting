import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "Unable to login. Check credentials.");
      }

      const data = await response.json();
      loginAdmin(data.token, data.admin || { email });
      navigate("/admin/register", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Administrator Login</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        Sign in to approve new voter enrollments. Use one of the seeded admin accounts (e.g. alpha@evote.local) or any account stored in MongoDB.
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
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
