import { NumbersList } from "@/components/number-list";
import { api } from "@api";
import { preloadQuery } from "convex/nextjs";

export default async function Page() {
  const numbers = await preloadQuery(api.numbers.listNumbers, { count: 10 });

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <p className="text-lg">
        This is a simple page that uses the Convex Auth Next.js provider.
      </p>
      <NumbersList preloadedTasks={numbers} />
    </div>
  );
}
