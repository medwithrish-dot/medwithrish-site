"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type ReviewType = "medicine" | "dental";
type Status = "idle" | "uploading" | "redirecting" | "success" | "cancelled" | "error";

export default function PSReviewForm({ submissionRef }: { submissionRef: React.RefObject<HTMLDivElement | null> }) {
  const searchParams = useSearchParams();
  const [reviewType, setReviewType] = useState<ReviewType>("medicine");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") setStatus("success");
    if (checkout === "cancelled") setStatus("cancelled");
  }, [searchParams]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are accepted.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("File must be under 10MB.");
      return;
    }
    setErrorMsg("");
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!file) {
      setErrorMsg("Please upload your personal statement as a PDF.");
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/ps-review/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed.");

      const checkoutRes = await fetch("/api/ps-review/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reviewType, filePath: uploadData.filePath }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error ?? "Checkout failed.");

      setStatus("redirecting");
      window.location.href = checkoutData.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const isLoading = status === "uploading" || status === "redirecting";

  if (status === "success") {
    return (
      <div
        id="ps-submission"
        ref={submissionRef}
        className="mt-8 scroll-mt-28 rounded-[2rem] border border-green-200 bg-green-50 p-6 text-center"
      >
        <div className="text-3xl">✓</div>
        <h4 className="mt-3 text-xl font-bold text-green-800">Payment received!</h4>
        <p className="mt-2 text-sm text-green-700">
          Your personal statement has been submitted. You'll receive feedback at <strong>{email || "your email"}</strong> soon.
        </p>
      </div>
    );
  }

  return (
    <div
      id="ps-submission"
      ref={submissionRef}
      className="mt-8 scroll-mt-28 rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.95)_0%,rgba(255,255,255,1)_100%)] p-6"
    >
      <div className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
        Personal Statement Review
      </div>

      <h4 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
        Submit your personal statement for review
      </h4>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
        Upload your PDF, pay securely, and receive detailed written feedback on structure, reflection, clarity, and competitiveness.
      </p>

      {status === "cancelled" && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment was cancelled — your file was not submitted. Try again below.
        </div>
      )}

      {/* Review type toggle */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-gray-700">Review type</p>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          {(["medicine", "dental"] as ReviewType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReviewType(type)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition ${
                reviewType === type
                  ? "bg-amber-400 text-amber-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Your email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email — we'll send feedback here"
          disabled={isLoading}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
        />
      </div>

      {/* PDF drop zone */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-gray-700">Upload personal statement (PDF)</p>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`cursor-pointer rounded-[2rem] border-2 border-dashed px-6 py-10 text-center transition ${
            isDragging
              ? "border-amber-400 bg-amber-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50"
          } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <div className="text-2xl">📄</div>
              <p className="mt-2 text-sm font-semibold text-green-700">{file.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {(file.size / 1024).toFixed(0)} KB — click to change
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl text-amber-400">⬆</div>
              <p className="mt-2 text-sm font-semibold text-gray-700">
                Drag & drop your PDF here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">PDF only · max 10MB</p>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="mt-3 text-sm font-medium text-red-600">{errorMsg}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-6 w-full rounded-2xl bg-amber-400 px-5 py-4 text-base font-bold text-amber-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "redirecting"
          ? "Redirecting to payment…"
          : "Pay & Submit for Review"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Secure payment via Stripe. Your PDF is only accessible to Medwithrish.
      </p>
    </div>
  );
}
