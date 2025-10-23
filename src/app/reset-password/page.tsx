"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import javaService from "@/api/services/javaService";
import flashMessage from "@/components/shared/flashMessages";
import Link from "next/link";

const Edit = ({ params }: { params: { slug: string[] } }) => {
  const router = useRouter();
  const [state, setState] = useState({
    password: "",
    password_confirmation: "",
    errorMessage: [] as string[],
  });
  const submitRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const reset_token = searchParams.get("token");
  const email = decodeURIComponent(params.slug[1]);

  if (!reset_token) {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name.match(/\[(.*?)\]/)?.[1] || name;
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await javaService.resetForForgotPassword(reset_token, { password: state.password });

      if (res?._status === 204) {
        flashMessage("success", "Password reset successfully.");
        router.push("/login");
      } else if (res?._status === 400) {
        flashMessage("error", "Password reset failed.");
      } else if (res?.message) {
        flashMessage("error", res.message);
      } else {
        flashMessage("info", "Something went wrong.");
      }
    } catch (error) {
      console.error("ResetPassword error:", error);
      flashMessage("error", "Unable to reset password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md bg-background shadow-md rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset your password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="user_password" className="block text-base font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="user[password]"
              id="user_password"
              value={state.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="user_password_confirmation" className="block text-base font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Link href="/login" className="text-sm text-purple-600 hover:text-purple-700">
              Quay lại đăng nhập
            </Link>
            <input
              type="password"
              name="user[password_confirmation]"
              id="user_password_confirmation"
              value={state.password_confirmation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
              placeholder="Confirm password"
            />
          </div>

          <div>
            <input
              ref={submitRef}
              type="submit"
              value="Update Password"
              className="h-12 w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-base font-semibold text-white hover:from-purple-700 hover:to-fuchsia-700 transition"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
