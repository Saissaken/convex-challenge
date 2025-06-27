"use client";

import { useState, useRef, useEffect } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@api";
import { AuthModal } from "./auth-modal";

interface AvatarMenuProps {
  currentUserPreloaded: Preloaded<typeof api.auth.getCurrentUser>;
  userTokensPreloaded: Preloaded<typeof api.users.getBalance>;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({
  currentUserPreloaded,
  userTokensPreloaded,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = usePreloadedQuery(currentUserPreloaded);
  const userTokens = usePreloadedQuery(userTokensPreloaded);

  const { signOut } = useAuthActions();
  const claimTokens = useMutation(api.users.claimTokens);

  const isLoggedIn = !!currentUser;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClaimTokens = async () => {
    try {
      await claimTokens();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Failed to claim tokens:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        {isLoggedIn && currentUser ? (
          <div className="relative" ref={userMenuRef}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-[#1C1C1E]/80 px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm border border-neutral-800">
                <span className="text-lg mr-2">💎</span>
                <span className="font-semibold text-md">{userTokens}</span>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1.5 p-1.5 bg-[#1C1C1E]/80 rounded-full hover:bg-neutral-700/80 transition-colors backdrop-blur-sm border border-neutral-800"
              >
                <span className="text-xl px-0.5">🥸</span>
                <span className="text-sm font-medium text-neutral-200">
                  {currentUser.nickname}
                </span>
                <span
                  className={`transition-transform text-neutral-400 text-sm ${showUserMenu ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
            </div>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1C1C1E] rounded-lg shadow-xl py-1.5 z-50 border border-neutral-700">
                <button
                  onClick={handleClaimTokens}
                  className="w-full text-left px-3.5 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition-colors flex items-center space-x-2"
                >
                  <span>💎</span>
                  <span>Get 100 free diamonds</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
          >
            <span className="text-lg">🚀</span>
            <span>Sign In & Play</span>
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
