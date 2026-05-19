"use client";

import { useState, useRef } from "react";

interface UploadButtonProps {
  onUpload: (base64: string) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => onUpload(reader.result as string);
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading file:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      style={{
        border: `1.5px dashed ${dragOver ? "rgba(61,133,247,0.6)" : "rgba(61,133,247,0.2)"}`,
        borderRadius: "18px",
        padding: "48px 32px",
        textAlign: "center",
        background: dragOver ? "rgba(61,133,247,0.06)" : "rgba(61,133,247,0.03)",
        transition: "all 0.25s",
        cursor: loading ? "default" : "pointer",
      }}
      onClick={() => !loading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        id="fileInput"
        accept="image/*,.heic,.heif"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%", margin: "0 auto 18px",
        border: "1px solid rgba(61,133,247,0.25)",
        background: "radial-gradient(circle, rgba(61,133,247,0.1), transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#3d85f7", transition: "transform 0.2s",
      }}>
        {loading ? (
          <svg style={{ animation: "spin 0.8s linear infinite" }} width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="rgba(61,133,247,0.2)" strokeWidth="2"/>
            <path d="M11 2a9 9 0 019 9" stroke="#3d85f7" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L12 16M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      <p style={{
        fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600,
        color: "#f0f4f8", marginBottom: 8, letterSpacing: "-0.2px",
      }}>
        {loading ? "Processing..." : "Upload Prescription Image"}
      </p>
      <p style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        color: "#445566", marginBottom: 20, letterSpacing: "0.3px",
      }}>
        JPG · PNG · HEIC — up to 10 MB
      </p>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: loading ? "rgba(61,133,247,0.4)" : "#3d85f7",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 22px", fontFamily: "'Syne', sans-serif",
          fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 0 0 1px rgba(61,133,247,0.5), 0 4px 20px rgba(61,133,247,0.25)",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Analyzing…" : "Choose file"}
      </button>
    </div>
  );
}