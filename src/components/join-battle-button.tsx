"use client";

import { api } from "@api";
import { useMutation, useQuery } from "convex/react";
import type React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Battle } from "../../convex/battles";

type Move = "rock" | "paper" | "scissors";

const moves: { name: Move; emoji: string }[] = [
  { name: "rock", emoji: "🪨" },
  { name: "paper", emoji: "📄" },
  { name: "scissors", emoji: "✂️" },
];

interface BattleProps {
  battle: Battle;
}

export const JoinBattleButton: React.FC<BattleProps> = ({ battle }) => {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userTokens = useQuery(api.users.getBalance);
  const joinBattle = useMutation(api.battles.joinBattle);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted on client side (Next.js SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoin = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedMove(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMove || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await joinBattle({ battleId: battle._id, move: selectedMove });
      handleClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to join battle:", error);
      // Keep modal open on error so user can try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAfford = userTokens !== undefined && userTokens >= battle.betAmount;
  const isOwnBattle = currentUser?._id === battle.creatorId;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md text-neutral-100 border border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-200">
            Challenging{" "}
            <span className="text-purple-400">{battle.creator}</span>!
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="block text-xs font-medium mb-1.5 text-neutral-300">
              Your weapon of choice?
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {moves.map((move) => (
                <button
                  key={move.name}
                  type="button"
                  onClick={() => setSelectedMove(move.name)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border-2 text-2xl flex flex-col items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
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
              disabled={!selectedMove || isSubmitting || !canAfford}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm disabled:bg-neutral-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
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
                  Joining...
                </span>
              ) : (
                `Challenge for ${battle.betAmount} 💎`
              )}
            </button>
            <div className="text-xs text-center mt-1.5">
              <span
                className={`${canAfford ? "text-neutral-500" : "text-red-400"}`}
              >
                Your stash: {userTokens} 💎
              </span>
              {!canAfford && (
                <div className="text-red-400 mt-1">Insufficient funds!</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={handleJoin}
        disabled={isOwnBattle}
        className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xl hover:shadow-lg transition-all text-xs flex items-center space-x-1.5 ${
          isOwnBattle ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={
          isOwnBattle ? "This is your own battle" : "Challenge this player!"
        }
      >
        <span>⚔️</span>
        <span>Challenge!</span>
      </button>

      {/* Portal the modal to document.body */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
};
