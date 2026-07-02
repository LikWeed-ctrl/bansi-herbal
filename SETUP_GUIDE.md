# 🌿 Krishna's Herbal & Ayurveda — Complete Setup Guide

This guide will take you from zero to a live website in about **30 minutes**.  
Everything is **100% FREE** — no credit card needed.

---

## What You'll Set Up
- **Supabase** — Free database + image storage + login
- **Netlify** — Free website hosting
- Your **admin panel** to manage everything

---

## STEP 1 — Create Supabase Account (5 min)

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with your Google or GitHub account (free)
3. Click **New Project**
4. Fill in:
   - **Name**: `krishnas-herbal` (or any name)
   - **Database Password**: Create a strong password (save it somewhere!)
   - **Region**: Choose **Southeast Asia (Singapore)** — closest to India
5. Click **Create new project** and wait ~2 minutes for it to set up

---

## STEP 2 — Set Up the Database (5 min)

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file **`supabase-setup.sql`** from your website files
4. Copy ALL the contents and paste them into the SQL Editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned"

✅ Your database is ready!

---

## STEP 3 — Create Admin Login (3 min)

1. In Supabase, go to **Authentication** → **Users** (in left sidebar)
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: your email (e.g., admin@krishnasherbal.com)
   - **Password**: choose a strong password
4. Click **Create user**

✅ Your admin login is created!

---

## STEP 4 — Create Image Storage (2 min)

1. In Supabase, go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly: **`images`**
4. Toggle **Public bucket** to ON (very important!)
5. Click **Create bucket**

✅ Image storage is ready!

---

## STEP 5 — Get Your Supabase Keys (2 min)

1. In Supabase, go to **Settings** (gear icon at bottom left)
2. Click **API** in the settings menu
3. You'll see two things you need:
   - **Project URL** — looks like `https://abcdef.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
4. Copy both — you'll need them in the next step

---

## STEP 6 — Add Your Keys to the Website Files (5 min)

You need to replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in **3 files**:

### In `index.html`:
Find these lines near the bottom:
```
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const WHATSAPP_NUMBER = '91XXXXXXXXXX';
```
Replace with your actual values. For WHATSAPP_NUMBER, use your number like `919876543210` (91 = India code, then your 10 digit number, no + or spaces).

### In `admin-login.html`:
Find the same two lines and replace.

### In `admin.html`:
Find the same two lines and replace.

**How to edit:** Open the file in Notepad (right-click → Open with → Notepad) and use Ctrl+H (Find & Replace).

---

## STEP 7 — Deploy to Netlify (5 min)

1. Go to **https://netlify.com** and sign up (free)
2. After login, you'll see a dashboard
3. **Drag and drop your entire website folder** (the folder with index.html, admin.html, etc.) onto the Netlify dashboard area that says "drag and drop your site folder here"
4. Netlify will give you a free link like `https://random-name-123.netlify.app`
5. (Optional) Click **Domain settings** → **Add custom domain** if you have your own domain

✅ Your website is LIVE!

---

## STEP 8 — Set Up Your Business Details (3 min)

1. Go to your website URL and add `/admin-login.html` at the end
   - Example: `https://your-site.netlify.app/admin-login.html`
2. Login with the email and password you created in Step 3
3. Go to **Settings** tab
4. Fill in:
   - Your WhatsApp number
   - Your shop address
   - Your phone number
5. Click **Save All Settings**

---

## STEP 9 — Add Your Categories and Products

### Add a Category:
1. Go to **Categories** in admin
2. Click **+ Add Category**
3. Add name, emoji, description
4. Click Save

### Add a Product:
1. Go to **Products** in admin
2. Click **+ Add Product**
3. Fill in name, price, category
4. Upload a photo (or paste a photo URL)
5. Click Save — it appears on website immediately!

---

## How the WhatsApp Order Works

When a customer orders:
1. They browse your website and add items to cart
2. They click "Order on WhatsApp"
3. They fill in their name, phone, address
4. WhatsApp opens on their phone with a pre-written message like:

```
🌿 New Order - Krishna's Herbal & Ayurveda

👤 Customer: Rahul Sharma
📱 Phone: 9876543210
📍 Address: 12/A Park Street, Kolkata - 700016

🛒 Order Details:
  • Diabic Care Juice × 2 = ₹598
  • Brain Care Tablet × 1 = ₹299

💰 Total: ₹897

Please confirm my order. Thank you! 🙏
```

5. They just hit SEND — the order comes to YOU!

---

## How to Update Your Website

Whenever you make changes to the files:
1. Go to Netlify
2. Go to your site → **Deploys**
3. Drag and drop the updated folder again

OR — even easier — just manage everything from the **Admin Panel**! You don't need to edit files for products or settings.

---

## Frequently Asked Questions

**Q: Is this really free?**
A: Yes! Supabase free tier gives you 500MB database + 1GB storage. Netlify free tier gives you unlimited static hosting. Both are more than enough for this website.

**Q: What if my WhatsApp number changes?**
A: Just go to Admin → Settings and update it. No need to edit files.

**Q: Can I add more than 8 categories?**
A: Yes, add as many as you want from the Admin panel!

**Q: Can customers see all products?**
A: Only "Active" products show on the website. You can hide/show products from Admin → Products.

**Q: How do I add images?**
A: Go to Admin → Image Gallery → Upload Images. Then when adding a product, the uploaded URL will be available to paste.

---

## Need Help?

If anything doesn't work, check:
1. Did you replace both `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in all 3 files?
2. Did you run the SQL in Step 2?
3. Is your storage bucket named exactly `images` with Public turned ON?

---

*Website built with ❤️ for Krishna's Herbal & Ayurveda*
