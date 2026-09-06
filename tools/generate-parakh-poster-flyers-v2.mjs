import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const outputRoot =
  "/Users/keshavgupta/Claude/apps/parakh/flyers/redesign-modern-grad-2026-09-03";
const previousLogo =
  "/Users/keshavgupta/Claude/apps/parakh/flyers/redesign-website-first-2026-09-03/source-assets/logo-horizontal.png";
const officialLogoSvg =
  "/Users/keshavgupta/Claude/apps/parakh/brand/svg/logo-horizontal.svg";

const dirs = {
  masterSource: join(outputRoot, "source", "master-2160x2700"),
  xSource: join(outputRoot, "source", "x-1600x900"),
  masterPng: join(outputRoot, "master-png"),
  instagramPng: join(outputRoot, "instagram-png"),
  xPng: join(outputRoot, "x-png"),
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
  line: "#d8cbd3",
};

const cards = [
  {
    id: "01-nayi-party",
    issue: "नई पार्टी",
    tag: "CREDIT BEFORE GOODS",
    headline: ["उधार से पहले", "रिकॉर्ड देखिए."],
    sub: ["नई पार्टी अच्छी लग सकती है।", "GSTIN से उसका public record पढ़िए।"],
    points: [
      ["नाम", "legal name match"],
      ["ढाँचा", "company या proprietorship"],
      ["GST", "status और filing activity"],
      ["कोर्ट", "available public cases"],
    ],
    xPoints: [
      ["कानूनी नाम", "GSTIN पर दर्ज पहचान"],
      ["व्यवसाय ढाँचा", "company / firm / proprietor"],
      ["GST स्थिति", "status और filing pattern"],
      ["कोर्ट रिकॉर्ड", "available public cases"],
    ],
  },
  {
    id: "02-purani-party-late",
    issue: "पुरानी पार्टी",
    tag: "WHEN PAYMENTS SLOW",
    headline: ["देरी बढ़ रही है?", "रिकॉर्ड भी देखिए."],
    sub: ["रिश्ता पुराना हो सकता है।", "आज का public record फिर भी नया संदर्भ देता है।"],
    points: [
      ["फाइलिंग", "gaps कब शुरू हुए"],
      ["status", "active, cancelled, changed"],
      ["नाम", "same party in records"],
      ["कोर्ट", "context before escalation"],
    ],
    xPoints: [
      ["फाइलिंग बदली?", "gaps कब शुरू हुए"],
      ["GST status", "active / cancelled / changed"],
      ["नाम वही है?", "record identity match"],
      ["कोर्ट संदर्भ", "escalation से पहले context"],
    ],
  },
  {
    id: "03-agency-distributor",
    issue: "एजेंसी / डिस्ट्रीब्यूटर",
    tag: "BEFORE TERRITORY",
    headline: ["एजेंसी देने से पहले", "नाम मिलाइए."],
    sub: ["कार्ड पर एक नाम, GST में दूसरा।", "agreement से पहले legal identity साफ़ रखें।"],
    points: [
      ["legal name", "GSTIN पर दर्ज नाम"],
      ["structure", "firm किस रूप में है"],
      ["registration", "कब से registered है"],
      ["cases", "किस नाम से records हैं"],
    ],
    xPoints: [
      ["legal name", "agreement किस नाम पर"],
      ["structure", "firm का legal form"],
      ["registration", "कब से registered"],
      ["court identity", "किस नाम से cases"],
    ],
  },
  {
    id: "04-advance-supplier",
    issue: "एडवांस सप्लायर",
    tag: "BEFORE ADVANCE",
    headline: ["₹3 लाख भेजने से पहले", "GSTIN जाँचिए."],
    sub: ["कम भाव और upfront payment साथ आएं,", "तो पहले public record देखना बेहतर है।"],
    points: [
      ["नाम", "supplier वही है या नहीं"],
      ["status", "registration current है?"],
      ["filing", "recent continuity"],
      ["limits", "report क्या नहीं कहती"],
    ],
    xPoints: [
      ["supplier name", "GSTIN पर वही party?"],
      ["registration", "current status देखें"],
      ["filing pattern", "recent continuity"],
      ["report limits", "क्या नहीं दिखता"],
    ],
  },
  {
    id: "05-vasuli",
    issue: "वसूली",
    tag: "WHEN MONEY IS STUCK",
    headline: ["वसूली से पहले", "पहचान साफ़ करें."],
    sub: ["अगला कदम तय करने से पहले,", "सामने वाली entity रिकॉर्ड में कौन है देखें।"],
    points: [
      ["ढाँचा", "company, firm, proprietor"],
      ["status", "current registration"],
      ["history", "filing और available cases"],
      ["सीमाएँ", "public record कहाँ रुकता है"],
    ],
    xPoints: [
      ["legal entity", "किस नाम पर कदम"],
      ["current status", "registration की स्थिति"],
      ["record history", "filing + available cases"],
      ["सीमाएँ", "public record कहाँ रुकता है"],
    ],
  },
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
    family = "Onest, Arial, sans-serif",
    style = "",
    spacing = "0",
    opacity = 1,
  },
) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${fill}" opacity="${opacity}"${style ? ` style="${style}"` : ""}>${esc(value)}</text>`;

const hindi = (x, y, value, opts = {}) =>
  text(x, y, value, {
    family:
      "Kohinoor Devanagari, Devanagari MT, Noto Sans Devanagari, Arial, sans-serif",
    ...opts,
  });

const serif = (x, y, value, opts = {}) =>
  text(x, y, value, {
    family: "Instrument Serif, Iowan Old Style, Georgia, serif",
    ...opts,
  });

const logoImage = (x, y, w, h, logoData) =>
  `<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/png;base64,${logoData}"/>`;

const panelRows = [
  ["कानूनी नाम", "GSTIN पर दर्ज पहचान"],
  ["व्यवसाय ढाँचा", "company / firm / proprietor"],
  ["GST स्थिति", "status और filing pattern"],
  ["कोर्ट रिकॉर्ड", "उपलब्ध public cases"],
];

const compactPanelRows = [
  ["कानूनी नाम", "GSTIN पर दर्ज पहचान"],
  ["व्यवसाय ढाँचा", "company / firm / prop."],
  ["GST स्थिति", "status + filing pattern"],
  ["कोर्ट रिकॉर्ड", "available public cases"],
];

const circles = (cx, cy, base, count, step, opacity = 0.3) =>
  Array.from({ length: count }, (_, i) => {
    const r = base + i * step;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.plum}" stroke-width="1.4" stroke-dasharray="2 18" opacity="${opacity - i * 0.025}"/>`;
  }).join("");

const baseDefs = () => `
  <defs>
    <radialGradient id="modernWash" cx="50%" cy="22%" r="90%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="46%" stop-color="${colors.faint}"/>
      <stop offset="100%" stop-color="#eadde7"/>
    </radialGradient>
    <radialGradient id="paperGlow" cx="50%" cy="39%" r="73%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="58%" stop-color="${colors.faint}"/>
      <stop offset="100%" stop-color="#eee7e1"/>
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

const modernFlow = (x, y, scale = 1) => [
  `<rect x="${x}" y="${y}" width="${330 * scale}" height="${72 * scale}" rx="${36 * scale}" fill="#ffffff" opacity="0.16"/>`,
  text(x + 34 * scale, y + 47 * scale, "parakh.biz", {
    size: 32 * scale,
    fill: "#ffffff",
    weight: 600,
  }),
  `<circle cx="${x + 398 * scale}" cy="${y + 36 * scale}" r="${22 * scale}" fill="#ffffff" opacity="0.2"/>`,
  text(x + 398 * scale, y + 45 * scale, "→", {
    size: 28 * scale,
    fill: "#ffffff",
    weight: 600,
    anchor: "middle",
  }),
  `<rect x="${x + 452 * scale}" y="${y}" width="${260 * scale}" height="${72 * scale}" rx="${36 * scale}" fill="#ffffff" opacity="0.12"/>`,
  hindi(x + 488 * scale, y + 47 * scale, "GSTIN डालें", {
    size: 29 * scale,
    fill: "#ffffff",
    weight: 600,
  }),
].join("");

const pointRows = (card, x, y, w, gap, scale = 1, variant = "default") =>
  (variant === "x" ? card.xPoints || card.points : card.points)
    .map(([label, detail], index) => {
      const rowY = y + index * gap;
      return [
        `<circle cx="${x + 28 * scale}" cy="${rowY - 15 * scale}" r="${23 * scale}" fill="${colors.paper2}" opacity="0.96"/>`,
        text(x + 28 * scale, rowY - 4 * scale, String(index + 1), {
          size: 24 * scale,
          fill: colors.plum,
          weight: 700,
          anchor: "middle",
        }),
        hindi(x + 76 * scale, rowY - 4 * scale, label, {
          size: 30 * scale,
          fill: "#ffffff",
          weight: 700,
        }),
        text(x + 76 * scale, rowY + 36 * scale, detail, {
          size: 24 * scale,
          fill: "#eadde6",
          weight: 400,
        }),
        index < card.points.length - 1
          ? `<line x1="${x}" y1="${rowY + 58 * scale}" x2="${x + w}" y2="${rowY + 58 * scale}" stroke="#ffffff" stroke-opacity="0.14" stroke-width="${1.5 * scale}"/>`
          : "",
      ].join("");
    })
    .join("");

const actionPanelRows = (x, y, w, gap, scale = 1, variant = "default") =>
  (variant === "compact" ? compactPanelRows : panelRows)
    .map(([label, detail], index) => {
      const rowY = y + index * gap;
      return [
        `<circle cx="${x + 30 * scale}" cy="${rowY - 18 * scale}" r="${27 * scale}" fill="${colors.paper2}" opacity="0.98"/>`,
        text(x + 30 * scale, rowY - 6 * scale, String(index + 1), {
          size: 25 * scale,
          fill: colors.plum,
          weight: 600,
          anchor: "middle",
        }),
        hindi(x + 82 * scale, rowY - 8 * scale, label, {
          size: 34 * scale,
          fill: "#ffffff",
          weight: 600,
        }),
        hindi(x + 82 * scale, rowY + 34 * scale, detail, {
          size: 24 * scale,
          fill: "#eadde6",
          weight: 500,
        }),
        index < panelRows.length - 1
          ? `<line x1="${x}" y1="${rowY + 60 * scale}" x2="${x + w}" y2="${rowY + 60 * scale}" stroke="#ffffff" stroke-opacity="0.18" stroke-width="${1.6 * scale}"/>`
          : "",
      ].join("");
    })
    .join("");

const makeMasterSvg = (card, logoData) => {
  const headlineSize = card.id === "04-advance-supplier" ? 122 : 140;
  const accentSize = card.id === "04-advance-supplier" ? 128 : 150;

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
    <rect x="948" y="302" width="80" height="80" rx="24" fill="${colors.plum}"/>
    ${hindi(988, 362, "प", { size: 54, fill: "#ffffff", weight: 600, anchor: "middle" })}
    ${text(1048, 352, "Parakh check", { size: 38, fill: colors.ink, weight: 500 })}
  </g>

  <g>
    ${hindi(1080, 610, card.headline[0], {
      size: headlineSize,
      fill: colors.ink,
      weight: 600,
      anchor: "middle",
    })}
    ${hindi(1080, 790, card.headline[1], {
      size: accentSize,
      fill: colors.plum,
      weight: 500,
      anchor: "middle",
    })}
    ${card.sub
      .map((line, i) =>
        hindi(1080, 930 + i * 58, line, {
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
    ${hindi(1245, 1133, "GSTIN डालें", { size: 33, fill: colors.plum, weight: 600, anchor: "middle" })}
  </g>

  <g filter="url(#softShadow)">
    <rect x="178" y="1240" width="1804" height="746" rx="88" fill="url(#plumCard)"/>
    <rect x="178" y="1240" width="1804" height="746" rx="88" fill="url(#plumGlow)"/>
    <rect x="288" y="1378" width="562" height="64" rx="32" fill="#ffffff" opacity="0.14"/>
    ${text(326, 1421, "ONE GSTIN → PUBLIC RECORDS", {
      size: 30,
      fill: "#f7eef5",
      weight: 600,
      spacing: "2",
    })}
    ${text(288, 1568, "parakh.biz", { size: 112, fill: "#ffffff", weight: 600 })}
    ${hindi(288, 1710, "GSTIN डालें", { size: 78, fill: "#ffffff", weight: 600 })}
    ${hindi(288, 1812, "रिकॉर्ड पढ़ें", { size: 56, fill: "#eadde6", weight: 500 })}
    ${hindi(288, 1894, "स्रोत और सीमाएँ देखें", { size: 52, fill: "#eadde6", weight: 500 })}
    <line x1="906" y1="1350" x2="906" y2="1892" stroke="#ffffff" stroke-opacity="0.34" stroke-width="4"/>
    ${hindi(992, 1420, "जाँच में क्या दिखेगा", { size: 70, fill: "#ffffff", weight: 600 })}
    ${actionPanelRows(992, 1526, 872, 122, 1.32)}
  </g>

  <rect x="32" y="2110" width="2096" height="558" rx="92" fill="${colors.paper2}"/>
  ${logoImage(744, 2230, 672, 154, logoData)}
  <line x1="566" y1="2474" x2="1018" y2="2474" stroke="${colors.plum}" stroke-width="2" opacity="0.52"/>
  <rect x="1066" y="2460" width="28" height="28" transform="rotate(45 1080 2474)" fill="${colors.plum}"/>
  <line x1="1142" y1="2474" x2="1594" y2="2474" stroke="${colors.plum}" stroke-width="2" opacity="0.52"/>

  ${hindi(1080, 2570, "वेबसाइट पर जाँच शुरू करें", {
    size: 38,
    fill: colors.ink,
    weight: 500,
    anchor: "middle",
  })}
  ${hindi(1080, 2632, "सार्वजनिक रिकॉर्ड पर आधारित जाँच। हर रिपोर्ट में सीमाएँ साफ़ लिखी होती हैं।", {
    size: 28,
    fill: colors.mute,
    anchor: "middle",
  })}
</svg>`;
};

const makeXSvg = (card, logoData) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  ${baseDefs()}
  <rect width="1600" height="900" fill="#ffffff"/>
  <rect x="18" y="18" width="1564" height="864" rx="48" fill="url(#modernWash)"/>
  <g>${circles(642, 430, 180, 6, 136, 0.14)}</g>

  <g filter="url(#microShadow)">
    <rect x="64" y="58" width="1472" height="76" rx="38" fill="#ffffff" opacity="0.78"/>
    ${logoImage(94, 79, 226, 52, logoData)}
    <rect x="1310" y="74" width="184" height="44" rx="22" fill="${colors.ink}"/>
    ${text(1402, 103, "parakh.biz", { size: 21, fill: "#ffffff", weight: 500, anchor: "middle" })}
  </g>

  <g>
    <rect x="96" y="202" width="54" height="54" rx="16" fill="${colors.plum}"/>
    ${hindi(123, 243, "प", { size: 36, fill: "#ffffff", weight: 600, anchor: "middle" })}
    ${text(166, 236, "Parakh check", { size: 25, fill: colors.ink, weight: 500 })}
  </g>

  ${hindi(96, 356, card.headline[0], { size: 82, fill: colors.ink, weight: 600 })}
  ${hindi(96, 466, card.headline[1], { size: 90, fill: colors.plum, weight: 500 })}
  ${card.sub
    .map((line, i) =>
      hindi(100, 540 + i * 42, line, {
        size: 30,
        fill: i === 0 ? colors.ink : colors.body,
        weight: i === 0 ? 500 : 400,
      }),
    )
    .join("")}
  <rect x="96" y="650" width="214" height="50" rx="25" fill="${colors.plum}"/>
  ${text(203, 683, "parakh.biz", { size: 24, fill: "#ffffff", weight: 500, anchor: "middle" })}
  <rect x="326" y="650" width="232" height="50" rx="25" fill="${colors.pale}"/>
  ${hindi(442, 684, "GSTIN डालें", { size: 24, fill: colors.plum, weight: 600, anchor: "middle" })}

  <g filter="url(#softShadow)">
    <rect x="824" y="188" width="680" height="594" rx="52" fill="url(#plumCard)"/>
    <rect x="824" y="188" width="680" height="594" rx="52" fill="url(#plumGlow)"/>
    <rect x="882" y="248" width="288" height="38" rx="19" fill="#ffffff" opacity="0.14"/>
    ${text(902, 274, "ONE GSTIN → PUBLIC RECORDS", {
      size: 15,
      fill: "#f7eef5",
      weight: 600,
      spacing: "1",
    })}
    ${text(882, 350, "parakh.biz", { size: 50, fill: "#ffffff", weight: 600 })}
    ${hindi(882, 416, "GSTIN डालें", { size: 40, fill: "#ffffff", weight: 600 })}
    ${hindi(882, 470, "रिकॉर्ड पढ़ें", { size: 30, fill: "#eadde6", weight: 500 })}
    ${hindi(882, 514, "स्रोत और सीमाएँ देखें", { size: 28, fill: "#eadde6", weight: 500 })}
    <line x1="1198" y1="246" x2="1198" y2="708" stroke="#ffffff" stroke-opacity="0.34" stroke-width="2.4"/>
    ${hindi(1230, 274, "जाँच में क्या दिखेगा", { size: 28, fill: "#ffffff", weight: 600 })}
    ${actionPanelRows(1230, 348, 218, 82, 0.72, "compact")}
  </g>

  ${hindi(96, 812, "वेबसाइट पर जाँच शुरू करें", { size: 28, fill: colors.ink, weight: 500 })}
  ${hindi(440, 812, "सार्वजनिक रिकॉर्ड। सीमाएँ साफ़।", { size: 22, fill: colors.mute })}
</svg>`;

const renderPng = async (svgPath, pngPath) => {
  await execFileAsync("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
};

const resizePng = async (inputPath, outputPath, width, height) => {
  await execFileAsync("sips", [
    "--resampleHeightWidth",
    String(height),
    String(width),
    inputPath,
    "--out",
    outputPath,
  ]);
};

for (const dir of Object.values(dirs)) {
  await mkdir(dir, { recursive: true });
}

const logoOut = join(dirs.assets, "logo-horizontal.png");
await copyFile(previousLogo, logoOut);
await copyFile(officialLogoSvg, join(dirs.assets, "logo-horizontal-source.svg"));
const logoData = (await readFile(logoOut)).toString("base64");

for (const card of cards) {
  const masterSvgPath = join(dirs.masterSource, `${card.id}.svg`);
  const xSvgPath = join(dirs.xSource, `${card.id}.svg`);
  const masterPngPath = join(dirs.masterPng, `${card.id}.png`);
  const instagramPngPath = join(dirs.instagramPng, `${card.id}.png`);
  const xPngPath = join(dirs.xPng, `${card.id}.png`);

  await writeFile(masterSvgPath, makeMasterSvg(card, logoData), "utf8");
  await writeFile(xSvgPath, makeXSvg(card, logoData), "utf8");
  await renderPng(masterSvgPath, masterPngPath);
  await resizePng(masterPngPath, instagramPngPath, 1080, 1350);
  await renderPng(xSvgPath, xPngPath);
}

const philosophy = `# Modern Grad Parakh Poster

This direction adapts the Modern Grad design language to Parakh social flyers: soft light-first gradient slabs, enormous centered Hindi headlines, pill CTAs, generous rounded geometry, and one clear idea per post.

The visual rhythm is premium and product-led rather than brochure-like. A rounded wash section creates atmosphere, the official Parakh mark sits in a translucent nav pill, and the headline is treated as the main feed-stopping moment.

The deep plum panel is the operational heart of the piece. It acts like a dashboard card: parakh.biz, GSTIN entry, public-record reading, and source/limit awareness sit on the left; the four evidence cues sit on the right.

The bottom identity area stays calm and authoritative. It keeps the bilingual Parakh mark, the website-first CTA, and a limitations line without phone numbers, WhatsApp, pricing, free-check language, instant claims, scores, ratings, or guarantees.
`;

const readme = `# Parakh modern-grad flyer redesign

Generated 3 September 2026 using the Modern Grad visual system: rounded light-gradient slabs, giant centered type, pill CTAs, and a deep-plum dashboard-style action module.

## Output

- master-png/: 2160 x 2700 poster masters
- instagram-png/: 1080 x 1350 4:5 posts
- x-png/: 1600 x 900 X posts
- source/: editable SVG layouts
- source-assets/: official Parakh logo source plus deterministic PNG render
- docs/evidence-poster-philosophy.md: visual direction used

## Copy boundary

The live website was checked before generation. These assets only use the safer website-first journey: parakh.biz, GSTIN entry, public records, and report limits. They deliberately exclude phone number, WhatsApp CTA, pricing, free-check language, same-day or instant-result promises, scores, ratings, and legal or recovery guarantees.
`;

await writeFile(join(dirs.docs, "evidence-poster-philosophy.md"), philosophy, "utf8");
await writeFile(join(outputRoot, "README.md"), readme, "utf8");

console.log(`Generated ${cards.length} modern-grad poster sets in ${outputRoot}`);
