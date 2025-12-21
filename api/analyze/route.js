"use client";
import { useState } from "react";

export default function CareerRoadmapUploader() {
  const [resumeFile, setResumeFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Upload single file
  async function uploadFile(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        // DO NOT set Content-Type header - browser will set it automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to upload ${file.name}: ${err.message}`);
    }
  }

  // Handler for button click
  async function handleUpload() {
    if (!resumeFile && !transcriptFile) {
      setError("Please upload at least one file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const results = [];

      // Upload resume if present
      if (resumeFile) {
        console.log("Uploading resume:", resumeFile.name);
        const resumeResult = await uploadFile(resumeFile);
        results.push({ type: "resume", data: resumeResult });
      }

      // Upload transcript if present
      if (transcriptFile) {
        console.log("Uploading transcript:", transcriptFile.name);
        const transcriptResult = await uploadFile(transcriptFile);
        results.push({ type: "transcript", data: transcriptResult });
      }

      // Combine results
      setResult({
        success: true,
        uploads: results,
        message: "Files uploaded successfully",
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Career Roadmap AI</h2>

      {/* Resume Upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Upload Resume / CV:</label>
        <input
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={(e) => setResumeFile(e.target.files[0])}
          className="w-full border rounded px-3 py-2"
        />
        {resumeFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Transcript Upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Upload Academic Transcript:</label>
        <input
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={(e) => setTranscriptFile(e.target.files[0])}
          className="w-full border rounded px-3 py-2"
        />
        {transcriptFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {transcriptFile.name} ({(transcriptFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full px-4 py-2 rounded font-medium text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Analyzing..." : "Generate My Career Roadmap"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold mb-2 text-green-800">✓ Upload Successful</h3>
          <div className="text-sm text-gray-700">
            {result.uploads.map((upload, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-medium capitalize">{upload.type}:</p>
                <p className="text-xs text-gray-600">
                  {upload.data.fileName} ({(upload.data.fileSize / 1024).toFixed(2)} KB)
                </p>
              </div>
            ))}
          </div>
          <pre className="mt-3 text-xs bg-white p-2 rounded border overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}