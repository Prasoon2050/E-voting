import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Results() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/results`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.error || "Failed to fetch results");
        }

        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [token]);

  return (
    <section className="card">
      <h1>Election Results</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        The table below reflects the tallies recorded by the voting API after face-verification checks.
      </p>

      {loading && <div className="alert">Loading results...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(148, 163, 184, 0.15)" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Candidate</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Votes</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: "1rem", textAlign: "center" }}>
                  No results available yet.
                </td>
              </tr>
            ) : (
              results.map((candidate) => (
                <tr key={candidate.candidateId || candidate.id || candidate.ID}>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #1f2937" }}>
                    {candidate.name || candidate.Name} ({
                      candidate.candidateId || candidate.id || candidate.ID
                    })
                  </td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #1f2937" }}>
                    {candidate.votes ?? candidate.Votes ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
