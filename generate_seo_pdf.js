import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSEOPDF() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const htmlPath = path.join(__dirname, "client_seo_action_guide.html");
  const pdfPath = path.join(__dirname, "Visvam_SEO_Action_Guide.pdf");

  console.log("Launching Edge Puppeteer to generate PDF...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "12mm",
      right: "12mm",
    },
  });

  await browser.close();
  console.log("PDF generated successfully at:", pdfPath);
}

generateSEOPDF().catch(console.error);
