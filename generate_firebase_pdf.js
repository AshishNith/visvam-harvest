import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edgePath64 = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  
  let executablePath = edgePath;
  if (!fs.existsSync(edgePath)) {
    if (fs.existsSync(edgePath64)) {
      executablePath = edgePath64;
    } else if (fs.existsSync(chromePath)) {
      executablePath = chromePath;
    }
  }

  const htmlPath = path.join(__dirname, "firebase_setup_guide.html");
  const pdfPath = path.join(__dirname, "Visvam_Firebase_Setup_Guide.pdf");

  console.log("Launching browser for PDF generation...");
  console.log("Using browser at:", executablePath);

  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: ["load", "networkidle0"] });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "14mm",
      right: "14mm",
    },
  });

  await browser.close();
  console.log("PDF generated successfully at:", pdfPath);
}

generatePDF().catch(err => {
  console.error("PDF Generation Error:", err);
  process.exit(1);
});
