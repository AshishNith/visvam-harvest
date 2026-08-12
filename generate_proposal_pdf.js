import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  
  let executablePath = edgePath;
  if (!fs.existsSync(edgePath) && fs.existsSync(chromePath)) {
    executablePath = chromePath;
  }

  const htmlPath = path.join(__dirname, "Visvam_Feature_Proposal.html");
  const pdfPath = path.join(__dirname, "Visvam_Client_Feature_Proposal.pdf");

  console.log("Launching browser for PDF generation...");
  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "10mm",
      right: "10mm",
    },
  });

  await browser.close();
  console.log("PDF generated successfully at:", pdfPath);
}

generatePDF().catch(err => {
  console.error("PDF Generation Error:", err);
  process.exit(1);
});
