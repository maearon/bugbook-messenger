"use client";

import { useRef, useState } from "react";
import javaService from "@/api/services/javaService";
import { Loader2 } from "lucide-react";

interface ResendVerificationButtonProps {
  email: string;
}

export function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResend(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSubmitting(true);

    try {
      await javaService.resendActivationEmail({ email });
      setSuccess("✅ Verification email sent. Please check your inbox.");
    } catch (err) {
      console.error("Send Verification Email error:", err);
      setError("❌ Failed to send verification email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {success && (
        <div role="status" className="text-sm text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleResend}
        ref={submitRef}
        type="submit"
        disabled={submitting}
        className={`h-12 w-full flex justify-center items-center px-4 py-2 font-semibold rounded-xl shadow-sm transition 
          bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700
          ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {submitting && (
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
        )}
        {submitting ? "Sending..." : "Send Reset Link"}
      </button>
    </div>
  );
}
