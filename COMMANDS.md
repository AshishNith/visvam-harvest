# Viśvam Harvest — Developer Commands Cheat Sheet

This document contains all useful CLI commands and workflows for managing the **Viśvam Harvest** full-stack application (Frontend, Backend API, and Admin Panel).

---

## 🚀 Quick Start (Running All Services)

To run the complete application locally, open 3 terminal windows:

| Service | Directory | Command | URL / Port |
| :--- | :--- | :--- | :--- |
| **Frontend Website** | `./` (Root) | `npm run dev` | `http://localhost:8080` (or `8081` / `5173`) |
| **Backend API Server** | `./Backend` | `npm run dev` | `http://localhost:5000` |
| **Admin Panel** | `./AdminPanel` | `npm run dev` | `http://localhost:5174` (or `3000`) |

---

## 1. 🛍️ Frontend Website Commands (Root Directory)

Run these commands from the main project root folder (`f:\Agency CLients works\Visvam`):

```bash
# Start Frontend Development Server
npm run dev

# Build Frontend Web Application for Production
npm run build

# Preview Production Build Locally
npm run preview
```

---

## 2. ⚙️ Backend API Commands (`./Backend`)

Run these commands inside the `Backend` directory (`cd Backend`):

```bash
# Start Backend API in Development Watch Mode
npm run dev

# Upload All Product Images to Cloudinary CDN & Sync URLs
npm run upload-images

# Seed MongoDB Database with Products, Categories & Prices
npm run seed

# Build Backend TypeScript to Output (dist/server.js)
npm run build

# Run Compiled Production Server
npm start
```

---

## 3. 🛠️ Admin Panel Commands (`./AdminPanel`)

Run these commands inside the `AdminPanel` directory (`cd AdminPanel`):

```bash
# Start Admin Panel Development Server
npm run dev

# Build Admin Panel for Production
npm run build

# Preview Admin Panel Production Build
npm run preview
```

---

## 🖼️ Cloudinary CDN Re-Upload Workflow

Whenever you change or update your Cloudinary credentials:

1. Open `Backend/.env` and update your keys:
   ```env
   CLOUDINARY_CLOUD_NAME=dvwpxb2oa
   CLOUDINARY_API_KEY=245288651492261
   CLOUDINARY_API_SECRET=zZpHwJfgJLKeT8iah3vnSbxQLWI
   ```

2. Also update `VITE_CLOUDINARY_CLOUD_NAME` in `.env` (Frontend) and `AdminPanel/.env`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=dvwpxb2oa
   ```

3. Run the uploader script from the `Backend` directory:
   ```bash
   cd Backend
   npm run upload-images
   ```

This automatically uploads all local images in `src/Categorized_Photos`, outputs `cloudinary_mapping.json`, and updates MongoDB product image links.

---

## 🔑 Environment Files Overview

| File | Location | Purpose |
| :--- | :--- | :--- |
| **`.env`** | `./` (Root) | Frontend API URL (`VITE_API_URL`) & Firebase/Cloudinary client keys |
| **`Backend/.env`** | `./Backend` | Backend server port, MongoDB URI, JWT Secret, Cloudinary API keys |
| **`AdminPanel/.env`** | `./AdminPanel` | Admin panel API URL & Cloudinary configuration |

---

## 🍃 MongoDB Setup & Seeding

- Default MongoDB URI: `mongodb://127.0.0.1:27017/visvam_harvest`
- If local MongoDB is not running, the backend automatically uses `mongodb-memory-server` as an in-memory fallback.
- To reset or re-populate products and categories, run:
  ```bash
  cd Backend
  npm run seed
  ```
