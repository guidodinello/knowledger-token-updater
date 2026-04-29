#!/usr/bin/env node
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconPath = join(__dirname, "../src/public/icons/knowledger-token-updater-icon.svg");
const outputDir = join(__dirname, "../src/public/icons");

const sizes = [16, 32, 48, 128];
const svg = readFileSync(iconPath, "utf-8");

console.log("Generating PNG icons from SVG...\n");

for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`);
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
    const pngBuffer = resvg.render().asPng();
    writeFileSync(outputPath, pngBuffer);
    console.log(`✓ Generated ${size}x${size}: icon-${size}.png`);
}

console.log("\n✅ All icons generated successfully!");
