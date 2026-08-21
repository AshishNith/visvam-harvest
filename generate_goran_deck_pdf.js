import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePitchDeckPDF() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath64 = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
  
  let executablePath = edgePath;
  if (!fs.existsSync(edgePath)) {
    if (fs.existsSync(edgePath64)) {
      executablePath = edgePath64;
    } else if (fs.existsSync(chromePath)) {
      executablePath = chromePath;
    }
  }

  const htmlPath = path.join(__dirname, "goran_ai_pitch_deck.html");
  const pdfPath = path.join(__dirname, "GoRan_AI_Pitch_Deck.pdf");

  console.log("Launching browser for PDF generation...");
  console.log("Using browser at:", executablePath);

  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--force-device-scale-factor=2",
      "--hide-scrollbars",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
  });

  console.log("Loading HTML content:", htmlPath);
  await page.goto(`file://${htmlPath}`, { waitUntil: ["load", "networkidle0"] });

  // Ensure fonts and icons are completely rendered
  await new Promise(r => setTimeout(r, 1500));

  console.log("Generating 16:9 widescreen PDF presentation...");
  await page.pdf({
    path: pdfPath,
    width: "1920px",
    height: "1080px",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "0px",
      bottom: "0px",
      left: "0px",
      right: "0px",
    },
  });

  await browser.close();
  console.log("PDF generated successfully at:", pdfPath);
}

generatePitchDeckPDF().catch(err => {
  console.error("PDF Generation Error:", err);
  process.exit(1);
});
