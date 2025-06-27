"use client";

import { api } from "@api";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { AuthModal } from "./auth-modal";
import { useState } from "react";

export function Chat({
  preloadedGetCurrentUser,
  preloadedChatHistory,
}: {
  preloadedGetCurrentUser: Preloaded<typeof api.auth.getCurrentUser>;
  preloadedChatHistory: Preloaded<typeof api.chat.getRecentMessages>;
}) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messages = usePreloadedQuery(preloadedChatHistory) ?? [];
  const currentUser = usePreloadedQuery(preloadedGetCurrentUser);
  const sendMessage = useMutation(api.chat.sendMessage);

  const handleChatFocus = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !message.trim()) return;
    await sendMessage({ message });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <div className="bg-[#1C1C1E]/80 rounded-xl shadow-xl backdrop-blur-sm border border-neutral-800 flex flex-col h-[400px] md:h-auto md:min-h-[400px]">
        <div className="flex-grow overflow-y-auto p-3 space-y-2.5 text-sm custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg._id}>
              <span className="font-semibold text-purple-400">
                {msg.from}:{" "}
              </span>
              <span className="text-neutral-300">{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-neutral-700/80">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Spill the tea..."
              className="flex-grow bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500 disabled:cursor-not-allowed"
              onFocus={handleChatFocus}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 p-1"
              onClick={handleSendMessage}
            >
              <span className="text-xl">➤</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
