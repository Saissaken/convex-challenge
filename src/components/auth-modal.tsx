"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const { signIn } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("🤨 Email & pass, pls!");
      setIsLoading(false);
      return;
    }

    if (isSignup && !nickname.trim()) {
      setError("😬 Need a nickname for signup!");
      setIsLoading(false);
      return;
    }

    if (isSignup && nickname.trim().length < 2) {
      setError("😅 Nickname needs at least 2 characters!");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", isSignup ? "signUp" : "signIn");
      if (isSignup) {
        formData.append("nickname", nickname.trim());
      }

      await signIn("password", formData);
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setNickname("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setNickname("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md text-neutral-100 border border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-200">
            {isSignup ? "👋 Create your account" : "👋 Welcome back bro"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <p className="bg-red-900/30 p-2.5 rounded-md mb-4 text-sm border border-red-700 flex items-center text-red-300">
            <span className="text-lg mr-2">🚨</span> {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-1 text-neutral-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-700/70 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label
                htmlFor="nickname"
                className="block text-xs font-medium mb-1 text-neutral-300"
              >
                Nickname
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-neutral-700/70 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500"
                placeholder="Enter your nickname"
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium mb-1 text-neutral-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
              title="Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number"
              className="w-full bg-neutral-700/70 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isSignup ? "Creating account..." : "Signing in..."}
              </div>
            ) : isSignup ? (
              "Create account ✨"
            ) : (
              "Sign in ✨"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-neutral-400">
          {isSignup ? "Already a legend?" : "New here, champ?"}{" "}
          <button
            onClick={toggleMode}
            className="text-purple-400 hover:underline font-medium"
          >
            {isSignup ? "Log In!" : "Sign Up!"}
          </button>
        </p>
      </div>
    </div>
  );
};
