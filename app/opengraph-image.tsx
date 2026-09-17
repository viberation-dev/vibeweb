import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/*
 * The social card for every shared link (VIB-166). A file-convention image at
 * the root is inherited by every route that does not bring its own, and is
 * rendered once at build time.
 */
export const alt = "Viberation. Ship your first app with AI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // The logo SVG paints with currentColor, which an <img> cannot inherit.
  const svg = await readFile(path.join(process.cwd(), "public/brand/logo-horizontal.svg"), "utf8");
  const logo = `data:image/svg+xml;base64,${Buffer.from(
    svg.replace('fill="currentColor"', 'fill="#fffff2"'),
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#011aff",
          color: "#fffff2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not the page */}
        <img src={logo} width={420} height={78} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>
            Ship your first app with AI.
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, color: "#e4ff1a" }}>
            No guesswork. No hype.
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>Tools, guides and walkthroughs for vibe coders</div>
      </div>
    ),
    size,
  );
}
