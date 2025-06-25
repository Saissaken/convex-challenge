"use client";

import { useState } from "react";
import { AuthModal } from "./auth-modal";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@api";

interface SigninButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const SigninButton: React.FC<SigninButtonProps> = ({
  className = "",
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const { signOut } = useAuthActions();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // If user is already signed in, show sign out button
  if (currentUser) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {currentUser.email || "User"}!
        </span>
        <button
          onClick={handleSignOut}
          className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ${className}`}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      >
        {children || "Sign in"}
      </button>

      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};
