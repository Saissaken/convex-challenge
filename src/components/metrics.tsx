"use client";

import { api } from "@api";
import { Preloaded, usePreloadedQuery } from "convex/react";

export const Metrics: React.FC<{
  preloadedTotalBattles: Preloaded<typeof api.battles.getTotalBattles>;
  preloadedTotalBetAmount: Preloaded<typeof api.battles.getTotalBetAmount>;
}> = ({ preloadedTotalBattles, preloadedTotalBetAmount }) => {
  const totalBattles = usePreloadedQuery(preloadedTotalBattles);
  const totalBetAmount = usePreloadedQuery(preloadedTotalBetAmount);

  return (
    <div className="flex space-x-3 items-center">
      <div className="bg-[#1C1C1E]/80 p-2.5 rounded-lg shadow-md flex items-center space-x-2 backdrop-blur-sm border border-neutral-800">
        <span className="text-lg">⚔️</span>
        <div>
          <p className="text-xs text-neutral-400">Total Duels</p>
          <p className="text-sm font-semibold">{totalBattles}</p>
        </div>
      </div>
      <div className="bg-[#1C1C1E]/80 p-2.5 rounded-lg shadow-md flex items-center space-x-2 backdrop-blur-sm border border-neutral-800">
        <span className="text-lg">🤑</span>
        <div>
          <p className="text-xs text-neutral-400">Diamonds Won</p>
          <p className="text-sm font-semibold">{totalBetAmount}</p>
        </div>
      </div>
    </div>
  );
};
