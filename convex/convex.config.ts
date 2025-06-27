import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

app.use(aggregate, { name: "aggregateBattles" });
app.use(aggregate, { name: "aggregateUserWins" });

export default app;
