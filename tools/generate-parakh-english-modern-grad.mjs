import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const outputRoot =
  "/Users/keshavgupta/Claude/apps/parakh/flyers-en/modern-grad-2026-09-03";
const logoPng =
  "/Users/keshavgupta/Claude/apps/parakh/flyers/redesign-modern-grad-2026-09-03/source-assets/logo-horizontal.png";
const officialLogoSvg =
  "/Users/keshavgupta/Claude/apps/parakh/brand/svg/logo-horizontal.svg";

const dirs = {
  instagramSource: join(outputRoot, "source", "instagram-2160x2700"),
  xSource: join(outputRoot, "source", "x-2400x2400"),
  instagramPng: join(outputRoot, "instagram"),
  xPng: join(outputRoot, "x"),
  assets: join(outputRoot, "source-assets"),
  docs: join(outputRoot, "docs"),
};

const colors = {
  paper: "#f4f1ed",
  paper2: "#fbf8f4",
  plum: "#6b2d5c",
  deep: "#4e1f43",
  ink: "#201d1d",
  body: "#4a515e",
  mute: "#7a828f",
  pale: "#f4eaf1",
  faint: "#fbf3f8",
  mid: "#a97199",
};

const cards = [
  {
    id: "01-new-buyer-credit",
    tag: "Before extending credit",
    eyebrow: "New buyer",
    line1: "Before you give credit,",
    accent: "know the record.",
    sub: [
      "A new buyer may sound right.",
      "The public record gives useful context.",
    ],
  },
  {
    id: "02-slow-payer",
    tag: "When payments slow",
    eyebrow: "Slow payer",
    line1: "When payments slow,",
    accent: "read today’s record.",
    sub: [
      "The relationship may be old.",
      "The current record can still change the context.",
    ],
  },
  {
    id: "03-territory-agency",
    tag: "Before territory",
    eyebrow: "Agency check",
    line1: "Before granting territory,",
    accent: "match the name.",
    sub: [
      "One name on a card, another in GST.",
      "Match identity before the agreement.",
    ],
  },
  {
    id: "04-unknown-supplier",
    tag: "Before advance",
    eyebrow: "Supplier advance",
    line1: "Before sending advance,",
    accent: "check the GSTIN.",
    sub: [
      "Low price and upfront payment can travel together.",
      "Read the public record before money moves.",
    ],
  },
  {
    id: "05-stuck-money",
    tag: "When money is stuck",
    eyebrow: "Stuck money",
    line1: "Before the next step,",
    accent: "clarify the entity.",
    sub: [
      "Recovery choices need clean identity first.",
      "See what public records can and cannot say.",
    ],
  },
];

const panelRows = [
  ["Legal name", "identity on GSTIN"],
  ["Business structure", "company / firm / proprietor"],
  ["GST status", "status + filing pattern"],
  ["Court records", "available public cases"],
];

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const text = (
  x,
  y,
  value,
  {
    size,
    fill = colors.ink,
    weight = 400,
    anchor = "start",
    family = "Onest, Rubik, DM Sans, Arial, sans-serif",
    style = "",
    spacing = "0",
    opacity = 1,
  },
) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${fill}" opacity="${opacity}"${style ? ` style="${style}"` : ""}>${esc(value)}</text>`;

const serif = (x, y, value, opts = {}) =>
  text(x, y, value, {
    family: "Instrument Serif, Iowan Old Style, Georgia, serif",
    style: "font-style:italic",
    ...opts,
  });

const logoImage = (x, y, w, h, logoData) =>
  `<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/png;base64,${logoData}"/>`;

const circles = (cx, cy, base, count, step, opacity = 0.14) =>
  Array.from({ length: count }, (_, i) => {
    const r = base + i * step;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.plum}" stroke-width="1.4" stroke-dasharray="2 18" opacity="${opacity - i * 0.018}"/>`;
  }).join("");

const baseDefs = () => `
  <defs>
    <radialGradient id="modernWash" cx="50%" cy="22%" r="90%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="46%" stop-color="${colors.faint}"/>
      <stop offset="100%" stop-color="#eadde7"/>
    </radialGradient>
    <linearGradient id="plumCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.plum}"/>
      <stop offset="52%" stop-color="${colors.deep}"/>
      <stop offset="100%" stop-color="#7b356b"/>
    </linearGradient>
    <radialGradient id="plumGlow" cx="88%" cy="12%" r="90%">
      <stop offset="0%" stop-color="${colors.mid}" stop-opacity="0.55"/>
      <stop offset="48%" stop-color="${colors.deep}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${colors.deep}" stop-opacity="0"/>
    </radialGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="34" stdDeviation="42" flood-color="#4e1f43" flood-opacity="0.18"/>
    </filter>
    <filter id="microShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#4e1f43" flood-opacity="0.08"/>
    </filter>
  </defs>`;

const panel = ({ x, y, w, h, scale = 1 }) => {
  const leftX = x + 110 * scale;
  const dividerX = x + 728 * scale;
  const rightX = x + 814 * scale;
  const rowGap = 122 * scale;
  const rowStart = y + 286 * scale;

  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${88 * scale}" fill="url(#plumCard)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${88 * scale}" fill="url(#plumGlow)"/>
    <rect x="${leftX}" y="${y + 138 * scale}" width="${562 * scale}" height="${64 * scale}" rx="${32 * scale}" fill="#ffffff" opacity="0.14"/>
    ${text(leftX + 38 * scale, y + 181 * scale, "ONE GSTIN → PUBLIC RECORDS", {
      size: 30 * scale,
      fill: "#f7eef5",
      weight: 600,
      spacing: "2",
    })}
    ${text(leftX, y + 328 * scale, "parakh.biz", {
      size: 112 * scale,
      fill: "#ffffff",
      weight: 600,
    })}
    ${text(leftX, y + 470 * scale, "Enter GSTIN", {
      size: 78 * scale,
      fill: "#ffffff",
      weight: 600,
    })}
    ${text(leftX, y + 570 * scale, "Read records", {
      size: 56 * scale,
      fill: "#eadde6",
      weight: 500,
    })}
    ${text(leftX, y + 652 * scale, "See sources & limits", {
      size: 52 * scale,
      fill: "#eadde6",
      weight: 500,
    })}
    <line x1="${dividerX}" y1="${y + 110 * scale}" x2="${dividerX}" y2="${y + 652 * scale}" stroke="#ffffff" stroke-opacity="0.34" stroke-width="${4 * scale}"/>
    ${text(rightX, y + 180 * scale, "What the check shows", {
      size: 70 * scale,
      fill: "#ffffff",
      weight: 600,
    })}
    ${panelRows
      .map(([label, detail], index) => {
        const rowY = rowStart + index * rowGap;
        return [
          `<circle cx="${rightX + 40 * scale}" cy="${rowY - 24 * scale}" r="${36 * scale}" fill="${colors.paper2}" opacity="0.98"/>`,
          text(rightX + 40 * scale, rowY - 12 * scale, String(index + 1), {
            size: 34 * scale,
            fill: colors.plum,
            weight: 600,
            anchor: "middle",
          }),
          text(rightX + 108 * scale, rowY - 12 * scale, label, {
            size: 45 * scale,
            fill: "#ffffff",
            weight: 600,
          }),
          text(rightX + 108 * scale, rowY + 40 * scale, detail, {
            size: 29 * scale,
            fill: "#eadde6",
            weight: 500,
          }),
          index < panelRows.length - 1
            ? `<line x1="${rightX}" y1="${rowY + 66 * scale}" x2="${x + w - 118 * scale}" y2="${rowY + 66 * scale}" stroke="#ffffff" stroke-opacity="0.18" stroke-width="${1.7 * scale}"/>`
            : "",
        ].join("");
      })
      .join("")}
  </g>`;
};

const makeInstagramSvg = (card, logoData) => {
  const line1Size = card.id === "03-territory-agency" ? 128 : 136;
  const accentSize = card.id === "04-unknown-supplier" ? 148 : 156;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="2700" viewBox="0 0 2160 2700">
  ${baseDefs()}
  <rect width="2160" height="2700" fill="#ffffff"/>
  <rect x="32" y="32" width="2096" height="2038" rx="96" fill="url(#modernWash)"/>
  <g>${circles(1080, 760, 260, 7, 215, 0.16)}</g>

  <g filter="url(#microShadow)">
    <rect x="112" y="104" width="1936" height="112" rx="56" fill="#ffffff" opacity="0.78"/>
    ${logoImage(154, 139, 282, 65, logoData)}
    <rect x="1678" y="128" width="326" height="64" rx="32" fill="${colors.ink}"/>
    ${text(1841, 170, "parakh.biz", { size: 31, fill: "#ffffff", weight: 500, anchor: "middle" })}
  </g>

  <g>
    <rect x="910" y="302" width="80" height="80" rx="24" fill="${colors.plum}"/>
    ${text(950, 358, "P", { size: 50, fill: "#ffffff", weight: 600, anchor: "middle" })}
    ${text(1010, 352, "Parakh check", { size: 38, fill: colors.ink, weight: 500 })}
  </g>

  ${text(1080, 610, card.line1, {
    size: line1Size,
    fill: colors.ink,
    weight: 600,
    anchor: "middle",
  })}
  ${serif(1080, 790, card.accent, {
    size: accentSize,
    fill: colors.plum,
    weight: 600,
    anchor: "middle",
  })}
  ${card.sub
    .map((line, i) =>
      text(1080, 930 + i * 58, line, {
        size: 42,
        fill: i === 0 ? colors.ink : colors.body,
        weight: i === 0 ? 500 : 400,
        anchor: "middle",
      }),
    )
    .join("")}
  <rect x="714" y="1086" width="306" height="70" rx="35" fill="${colors.plum}"/>
  ${text(867, 1132, "parakh.biz", { size: 34, fill: "#ffffff", weight: 500, anchor: "middle" })}
  <rect x="1044" y="1086" width="402" height="70" rx="35" fill="${colors.pale}"/>
  ${text(1245, 1133, "Enter GSTIN", { size: 33, fill: colors.plum, weight: 600, anchor: "middle" })}

  ${panel({ x: 178, y: 1240, w: 1804, h: 746, scale: 1 })}

  <rect x="32" y="2110" width="2096" height="558" rx="92" fill="${colors.paper2}"/>
  ${logoImage(744, 2230, 672, 154, logoData)}
  <line x1="566" y1="2474" x2="1018" y2="2474" stroke="${colors.plum}" stroke-width="2" opacity="0.52"/>
  <rect x="1066" y="2460" width="28" height="28" transform="rotate(45 1080 2474)" fill="${colors.plum}"/>
  <line x1="1142" y1="2474" x2="1594" y2="2474" stroke="${colors.plum}" stroke-width="2" opacity="0.52"/>
  ${text(1080, 2570, "Start the check on the website", {
    size: 38,
    fill: colors.ink,
    weight: 500,
    anchor: "middle",
  })}
  ${text(1080, 2632, "Based on public records. Every report states its sources and limits.", {
    size: 28,
    fill: colors.mute,
    anchor: "middle",
  })}
</svg>`;
};

const makeXSvg = (card, logoData) => {
  const line1Size = card.id === "03-territory-agency" ? 118 : 128;
  const accentSize = card.id === "04-unknown-supplier" ? 136 : 146;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="2400" viewBox="0 0 2400 2400">
  ${baseDefs()}
  <rect width="2400" height="2400" fill="#ffffff"/>
  <rect x="36" y="36" width="2328" height="1786" rx="104" fill="url(#modernWash)"/>
  <g>${circles(1200, 760, 250, 7, 210, 0.15)}</g>

  <g filter="url(#microShadow)">
    <rect x="126" y="118" width="2148" height="118" rx="59" fill="#ffffff" opacity="0.78"/>
    ${logoImage(174, 154, 300, 69, logoData)}
    <rect x="1890" y="144" width="330" height="66" rx="33" fill="${colors.ink}"/>
    ${text(2055, 188, "parakh.biz", { size: 32, fill: "#ffffff", weight: 500, anchor: "middle" })}
  </g>

  <g>
    <rect x="1012" y="344" width="82" height="82" rx="24" fill="${colors.plum}"/>
    ${text(1053, 402, "P", { size: 52, fill: "#ffffff", weight: 600, anchor: "middle" })}
    ${text(1114, 396, "Parakh check", { size: 39, fill: colors.ink, weight: 500 })}
  </g>

  ${text(1200, 650, card.line1, {
    size: line1Size,
    fill: colors.ink,
    weight: 600,
    anchor: "middle",
  })}
  ${serif(1200, 826, card.accent, {
    size: accentSize,
    fill: colors.plum,
    weight: 600,
    anchor: "middle",
  })}
  ${card.sub
    .map((line, i) =>
      text(1200, 958 + i * 58, line, {
        size: 43,
        fill: i === 0 ? colors.ink : colors.body,
        weight: i === 0 ? 500 : 400,
        anchor: "middle",
      }),
    )
    .join("")}
  <rect x="822" y="1122" width="316" height="72" rx="36" fill="${colors.plum}"/>
  ${text(980, 1169, "parakh.biz", { size: 35, fill: "#ffffff", weight: 500, anchor: "middle" })}
  <rect x="1164" y="1122" width="414" height="72" rx="36" fill="${colors.pale}"/>
  ${text(1371, 1170, "Enter GSTIN", { size: 34, fill: colors.plum, weight: 600, anchor: "middle" })}

  ${panel({ x: 222, y: 1290, w: 1956, h: 760, scale: 1.02 })}

  <rect x="36" y="1866" width="2328" height="498" rx="104" fill="${colors.paper2}"/>
  ${logoImage(780, 1996, 840, 193, logoData)}
  ${text(1200, 2280, "Start the check on the website", {
    size: 42,
    fill: colors.ink,
    weight: 500,
    anchor: "middle",
  })}
  ${text(1200, 2340, "Public records only. Sources and limits stay clear.", {
    size: 30,
    fill: colors.mute,
    anchor: "middle",
  })}
</svg>`;
};

const renderPng = async (svgPath, pngPath) => {
  await execFileAsync("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
};

for (const dir of Object.values(dirs)) {
  await mkdir(dir, { recursive: true });
}

await copyFile(logoPng, join(dirs.assets, "logo-horizontal.png"));
await copyFile(officialLogoSvg, join(dirs.assets, "logo-horizontal-source.svg"));
const logoData = (await readFile(logoPng)).toString("base64");

for (const card of cards) {
  const instagramSvgPath = join(dirs.instagramSource, `${card.id}.svg`);
  const xSvgPath = join(dirs.xSource, `${card.id}.svg`);
  const instagramPngPath = join(dirs.instagramPng, `${card.id}.png`);
  const xPngPath = join(dirs.xPng, `${card.id}.png`);

  await writeFile(instagramSvgPath, makeInstagramSvg(card, logoData), "utf8");
  await writeFile(xSvgPath, makeXSvg(card, logoData), "utf8");
  await renderPng(instagramSvgPath, instagramPngPath);
  await renderPng(xSvgPath, xPngPath);
}

const readme = `# Parakh English modern-grad flyers

Generated 3 September 2026 from the English flyer themes using the same Modern Grad direction as the Hindi set.

## Output

- instagram/: 2160 x 2700 posts
- x/: 2400 x 2400 square posts
- source/: editable SVG layouts
- source-assets/: official Parakh logo source plus PNG render

## Copy boundary

These assets use a conservative website-first journey: parakh.biz, GSTIN entry, public records, and clear sources/limits. They deliberately exclude phone numbers, WhatsApp CTAs, pricing, free-check language, same-day or instant-result promises, scores, ratings, creditworthiness claims, legal outcomes, or recovery guarantees.
`;

await writeFile(join(outputRoot, "README.md"), readme, "utf8");

console.log(`Generated ${cards.length} English modern-grad flyer sets in ${outputRoot}`);
