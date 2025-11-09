import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { role } = useAuth();

  return (
    <section className="card">
      <h1>Welcome to the E-Voting Control Center</h1>
      <p style={{ color: "#cbd5f5" }}>
        This console covers voter enrollment with biometric capture and secure API-backed balloting.
      </p>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1.5rem" }}>
        <div>
          <h2>Administrators</h2>
          <p style={{ marginBottom: "2rem" }}>
            Register new voters after face verification. Use the admin login to access the registration workflow.
          </p>
          {role === "admin" ? (
            <Link className="primary-btn" to="/admin/register">
              Go to Registration
            </Link>
          ) : (
            <Link className="primary-btn" to="/admin/login">
              Admin Login
            </Link>
          )}
        </div>

        <div>
          <h2>Voters</h2>
          <p style={{ marginBottom: "2rem" }}>
            Authenticate with your voter hash (or Aadhaar) and password to cast your ballot and review live results.
          </p>
          {role === "voter" ? (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link className="primary-btn" to="/voter/vote">
                Cast Vote
              </Link>
              <Link className="primary-btn" to="/voter/results">
                View Results
              </Link>
            </div>
          ) : (
            <Link className="primary-btn" to="/voter/login">
              Voter Login
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
