# Domain Setup & DNS Configuration Guide for `visvam.in`

This guide provides step-by-step instructions to connect the custom domain **visvam.in** and **www.visvam.in** to your production deployment using **Spaceship.com** DNS settings.

---

## 🚀 Official Production DNS Records for Spaceship.com

Copy and paste the exact records below into your **Spaceship.com** Advanced DNS tab:

| Record Type | Host / Name | Value / Target | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` *(or blank)* | `216.198.79.1` | Automatic / 300s | Points `visvam.in` root domain to server |
| **CNAME** | `www` | `d417cae34a191192.vercel-dns-017.com.` | Automatic / 300s | Points `www.visvam.in` subdomain to server |

---

## 📋 Step-by-Step Instructions

### Step 1: Log in to Spaceship.com
1. Open [Spaceship.com](https://www.spaceship.com) and sign in to your registrar account.

### Step 2: Open Advanced DNS Settings
1. Click **Domains** or **Domain List** from the dashboard menu.
2. Select **visvam.in**.
3. Click on the **Advanced DNS** tab.

### Step 3: Add / Update Root A Record (`visvam.in`)
1. Click **Add New Record** (or edit existing A record).
2. Select **A Record** from the type dropdown.
3. Enter the following details:
   - **Host / Name**: `@` *(or leave blank for root domain)*
   - **IP Address / Value**: `216.198.79.1`
   - **TTL**: `Automatic` or `300`
4. Click **Save**.

### Step 4: Add / Update CNAME Record (`www.visvam.in`)
1. Click **Add New Record** (or edit existing CNAME record).
2. Select **CNAME Record** from the type dropdown.
3. Enter the following details:
   - **Host / Name**: `www`
   - **Target / Value**: `d417cae34a191192.vercel-dns-017.com.`
   - **TTL**: `Automatic` or `300`
4. Click **Save**.

### Step 5: Save All Changes & Verify Connection
1. Click **Save All Changes** in Spaceship.
2. Return to your hosting control panel and click **Refresh / Verify**.
3. DNS propagation typically takes **5 to 15 minutes** (up to 24 hours max).

---

## 🔒 Automatic SSL & Security
- As soon as the server detects `216.198.79.1` and `d417cae34a191192.vercel-dns-017.com.`, an SSL certificate (`https://visvam.in`) will automatically activate.
- Track worldwide propagation live on [DNSChecker.org](https://dnschecker.org/#A/visvam.in).

---

> [!NOTE]
> View and export this guide as a PDF directly on your site at:  
> **`https://visvam.in/domain-guide`**
