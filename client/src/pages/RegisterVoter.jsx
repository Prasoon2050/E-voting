import { useState } from "react";
import { API_BASE_URL } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import CameraCapture from "../components/CameraCapture.jsx";

const initialForm = {
  fullName: "",
  aadharNumber: "",
  password: "",
};

export default function RegisterVoter() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedVoterId, setGeneratedVoterId] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [captureKey, setCaptureKey] = useState(0);
  const { token } = useAuth();

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!capturedImage) {
      setError("Capture a face image to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setGeneratedVoterId("");

    try {
      const payload = new FormData();
      payload.set("fullName", form.fullName);
      payload.set("aadharNumber", form.aadharNumber);
      payload.set("password", form.password);
      payload.set(
        "image",
        capturedImage,
        `capture-${Date.now()}.jpg`
      );

      const response = await fetch(`${API_BASE_URL}/api/voters/register`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: payload,
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.error || "Failed to register voter");
      }

      const data = await response.json();
  setSuccess(data.message || "Voter registered successfully.");
  setGeneratedVoterId(data.voter?.voterHash || data.voter?.voterId || "");
      setForm(initialForm);
      setCapturedImage(null);
      setCaptureKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Register New Voter</h1>
      <p style={{ color: "#cbd5f5", marginBottom: "1.5rem" }}>
        Upload biometric evidence and demographic data. The backend stores credentials in MongoDB and the enrolment image in S3 for face matching.
      </p>

      {error && <div className="alert error">{error}</div>}
      {success && (
        <div className="alert success">
          <div>{success}</div>
          {generatedVoterId && (
            <div style={{ marginTop: "0.5rem" }}>
              Provide this voter hash to the voter for login: <strong>{generatedVoterId}</strong>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid two-cols">
        <div className="field">
          <label htmlFor="full-name">Full Name</label>
          <input
            id="full-name"
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="aadhar">Government ID (Aadhaar)</label>
          <input
            id="aadhar"
            value={form.aadharNumber}
            onChange={(event) => updateField("aadharNumber", event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Temporary Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
          />
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Face Capture</label>
          <CameraCapture
            key={captureKey}
            onCapture={(blob) => setCapturedImage(blob)}
            captureLabel="Capture Face"
            retakeLabel="Retake"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Uploading..." : "Register Voter"}
          </button>
        </div>
      </form>
    </section>
  );
}
