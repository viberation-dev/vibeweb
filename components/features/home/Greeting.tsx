"use client";

import { useEffect, useState } from "react";

import { greetingFor } from "@/lib/home-feed";

/**
 * "Good evening, Ali." on the viewer's clock, not the server's (VIB-170).
 *
 * The server renders its own hour so the heading is never blank or shifted
 * on first paint; the effect corrects it once the browser's timezone is
 * known. Setting it in an effect rather than during render is what keeps
 * this out of a hydration mismatch.
 */
export function Greeting({ serverHour, name }: { serverHour: number; name?: string }) {
  const [hour, setHour] = useState(serverHour);

  useEffect(() => setHour(new Date().getHours()), []);

  return (
    <>
      {greetingFor(hour)}
      {name ? `, ${name}` : ""}. What are you building?
    </>
  );
}
