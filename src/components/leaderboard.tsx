"use client";

import { api } from "@api";
import { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";

const positionEmojis = ["🥇", "🥈", "🥉"];

export const Leaderboard: React.FC<{
  preloadedUserWins: Preloaded<typeof api.battles.getLeaderboard>;
}> = ({ preloadedUserWins }) => {
  const userWins = usePreloadedQuery(preloadedUserWins);
  console.log(userWins);
  return (
    <div className="bg-[#1C1C1E]/80 p-4 rounded-xl shadow-xl backdrop-blur-sm border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2.5 text-center">Leaderboard</h2>
      <ul className="space-y-1.5">
        {userWins.map((player, index) => (
          <li
            key={player.nickname}
            className="flex justify-between items-center p-2 bg-neutral-800/50 rounded-md hover:bg-neutral-700/70 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-lg font-medium text-neutral-500 w-8 text-center">
                {index < 3 ? positionEmojis[index] : `${index + 1}.`}
              </span>
              <span className="font-medium text-sm text-neutral-200">
                {player.nickname}
              </span>
            </div>
            <span className="text-xs text-yellow-400 font-semibold">
              {player.wins} Wins
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
