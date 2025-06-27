"use client";

import Image from "next/image";
import { JoinBattleButton } from "./join-battle-button";
import { Battle } from "../../convex/battles";

const GIPHY_BASE_URL = "https://i.giphy.com/";

function getMovesEmoji(move?: string) {
  switch (move) {
    case "rock":
      return "🪨";
    case "paper":
      return "📄";
    case "scissors":
      return "✂️";
    default:
      return "";
  }
}

const Participant: React.FC<{
  name: string;
  move?: string;
  winner?: string;
  reverse?: boolean;
}> = ({ name, move, winner, reverse }) => {
  const isWinner = winner === name;
  return (
    <div
      className={`flex gap-2 ${isWinner ? "opacity-30" : ""} ${
        reverse ? "flex-row-reverse" : ""
      }`}
    >
      <span className="font-medium truncate">{name}</span>
      {getMovesEmoji(move)}
    </div>
  );
};

export const BattleCard: React.FC<{
  battle: Battle;
}> = ({ battle }) => {
  return (
    <div className="bg-[#212124]/70 rounded-xl shadow-lg flex flex-col backdrop-blur-sm border border-neutral-800/70 overflow-hidden group aspect-[4/5]">
      <div className="relative w-full flex-grow">
        {battle.giphyId ? (
          <Image
            src={`${GIPHY_BASE_URL}${battle.giphyId}.webp`}
            alt="Battle GIF"
            layout="fill"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center"></div>
        )}

        {/* Top-left: Bet Amount */}
        <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white p-1 px-2 rounded-md text-xs shadow-lg leading-tight">
          <span className="mr-2">💎</span>
          <span className="font-semibold">{battle.betAmount}</span>
        </div>

        {/* Bottom-left: Creator Nickname & Emoji */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white p-1 px-2 rounded-md text-xs shadow-lg leading-tight max-w-[calc(50%-20px)]">
          <Participant
            name={battle.creator}
            move={battle.creatorMove}
            winner={battle.winner}
          />
        </div>

        <div className="absolute bottom-1.5 right-1.5 flex items-center">
          {battle.opponent ? (
            <div className="bg-black/70 backdrop-blur-sm text-white p-1 px-2 rounded-md text-xs shadow-lg leading-tight">
              <Participant
                name={battle.opponent}
                move={battle.opponentMove}
                winner={battle.winner}
                reverse
              />
            </div>
          ) : (
            <JoinBattleButton battle={battle} />
          )}
        </div>
      </div>
    </div>
  );
};
