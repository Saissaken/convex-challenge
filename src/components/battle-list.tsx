"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@api";
import { BattleCard } from "./battle-card";

export const BattleList: React.FC<{
  className?: string;
  preloadedOpenBattles: Preloaded<typeof api.battles.getOpenBattles>;
  preloadedRecentBattles: Preloaded<typeof api.battles.getRecentBattles>;
}> = ({ className, preloadedOpenBattles, preloadedRecentBattles }) => {
  const openBattles = usePreloadedQuery(preloadedOpenBattles);
  const recentBattles = usePreloadedQuery(preloadedRecentBattles);

  return (
    <section className={`w-full space-y-5 ${className}`}>
      <div className="bg-[#1C1C1E]/80 p-4 md:p-5 rounded-xl shadow-xl backdrop-blur-sm border border-neutral-800">
        <h2 className="text-xl font-bold mb-3 text-neutral-200 tracking-tight">
          Find your opponent
        </h2>
        {openBattles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {openBattles.map((battle) => (
              <BattleCard key={battle._id} battle={battle} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-center py-3 text-sm">
            🏜️ Tumbleweeds... Be a hero, start a battle!
          </p>
        )}
        <hr className="border-neutral-700 my-16" />
        {recentBattles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentBattles.map((battle) => (
              <BattleCard key={battle._id} battle={battle} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-center py-3 text-sm">
            📜 The archives are empty. Make history!
          </p>
        )}
      </div>
    </section>
  );
};
