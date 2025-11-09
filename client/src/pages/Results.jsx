import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Results() {
  const { token, role } = useAuth();
  const [status, setStatus] = useState("pending");
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [publishedAt, setPublishedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalizing, setFinalizing] = useState(false);

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
      if (data.status === "published") {
        setStatus("published");
        setResults(Array.isArray(data.results) ? data.results : []);
        setTotalVotes(data.totalVotes || 0);
        setPublishedAt(data.publishedAt ? new Date(data.publishedAt) : null);
      } else {
        setStatus("pending");
        setResults([]);
        setTotalVotes(0);
        setPublishedAt(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const finalizeResults = async () => {
    setFinalizing(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "Failed to finalize results");
      }
      const data = await response.json();
      setStatus(data.status || "published");
      setResults(Array.isArray(data.results) ? data.results : []);
      setTotalVotes(data.totalVotes || 0);
      setPublishedAt(data.publishedAt ? new Date(data.publishedAt) : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <section className="card">
      <h1>Election Results</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        The ledger-backed tallies appear once the counting authority finalizes the vote.
      </p>

      {(loading || finalizing) && <div className="alert">Processing...</div>}
      {error && <div className="alert error">{error}</div>}

      {status === "pending" && !loading && !finalizing && (
        <div className="alert">
          Vote counting not started.
          {role === "admin" && (
            <div style={{ marginTop: "1rem" }}>
              <button className="primary-btn" onClick={finalizeResults} disabled={finalizing}>
                {finalizing ? "Finalizing..." : "Finalize Vote Count"}
              </button>
            </div>
          )}
        </div>
      )}

      {status === "published" && !loading && !finalizing && (
        <>
          <div style={{ marginBottom: "1rem", color: "#94a3b8" }}>
            Total voters participated: <strong>{totalVotes}</strong>
            {publishedAt && (
              <span style={{ marginLeft: "1rem" }}>
                Published at: {publishedAt.toLocaleString()}
              </span>
            )}
          </div>
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
                    No tallies recorded on the ledger.
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
        </>
      )}
    </section>
  );
}
