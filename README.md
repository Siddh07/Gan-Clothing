# Garment Association of Nepal (GAN) - B2B Export Directory & CMS Platform

A production-grade B2B Export Directory and CMS platform built for the **Garment Association of Nepal (GAN)**. The platform enables international garment buyers from North America, Europe, and Asia to discover verified Nepalese garment mills, inspect technical machinery capabilities, verify international compliance credentials (WRAP, OEKO-TEX, GOTS, Sedex), and dispatch Requests for Quotation (RFQs). GAN administrators have full CMS governance over member mills, apparel catalogs, and buyer trade leads.

---

## 🚀 Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions, TypeScript)
- **Database & ORM**: SQLite (Local Zero-Config Prototype) / PostgreSQL (Neon / Supabase / Self-hosted) with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js v4.24.7 pinned) with bcrypt password hashing and JWT sessions
- **UI & Styling**: Tailwind CSS, Lucide Icons, Glassmorphism, Responsive Mobile-First Design
- **Forms & Validation**: React Hook Form, Zod schemas, Anti-bot Honeypot
- **Email Service**: Resend API for parallel multi-party transactional RFQ lead routing
- **Storage Adapter**: Cloudinary Cloud Adapter (`src/lib/storage.ts`) preventing ephemeral serverless filesystem traps
- **SEO & Metadata**: Dynamic `generateMetadata`, JSON-LD Structured Data (`Organization`, `Product`), dynamic `/sitemap.xml`, and `/robots.txt`

---

## 🛠️ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Your `.env` will default to local SQLite with zero external database dependencies:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gan_nepal_secret_key_change_in_production_2024"
RESEND_API_KEY="" # Optional: Leave blank to log emails to development console
RESEND_FROM_EMAIL="trade-desk@ganepal.org"
GAN_ARCHIVE_EMAIL="leads@ganepal.org"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 3. Initialize Database & Seed Realistic Exporters
Run the automated schema sync and seed script:
```bash
npm run db:push
npm run db:seed
```

This seeds:
- **Default Super Admin**:
  - Email: `admin@ganepal.org`
  - Password: `Admin@GAN2024!`
- **5 Realistic Nepalese Garment Export Mills**:
  1. *Himalayan Knitwear Industries Pvt. Ltd.* (Kathmandu) - Cashmere & merino knitwear
  2. *Kathmandu Apparels & Textiles Ltd.* (Lalitpur) - High-capacity woven shirts & uniforms
  3. *Everest Technical & Outdoor Garments* (Biratnagar) - Alpine hardshells & fleece outerwear
  4. *Valley Woven Mills & Garments Pvt. Ltd.* (Bhaktapur) - Selvedge denim & organic canvas
  5. *Annapurna Himalayan Eco-Fiber Industries* (Pokhara) - Wild Himalayan nettle (Allo) & hemp
- **Verified Certifications**: WRAP Gold, OEKO-TEX Standard 100, Sedex SMETA 4-Pillar, GOTS Organic, ISO 9001.
- **Product samples** with high-resolution Unsplash apparel photography.
- **Realistic international B2B inquiries** from global retail groups.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Switching to PostgreSQL for Production (Neon / Supabase)

To switch the database engine from SQLite to PostgreSQL:

1. In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. In `.env`, set your connection pool string:
```env
DATABASE_URL="postgresql://username:password@ep-sample-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

3. Push the schema to your live PostgreSQL database:
```bash
npx prisma db push
npx prisma db seed
```

---

## 🛡️ Technical Architecture & Built-in Safeguards

1. **No Ephemeral Storage Loss**:
   The application avoids saving binary uploads to the local `/public/uploads` directory (which gets erased on Vercel/serverless re-deploys). Instead, `src/lib/storage.ts` and `/api/upload` integrate with Cloudinary, while providing high-resolution hosted fallbacks in development.

2. **NextAuth Version Lock**:
   Pinned to stable `next-auth@4.24.7` to prevent breaking changes associated with NextAuth v5 beta in Next.js 14 App Router route handlers.

3. **URL Search Parameter State Synchronization**:
   Directory filters (Category, Certification, MOQ, Destination Market, Search keyword, Grid/List view mode) are bound directly to URL search parameters (`/directory?category=knitwear&certification=WRAP`). This ensures:
   - Complete shareability between international buying teams.
   - Deep search engine indexability of niche category pages.
   - Browser back/forward navigation retains exact filter state.

4. **Multi-Party B2B RFQ Lead Engine**:
   Every buyer inquiry is validated with Zod, protected against bots with a silent honeypot, logged to the `LeadInquiry` table, and dispatches parallel transactional emails via Resend to:
   - Buyer acknowledgment receipt.
   - Target factory sales contact.
   - GAN Secretariat trade desk archive.

---

## 📁 Key Routes Summary

| Route | Description |
|---|---|
| `/` | Public Landing Page: Hero, live metrics, categories, "Why Source Nepal", featured mills |
| `/directory` | Searchable Exporter Catalog with faceted filters, search, and grid/list views |
| `/directory/[slug]` | Factory Profile Detail: Overview, machinery specs, certifications, products, direct RFQ |
| `/products` | Export Garment Showroom with sector filter pills and specifications |
| `/products/[slug]` | Product Detail: Image gallery with hover zoom, technical spec table, factory attribution |
| `/rfq` | Global Trade Desk RFQ submission form |
| `/admin` | CMS Dashboard: Exporter KPIs, live products, pending trade leads |
| `/admin/enterprises` | Factory CRUD, verification toggles, capacity limits |
| `/admin/products` | Apparel Sample Catalog CRUD, featured toggles |
| `/admin/inquiries` | Trade lead triage log with status workflow (`NEW` -> `FORWARDED` -> `CLOSED`) and CSV export |
| `/api/export-csv` | Streamed CSV download of all buyer inquiries |
| `/sitemap.xml` | Dynamic SEO sitemap generator |
| `/robots.txt` | Crawler policy configuration |
