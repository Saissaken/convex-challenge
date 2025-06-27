"use client";

import type React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CreateBattleModalProps {
  onClose?: () => void;
}

type Move = "rock" | "paper" | "scissors";
const moves: { name: Move; emoji: string }[] = [
  { name: "rock", emoji: "🪨" },
  { name: "paper", emoji: "📄" },
  { name: "scissors", emoji: "✂️" },
];

export function CreateBattleModal({ onClose }: CreateBattleModalProps) {
  const [betAmount, setBetAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const userTokens = useQuery(api.users.getBalance) || 0;

  const createBattle = useMutation(api.battles.createBattle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amount = Number.parseInt(betAmount);

    if (isNaN(amount) || amount <= 0) {
      setError("🤦‍♂️ Valid bet amount, please!");
      return;
    }
    if (amount > userTokens) {
      setError("📉 Not enough diamonds, chief!");
      return;
    }
    // No need to check for selectedMove here as button will be disabled
    if (!selectedMove) return;

    setIsCreating(true);

    try {
      await createBattle({
        betAmount: amount,
        creatorMove: selectedMove,
      });
      onClose?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create battle";
      setError(`💥 ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md text-neutral-100 border border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-200">
            Create new battle!
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="betAmount"
                className="block text-xs font-medium text-neutral-300"
              >
                Bet amount
              </label>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                id="betAmount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="e.g., 69 or 420"
                className="w-full bg-neutral-700/70 border border-neutral-600 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500 pr-10"
              />
              <span className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-yellow-400 text-lg">
                💎
              </span>
            </div>
          </div>

          <div>
            <p className="block text-xs font-medium mb-1.5 text-neutral-300">
              Choose your weapon
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {moves.map((move) => (
                <button
                  key={move.name}
                  type="button"
                  onClick={() => setSelectedMove(move.name)}
                  className={`p-3 rounded-lg border-2 text-2xl flex flex-col items-center justify-center transition-all duration-150
                    ${selectedMove === move.name ? "bg-purple-600/80 border-purple-500 scale-105 shadow-md" : "bg-neutral-700/70 border-neutral-600 hover:border-purple-500/70 hover:bg-neutral-700"}`}
                >
                  <span role="img" aria-label={move.name}>
                    {move.emoji}
                  </span>
                  <span className="text-[10px] mt-1 capitalize text-neutral-300">
                    {move.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!selectedMove || !betAmount || isCreating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm disabled:bg-neutral-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating battle..." : "Look for opponents"}
            </button>
            <p className="text-xs text-neutral-500 mt-1.5 text-center">
              Your stash: {userTokens} 💎
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
