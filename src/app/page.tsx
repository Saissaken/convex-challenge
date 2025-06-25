import { NumbersList } from "@/components/number-list";
import { SigninButton } from "@/components/signin-button";
import { api } from "@api";
import { preloadQuery } from "convex/nextjs";

export default async function Page() {
  const preloadedChatHistory = await preloadQuery(api.chat.getRecentMessages);
  // const preloadedGetCurrentUser = await preloadQuery(api.auth.getCurrentUser);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <p className="text-lg">
        This is a simple page that uses the Convex Auth Next.js provider.
      </p>
      <NumbersList preloadedChatHistory={preloadedChatHistory} />
      <SigninButton />
    </div>
  );
}
