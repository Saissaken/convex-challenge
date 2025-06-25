"use client";

import { api } from "@api";
import { Preloaded, usePreloadedQuery } from "convex/react";

export const NumbersList: React.FC<{
  preloadedTasks: Preloaded<typeof api.numbers.listNumbers>;
}> = ({ preloadedTasks }) => {
  const { numbers, viewer } = usePreloadedQuery(preloadedTasks);

  return (
    <div className="flex flex-col gap-2">
      <p>Viewer: {viewer}</p>
      {numbers.map((number) => (
        <p key={number}>{number}</p>
      ))}
    </div>
  );
};
