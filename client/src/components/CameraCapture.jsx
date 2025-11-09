import { useEffect, useRef, useState } from "react";

const MEDIA_CONSTRAINTS = {
  video: {
    facingMode: "user",
    width: { ideal: 640 },
    height: { ideal: 480 },
  },
  audio: false,
};

export default function CameraCapture({ onCapture, captureLabel = "Capture", retakeLabel = "Retake" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function startStream() {
      setIsLoading(true);
      setError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not supported in this browser.");
        setIsLoading(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error", err);
        setError("Unable to access camera. Grant permissions or attach a webcam.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    startStream();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to capture image"));
            return;
          }
          stopStream();
          const objectUrl = URL.createObjectURL(blob);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(objectUrl);
          onCapture?.(blob);
          resolve();
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleRetake = async () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    onCapture?.(null);
    try {
      setIsLoading(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not supported in this browser.");
        setIsLoading(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error", err);
      setError("Unable to access camera. Grant permissions or attach a webcam.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="camera-capture">
      {previewUrl ? (
        <img src={previewUrl} alt="Captured" className="camera-preview" />
      ) : (
        <video
          ref={videoRef}
          className="camera-preview"
          autoPlay
          playsInline
          muted
          onLoadedData={() => setIsLoading(false)}
        />
      )}

      {error && <p className="camera-error">{error}</p>}

      <div className="camera-actions">
        {previewUrl ? (
          <button type="button" className="secondary-btn" onClick={handleRetake}>
            {retakeLabel}
          </button>
        ) : (
          <button
            type="button"
            className="primary-btn"
            onClick={handleCapture}
            disabled={isLoading || !!error}
          >
            {captureLabel}
          </button>
        )}
      </div>
    </div>
  );
}
