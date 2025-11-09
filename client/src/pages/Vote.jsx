import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import CameraCapture from "../components/CameraCapture.jsx";

export default function Vote() {
  const { token, user } = useAuth();
  const [candidateId, setCandidateId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [captureKey, setCaptureKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/votes/candidates`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) return;
        const data = await response.json();
        setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      } catch (err) {
        console.warn("Candidate fetch failed", err);
      }
    };
    loadCandidates();
  }, [token]);

  const handleVote = async (event) => {
    event.preventDefault();
    if (!capturedImage) {
      setError("Provide a live capture image for verification.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = new FormData();
      payload.set("candidateId", candidateId);
      payload.set("image", capturedImage, `vote-${Date.now()}.jpg`);

      const response = await fetch(`${API_BASE_URL}/api/votes/cast`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: payload,
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "Vote submission failed");
      }

      const data = await response.json();
      setMessage(data.message || "Vote cast successfully");
      setCapturedImage(null);
      setCaptureKey((prev) => prev + 1);
      setCandidateId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Cast Your Vote</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        Confirm your candidate selection and validate identity with a live face snapshot before the ballot is recorded.
      </p>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <form onSubmit={handleVote} className="form-grid">
        <div className="field">
          <label htmlFor="candidate-select">Candidate</label>
          {candidates.length ? (
            <select
              id="candidate-select"
              value={candidateId}
              onChange={(event) => setCandidateId(event.target.value)}
              required
            >
              <option value="" disabled>
                Select a candidate
              </option>
              {candidates.map((candidate) => (
                <option
                  key={candidate.candidateId || candidate.id || candidate.ID}
                  value={candidate.candidateId || candidate.id || candidate.ID}
                >
                  {candidate.name || candidate.Name} ({
                    candidate.candidateId || candidate.id || candidate.ID
                  })
                </option>
              ))}
            </select>
          ) : (
            <input
              id="candidate-select"
              value={candidateId}
              onChange={(event) => setCandidateId(event.target.value)}
              placeholder="Enter candidate ID"
              required
            />
          )}
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Live Face Capture</label>
          <CameraCapture
            key={captureKey}
            onCapture={(blob) => setCapturedImage(blob)}
            captureLabel="Capture"
            retakeLabel="Retake"
          />
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Vote"}
        </button>
      </form>
    </section>
  );
}
