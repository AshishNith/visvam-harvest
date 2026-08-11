import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import sharp from "sharp";

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRootDir = path.resolve(__dirname, "../..");
const workspaceRootDir = path.resolve(backendRootDir, "..");
const envPath = path.resolve(backendRootDir, ".env");

// Load environment variables
dotenv.config({ path: envPath });

// Configure Cloudinary credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Cloudinary credentials missing in .env file!");
  console.error("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Backend/.env");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log(`☁️ Cloudinary initialized for Cloud Name: ${cloudName}`);

const photosDir = path.resolve(workspaceRootDir, "src/Categorized_Photos");

// Allowed image extensions
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function prepareImageBuffer(filePath: string): Promise<Buffer> {
  const stats = fs.statSync(filePath);
  const maxBytes = 8 * 1024 * 1024; // 8 MB limit for safety under Cloudinary free tier

  if (stats.size > maxBytes) {
    console.log(` ⚡ Compressing large image (${(stats.size / 1024 / 1024).toFixed(1)} MB)...`);
    return await sharp(filePath)
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  return fs.readFileSync(filePath);
}

async function uploadImages() {
  const imageFiles = getAllFiles(photosDir);
  console.log(`📁 Found ${imageFiles.length} local images in src/Categorized_Photos`);

  if (imageFiles.length === 0) {
    console.warn("⚠️ No images found to upload.");
    return;
  }

  const mappingResult: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    const relativePath = path.relative(photosDir, filePath).replace(/\\/g, "/");
    const fileName = path.basename(filePath, path.extname(filePath));
    const folderName = path.dirname(relativePath);
    const publicId = `visvam_harvest/${folderName}/${fileName}`.replace(/[^a-zA-Z0-9_\-\/]/g, "_");

    console.log(`\n[${i + 1}/${imageFiles.length}] Processing ${relativePath}...`);

    try {
      const imageBuffer = await prepareImageBuffer(filePath);

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            overwrite: true,
            resource_type: "image",
            tags: ["visvam_harvest", "dry_fruits", folderName],
          },
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        );
        stream.end(imageBuffer);
      });

      console.log(`✅ Uploaded: ${result.secure_url}`);
      mappingResult[relativePath] = result.secure_url;
      successCount++;
    } catch (err: any) {
      console.error(`❌ Failed to upload ${relativePath}:`, err.message || err);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Upload Complete! Success: ${successCount}, Failed: ${failCount}`);
  console.log(`========================================\n`);

  // Save URL mapping JSON
  const mappingPath = path.resolve(backendRootDir, "src/scripts/cloudinary_mapping.json");
  fs.writeFileSync(mappingPath, JSON.stringify(mappingResult, null, 2), "utf8");
  console.log(`💾 Saved Cloudinary URL mapping to: ${mappingPath}`);

  // Also save at root workspace
  const workspaceMappingPath = path.resolve(workspaceRootDir, "cloudinary_mapping.json");
  fs.writeFileSync(workspaceMappingPath, JSON.stringify(mappingResult, null, 2), "utf8");
  console.log(`💾 Saved Cloudinary URL mapping to: ${workspaceMappingPath}`);

  // Update MongoDB Product images with Cloudinary CDN URLs if MongoDB is running
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam_harvest";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("🔗 Connected to MongoDB to update product image URLs...");

    const Product = mongoose.model(
      "Product",
      new mongoose.Schema({ slug: String, images: [String] }, { strict: false }),
      "products"
    );

    const categoryMap: Record<string, string> = {
      "california-jumbo-almonds": "01_Almonds_Badam",
      "king-w240-cashews": "02_Cashews_Kaju",
      "kashmiri-snow-walnuts": "04_Walnuts_Akhrot",
      "roasted-salted-pistachios": "03_Pistachios_Pista",
      "iranian-mamra-almonds": "01_Almonds_Badam",
      "afghani-organic-anjeer": "05_Dates_Khajoor",
      "royal-medjool-dates": "05_Dates_Khajoor",
      "afghan-green-raisins": "06_Raisins_Kishmish",
      "wild-dried-berries-mix": "06_Raisins_Kishmish",
      "queensland-macadamia-nuts": "07_Peanuts_and_Other_Nuts",
      "7-in-1-superseeds-mix": "07_Peanuts_and_Other_Nuts",
      "royal-heritage-gift-box": "08_Assorted_Mix_and_Gift_Platters",
      "festive-nut-berry-celebration": "08_Assorted_Mix_and_Gift_Platters",
    };

    const products = await Product.find({});
    for (const prod of products) {
      const slug = (prod as any).slug;
      const folder = slug ? categoryMap[slug as string] : undefined;
      if (folder) {
        const matchingUrls = Object.entries(mappingResult)
          .filter(([key]) => key.startsWith(folder))
          .map(([, url]) => url);

        if (matchingUrls.length > 0) {
          prod.images = matchingUrls.slice(0, 3);
          await prod.save();
          console.log(`🖼️ Updated MongoDB product '${prod.slug}' with Cloudinary CDN URLs`);
        }
      }
    }

    await mongoose.disconnect();
    console.log("✅ MongoDB product image URLs updated cleanly.");
  } catch {
    console.log("ℹ️ MongoDB optional update skipped or server offline.");
  }
}

uploadImages().catch(console.error);
