import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const width = 2160;
const height = 2700;
const outputRoot = "/Users/keshavgupta/Claude/apps/parakh/flyers/redesign-website-first-2026-09-03";
const sourceDir = join(outputRoot, "source");
const sourceAssetsDir = join(outputRoot, "source-assets");
const masterDir = join(outputRoot, "master-png");
const socialDir = join(outputRoot, "social-png");
const logoPath = join(sourceAssetsDir, "logo-horizontal.png");

const flyers = [
  {
    file: "01-nayi-party",
    eyebrow: "एक निर्णय से पहले",
    title: ["नई पार्टी को उधार देने से पहले —", "रिकॉर्ड में वह कौन है?"],
    intro: [
      "नया ग्राहक अच्छा बोल सकता है। उधार देने से पहले उसका GSTIN उस नाम, ढाँचे और", 
      "रिकॉर्ड से मिलाइए जो सार्वजनिक है।",
    ],
    evidence: [
      "वेबसाइट पर GSTIN डालें। Parakh Check चलाइए — नाम, व्यवसाय का ढाँचा, filing history",
      "और उपलब्ध प्रकाशित court records एक जगह देखें।",
    ],
    rows: [
      ["कानूनी नाम", ["GSTIN पर दर्ज नाम और सामने वाले ने जो नाम दिया — क्या दोनों एक हैं?"]],
      ["फर्म का ढाँचा", ["कंपनी, partnership या proprietorship — जिम्मेदारी की तस्वीर बदलती है।"]],
      ["अभी सक्रिय है?", ["registration status और filing activity में हाल का रिकॉर्ड क्या कहता है?"]],
      ["पहले कोई विवाद?", ["प्रकाशित court record में क्या मिला — और क्या नहीं मिला?"]],
    ],
  },
  {
    file: "02-purani-party-late",
    eyebrow: "जब भुगतान धीमा हो",
    title: ["पुरानी पार्टी देर कर रही है —", "अब रिकॉर्ड भी देखिए।"],
    intro: [
      "दो साल की पहचान payment history से बनती है। देरी शुरू हो तो आज का public record",
      "अलग सवाल पूछता है — अनुमान से पहले रिकॉर्ड देखिए।",
    ],
    evidence: [
      "GSTIN डालकर filing history, registration status और उपलब्ध court records देखें।",
      "सप्लाई रोकने या आगे बढ़ाने से पहले तस्वीर साफ़ करें।",
    ],
    rows: [
      ["फाइलिंग कब से बदली?", ["return history में gaps कब शुरू हुए — और कितने समय से हैं?"]],
      ["status क्या कहता है?", ["registration active है, cancelled है, या रिकॉर्ड में कुछ और दिखता है?"]],
      ["नाम वही है?", ["जिस पार्टी से व्यवहार हुआ, वही नाम GSTIN और रिकॉर्ड में दर्ज है या नहीं?"]],
      ["कोर्ट रिकॉर्ड में क्या है?", ["प्रकाशित मामलों को संदर्भ की तरह पढ़ें — फैसला अपने-आप न मानें।"]],
    ],
  },
  {
    file: "03-agency-distributor",
    eyebrow: "समझौते से पहले",
    title: ["एजेंसी देने से पहले —", "नाम किसका है?"],
    intro: [
      "visiting card पर एक नाम, GST record में दूसरा — agreement sign करने से पहले",
      "यह फर्क साफ़ करें।",
    ],
    evidence: [
      "GSTIN डालें। Registered legal name, business structure, registration date और",
      "उपलब्ध प्रकाशित court records देखें।",
    ],
    rows: [
      ["असल कानूनी नाम", ["trade name और GST record का legal name — agreement किस नाम पर होगा?"]],
      ["फर्म कितनी पुरानी है?", ["registration date से पता चलता है कि रिकॉर्ड में यह पहचान कब से है।"]],
      ["किस नाम से मामले हैं?", ["legal name और trade name — दोनों से प्रकाशित court record देखें।"]],
      ["किससे समझौता होगा?", ["territory देने से पहले उस entity की पहचान लिखित रूप से साफ़ रखें।"]],
    ],
  },
  {
    file: "04-advance-supplier",
    eyebrow: "पैसा जाने से पहले",
    title: ["एडवांस भेजने से पहले —", "₹3 लाख का सवाल।"],
    intro: [
      "कम भाव, तुरंत माल और पहले भुगतान — तीनों साथ हों तो पहले रिकॉर्ड देखना",
      "समझदारी है।",
    ],
    evidence: [
      "वेबसाइट पर GSTIN डालें और supplier के public record को समझें — registration,",
      "filing history, identity और उपलब्ध court records।",
    ],
    rows: [
      ["GSTIN पर नाम", ["जिस supplier को पैसा भेज रहे हैं, क्या वही नाम रिकॉर्ड में दर्ज है?"]],
      ["registration status", ["registration active है या रिकॉर्ड में कोई बदलाव दिख रहा है?"]],
      ["filing activity", ["हाल की filing history में continuity है या लंबे gaps दिखते हैं?"]],
      ["प्रकाशित मामले", ["court record में क्या उपलब्ध है — और रिपोर्ट क्या नहीं बता सकती?"]],
    ],
  },
  {
    file: "05-vasuli",
    eyebrow: "जब पैसा फँस जाए",
    title: ["पैसा फँस गया है —", "अब सामने वाला कौन है?"],
    intro: [
      "वसूली की शुरुआत गुस्से से नहीं, सही legal identity से होती है। पहले समझिए",
      "सार्वजनिक रिकॉर्ड कहाँ तक मदद कर सकता है।",
    ],
    evidence: [
      "GSTIN डालकर registered name, business structure, current status और उपलब्ध",
      "प्रकाशित court records देखें — फिर रिकॉर्ड की सीमा समझकर अगला कदम तय करें।",
    ],
    rows: [
      ["कौन-सा ढाँचा है?", ["company, partnership या proprietorship — legal identity अलग हो सकती है।"]],
      ["आज का status", ["registration status और उपलब्ध filing history में वर्तमान तस्वीर क्या है?"]],
      ["पहले से कोई मामला?", ["प्रकाशित court records में नाम, मामला और status को संदर्भ सहित पढ़ें।"]],
      ["रिकॉर्ड क्या नहीं कहता?", ["हर बात public record में नहीं होती — रिपोर्ट अपनी सीमाएँ साफ़ लिखती है।"]],
    ],
  },
];

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const text = (x, y, value, {
  size = 40,
  fill = "#16181d",
  weight = 400,
  family = "Kohinoor Devanagari, Devanagari MT, Noto Sans Devanagari, sans-serif",
  anchor = "start",
  className = "",
} = {}) => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${className}" font-family="${family}" font-size="${size}px" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;

const line = (x1, y1, x2, y2, stroke = "#ded8dc", widthValue = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${widthValue}"/>`;

const makeSvg = (flyer, logoData) => {
  const titleLines = flyer.title.map((value, index) => text(144, 390 + index * 122, value, { size: 104, weight: 500 })).join("");
  const introLines = flyer.intro.map((value, index) => text(144, 720 + index * 62, value, { size: 42, fill: "#4a515e" })).join("");
  const evidenceLines = flyer.evidence.map((value, index) => text(198, 1010 + index * 62, value, { size: 39, fill: "#16181d", weight: index === 0 ? 500 : 400 })).join("");

  const rows = flyer.rows.map(([heading, body], index) => {
    const top = 1350 + index * 222;
    const bodyLines = body.map((value, bodyIndex) => text(300, top + 105 + bodyIndex * 50, value, { size: 35, fill: "#4a515e" }));
    return [
      text(170, top + 42, String(index + 1), { size: 42, fill: "#6b2d5c", family: "Georgia, serif" }),
      text(300, top + 43, heading, { size: 41, weight: 600 }),
      ...bodyLines,
      line(144, top + 184, 2016, top + 184),
    ].join("");
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f4f1ed"/>
  <rect width="${width}" height="26" fill="#4e1f43"/>
  <g opacity="0.3" fill="none" stroke="#cdb9c8" stroke-width="2">
    <circle cx="1080" cy="1250" r="860"/>
    <circle cx="1080" cy="1250" r="690"/>
    <circle cx="1080" cy="1250" r="520"/>
  </g>
  <image x="144" y="126" width="501" height="115" href="data:image/png;base64,${logoData}"/>
  ${text(144, 302, flyer.eyebrow, { size: 32, fill: "#6b2d5c", weight: 500 })}
  ${text(2016, 176, "GST + कंपनी + कोर्ट रिकॉर्ड", { size: 32, fill: "#7a828f", anchor: "end" })}
  ${line(144, 250, 2016, 250, "#d2c7ce", 2)}
  ${titleLines}
  ${introLines}
  <rect x="144" y="900" width="1872" height="266" rx="4" fill="#f3e6ee"/>
  <rect x="144" y="900" width="12" height="266" fill="#6b2d5c"/>
  ${evidenceLines}
  ${rows}
  ${line(144, 2295, 2016, 2295, "#cfc3ca", 2)}
  ${text(144, 2395, "parakh.biz", { size: 70, weight: 600, fill: "#6b2d5c", family: "Onest, Arial, sans-serif" })}
  ${text(144, 2460, "वेबसाइट पर जाँच शुरू करें", { size: 40, fill: "#4a515e" })}
  <rect x="1430" y="2340" width="586" height="148" rx="74" fill="#6b2d5c"/>
  ${text(1723, 2402, "GSTIN डालें", { size: 38, fill: "#ffffff", weight: 600, anchor: "middle" })}
  ${text(1723, 2452, "रिपोर्ट देखें  →", { size: 34, fill: "#f3e6ee", anchor: "middle" })}
  ${text(144, 2630, "सार्वजनिक रिकॉर्ड पर आधारित जाँच।", { size: 29, fill: "#7a828f" })}
  ${text(144, 2672, "हर रिपोर्ट में सीमाएँ साफ़ लिखी होती हैं।", { size: 29, fill: "#7a828f" })}
</svg>`;
};

await mkdir(sourceDir, { recursive: true });
await mkdir(sourceAssetsDir, { recursive: true });
await mkdir(masterDir, { recursive: true });
await mkdir(socialDir, { recursive: true });
const logoData = (await readFile(logoPath)).toString("base64");

for (const flyer of flyers) {
  await writeFile(join(sourceDir, `${flyer.file}.svg`), makeSvg(flyer, logoData), "utf8");
}

const readme = `# Parakh website-first flyer redesign

Generated 3 September 2026. The five layouts preserve the supplied editorial Hindi reference while replacing the old contact/footer treatment with a website-first journey.

## Deliverables

- source/: editable SVG layouts with the official bilingual Parakh logo embedded from the supplied SVG asset
- source-assets/: a 501 × 115 PNG rendering of the supplied official SVG, used only to keep raster exports deterministic
- master-png/: 2160 × 2700 PNG exports
- social-png/: 1080 × 1350 PNG exports for 4:5 social posts

## Message map

1. 01-nayi-party — check a new customer’s legal identity, structure, GST status, filing activity, and available court records before offering credit.
2. 02-purani-party-late — use current public records as context when a long-standing customer’s payments begin arriving late.
3. 03-agency-distributor — reconcile the name, legal structure, registration details, and court-record identity before granting territory or signing.
4. 04-advance-supplier — check the supplier’s public record before sending a large advance; the ₹3 lakh example is retained as a campaign-specific scenario.
5. 05-vasuli — understand the counterparty’s structure, status, filing history, and available court records before deciding what can realistically be pursued.

## Copy boundary

The live homepage flow inspected for this redesign supports entering a GSTIN, running a Parakh check, and reviewing public-record findings. The flyers therefore use that journey and avoid repeating legacy free/paid/instant-result marketing claims still visible on the homepage.
`;
await writeFile(join(outputRoot, "README.md"), readme, "utf8");

console.log(`Generated ${flyers.length} editable SVG layouts in ${sourceDir}`);
