"use client";

import { createContext, useContext } from "react";

import type { Setup } from "@/lib/walkthrough-setup";

/*
 * The reader's setup, for the few blocks deep in a step that need it: a
 * prompt fills in a blank the reader has already answered in the panel.
 * Context rather than props because the path from the page to a prompt runs
 * through the block renderer guides share, and guides have no setup.
 */
const SetupContext = createContext<Setup | null>(null);

export function WalkthroughSetupProvider({
  setup,
  children,
}: {
  setup: Setup;
  children: React.ReactNode;
}) {
  return <SetupContext.Provider value={setup}>{children}</SetupContext.Provider>;
}

/** Null outside a walkthrough, where there is nothing to fill a blank from. */
export function useWalkthroughSetup(): Setup | null {
  return useContext(SetupContext);
}
