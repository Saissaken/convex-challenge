import { Chat } from "@/components/chat";
import { CreateBattleButton } from "@/components/create-battle-button";
import { BattleList } from "@/components/battle-list";
import { api } from "@api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import Image from "next/image";
import { AvatarMenu } from "@/components/avatar-menu";
import { Metrics } from "@/components/metrics";
import { Leaderboard } from "@/components/leaderboard";

export default async function Page() {
  const preloadedTotalBattles = await preloadQuery(api.battles.getTotalBattles);
  const preloadedTotalBetAmount = await preloadQuery(
    api.battles.getTotalBetAmount
  );
  const preloadedChatHistory = await preloadQuery(api.chat.getRecentMessages);
  const preloadedGetCurrentUser = await preloadQuery(
    api.auth.getCurrentUser,
    undefined,
    { token: await convexAuthNextjsToken() }
  );
  const preloadedOpenBattles = await preloadQuery(api.battles.getOpenBattles);
  const preloadedRecentBattles = await preloadQuery(
    api.battles.getRecentBattles
  );
  const preloadedUserTokens = await preloadQuery(
    api.users.getBalance,
    undefined,
    {
      token: await convexAuthNextjsToken(),
    }
  );
  const preloadedUserWins = await preloadQuery(
    api.battles.getLeaderboard,
    undefined,
    {
      token: await convexAuthNextjsToken(),
    }
  );

  return (
    <div className="container mx-auto">
      <header className="container mx-auto mb-14 py-3">
        <div className="flex justify-between items-center">
          <Metrics
            preloadedTotalBattles={preloadedTotalBattles}
            preloadedTotalBetAmount={preloadedTotalBetAmount}
          />

          <Image
            src="/logo.png"
            alt="Rock Paper Scissors Logo"
            width={150}
            height={75}
            priority
          />

          <div className="flex items-center space-x-3">
            <AvatarMenu
              currentUserPreloaded={preloadedGetCurrentUser}
              userTokensPreloaded={preloadedUserTokens}
            />
          </div>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="flex flex-col gap-4 lg:col-span-4 lg:order-2">
          <CreateBattleButton />
          <Leaderboard preloadedUserWins={preloadedUserWins} />
          <Chat
            preloadedChatHistory={preloadedChatHistory}
            preloadedGetCurrentUser={preloadedGetCurrentUser}
          />
        </aside>
        <BattleList
          className="lg:col-span-8 lg:order-1"
          preloadedOpenBattles={preloadedOpenBattles}
          preloadedRecentBattles={preloadedRecentBattles}
        />
      </main>
    </div>
  );
}
