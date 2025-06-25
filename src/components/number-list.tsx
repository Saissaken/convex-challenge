"use client";

import { api } from "@api";
import { Preloaded, usePreloadedQuery } from "convex/react";

export const NumbersList: React.FC<{
  preloadedChatHistory: Preloaded<typeof api.chat.getRecentMessages>;
}> = ({ preloadedChatHistory }) => {
  const chatHistory = usePreloadedQuery(preloadedChatHistory);

  return (
    <div className="flex flex-col gap-2">
      {chatHistory.map((message) => (
        <p key={message._id}>
          {message.from}: {message.message}
        </p>
      ))}
    </div>
  );
};
