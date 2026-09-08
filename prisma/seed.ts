import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Enterprise GAN Platform Database...");

  // 1. Reset existing tables
  await prisma.analyticsEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inquiryNote.deleteMany();
  await prisma.leadInquiryItem.deleteMany();
  await prisma.leadInquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.enterprise.deleteMany();
  await prisma.category.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Admin@GAN2024!", salt);

  // 2. Seed Admin Users
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@ganepal.org",
      name: "GAN Secretariat Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const editorAdmin = await prisma.user.create({
    data: {
      email: "editor@ganepal.org",
      name: "GAN Trade Desk Editor",
      passwordHash,
      role: "ADMIN_EDITOR",
    },
  });

  console.log(`✅ Seeded Super Admin: ${superAdmin.email}`);
  console.log(`✅ Seeded Admin Editor: ${editorAdmin.email}`);

  // 3. Seed Categories
  const categoriesData = [
    {
      name: "Knitwear & Sweaters",
      slug: "knitwear",
      description: "Luxurious Himalayan cashmere, merino wool pullovers, cardigans, and combed cotton knits.",
    },
    {
      name: "Woven & Tailored Shirts",
      slug: "woven",
      description: "Precision-cut formal dress shirts, casual button-downs, twill trousers, and structured uniforms.",
    },
    {
      name: "Activewear & Technical Apparel",
      slug: "activewear",
      description: "High-altitude mountain shells, fleece midlayers, thermal running wear, and performance softshells.",
    },
    {
      name: "Eco-Fiber & Himalayan Hemp",
      slug: "eco-fiber",
      description: "Sustainable natural wild nettle (Allo), organic hemp, bamboo silk, and handloomed natural textiles.",
    },
    {
      name: "Denim & Workwear",
      slug: "denim",
      description: "Heavy-duty selvedge denim, enzyme washed utility wear, cargo pants, and reinforced work garments.",
    },
    {
      name: "Artisan & Handcrafted Apparel",
      slug: "traditional",
      description: "Traditional Dhaka patterned accents, hand-embroidered tunics, felted wool outerwear, and artisan scarves.",
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  // 4. Seed Factories & Factory Representatives
  const now = new Date();
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const factories = [
    {
      name: "Himalayan Knitwear Industries Pvt. Ltd.",
      slug: "himalayan-knitwear",
      status: "APPROVED",
      registrationNumber: "12456/051",
      panNumber: "300124567",
      description:
        "Founded in 1994, Himalayan Knitwear is Nepal's benchmark manufacturer for premium cashmere, ultra-fine merino wool, and organic cotton knitwear. Operating computerized Shima Seiki flat knitting machines in Kathmandu with strict zero-defect quality control.",
      yearEstablished: 1994,
      employeeCount: 480,
      monthlyCapacityPcs: 150000,
      address: "Plot 14-16, Balaju Industrial District",
      city: "Kathmandu",
      websiteUrl: "https://himalayanknitwear.com.np",
      contactEmail: "export@himalayanknitwear.com.np",
      contactPhone: "+977-1-4350123",
      logoUrl: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
      exportMarkets: "USA, Germany, Japan, United Kingdom, Canada",
      isVerified: true,
      repEmail: "rep.himalayan@ganepal.org",
      repName: "Prakash Shrestha (Factory Manager)",
      certifications: [
        {
          name: "WRAP Gold Level",
          issuer: "Worldwide Responsible Accredited Production",
          certificateNumber: "WRAP-NP-9942",
          issueDate: daysFromNow(-300),
          expiryDate: daysFromNow(65), // Active
          certificateFileUrl: "https://example.com/certs/wrap-gold.pdf",
        },
        {
          name: "OEKO-TEX® Standard 100",
          issuer: "TESTEX AG, Zurich",
          certificateNumber: "OEKO-2024-8871",
          issueDate: daysFromNow(-350),
          expiryDate: daysFromNow(15), // EXPIRING SOON (< 30 days)
          certificateFileUrl: "https://example.com/certs/oekotex.pdf",
        },
        {
          name: "ISO 9001:2015",
          issuer: "Bureau Veritas",
          certificateNumber: "BV-ISO-2015",
          issueDate: daysFromNow(-400),
          expiryDate: daysFromNow(-10), // EXPIRED
          certificateFileUrl: "https://example.com/certs/iso.pdf",
        },
      ],
      products: [
        {
          title: "Grade-A Pure Cashmere Crewneck Sweater",
          slug: "grade-a-pure-cashmere-crewneck",
          categorySlug: "knitwear",
          fabricType: "100% Chyangra Himalayan Cashmere (12 GG)",
          gsmWeight: 260,
          moq: 100,
          targetGender: "Unisex",
          description: "Hand-finished crewneck pullover spun from genuine Nepalese Chyangra mountain goat down. Ultra-soft touch, ribbed collar, cuffs, and hem. Resistant to pilling with non-toxic reactive dyes.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
          ]),
          isFeatured: true,
        },
        {
          title: "Organic Combed Cotton Ribbed Cardigan",
          slug: "organic-combed-cotton-ribbed-cardigan",
          categorySlug: "knitwear",
          fabricType: "100% GOTS Certified Organic Cotton (7 GG)",
          gsmWeight: 340,
          moq: 300,
          targetGender: "Women",
          description: "Heavyweight chunky ribbed cardigan with custom horn button closure. Knitted with zero-waste full-fashion technique on Japanese automated flatbeds.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",
          ]),
          isFeatured: true,
        },
      ],
    },
    {
      name: "Kathmandu Apparels & Textiles Ltd.",
      slug: "kathmandu-apparels",
      status: "APPROVED",
      registrationNumber: "8745/045",
      panNumber: "300054321",
      description:
        "Kathmandu Apparels operates an 80,000 sq.ft facility equipped with Juki automated sewing lines, Lectra CAD cutting tables, and in-house embroidery suites, holding long-term supplier agreements with leading European retail groups.",
      yearEstablished: 1988,
      employeeCount: 850,
      monthlyCapacityPcs: 350000,
      address: "Industrial Area Road, Patan Industrial Estate",
      city: "Lalitpur",
      websiteUrl: "https://ktmapparels.com.np",
      contactEmail: "merchandising@ktmapparels.com.np",
      contactPhone: "+977-1-5524890",
      logoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      exportMarkets: "USA, France, Netherlands, Australia, Germany",
      isVerified: true,
      repEmail: "rep.ktm@ganepal.org",
      repName: "Sunita Shakya (Merchandising Lead)",
      certifications: [
        {
          name: "Sedex SMETA 4-Pillar",
          issuer: "SGS United Kingdom",
          certificateNumber: "SEDEX-SMETA-4P-771",
          issueDate: daysFromNow(-180),
          expiryDate: daysFromNow(185),
          certificateFileUrl: "https://example.com/certs/sedex.pdf",
        },
        {
          name: "WRAP Platinum Level",
          issuer: "WRAP USA",
          certificateNumber: "WRAP-PLAT-1120",
          issueDate: daysFromNow(-90),
          expiryDate: daysFromNow(275),
          certificateFileUrl: "https://example.com/certs/wrap-plat.pdf",
        },
      ],
      products: [
        {
          title: "Classic Oxford 80s 2-Ply Cotton Dress Shirt",
          slug: "classic-oxford-cotton-dress-shirt",
          categorySlug: "woven",
          fabricType: "100% Combed Long-Staple Cotton Oxford Woven",
          gsmWeight: 145,
          moq: 500,
          targetGender: "Men",
          description: "High-thread-count button-down dress shirt with fused German interlinings, genuine mother-of-pearl buttons, and single-needle side seam construction.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
          ]),
          isFeatured: true,
        },
      ],
    },
    {
      name: "Everest Technical & Outdoor Garments",
      slug: "everest-technical",
      status: "APPROVED",
      registrationNumber: "25412/062",
      panNumber: "302198765",
      description:
        "Extreme-weather mountaineering outerwear, seam-sealed waterproof hardshells, active down coats, and running apparel with ultrasonic bonding and laser cutting lines.",
      yearEstablished: 2005,
      employeeCount: 620,
      monthlyCapacityPcs: 180000,
      address: "Morang Industrial Corridor, Highway Road",
      city: "Biratnagar",
      websiteUrl: "https://everestoutdoor.com.np",
      contactEmail: "production@everestoutdoor.com.np",
      contactPhone: "+977-21-460912",
      logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200",
      exportMarkets: "Norway, Sweden, Germany, USA, United Kingdom, Austria",
      isVerified: true,
      certifications: [
        {
          name: "bluesign® System Partner",
          issuer: "bluesign technologies ag",
          certificateNumber: "BS-PARTNER-409",
          issueDate: daysFromNow(-120),
          expiryDate: daysFromNow(245),
          certificateFileUrl: "https://example.com/certs/bluesign.pdf",
        },
      ],
      products: [
        {
          title: "3-Layer Alpine Summit Waterproof Hardshell Jacket",
          slug: "alpine-summit-waterproof-hardshell",
          categorySlug: "activewear",
          fabricType: "3-Ply Recycled Nylon Ripstop with PTFE Membrane (20k/20k)",
          gsmWeight: 165,
          moq: 250,
          targetGender: "Unisex",
          description: "Fully seam-taped alpine mountaineering jacket with helmet-compatible storm hood and AquaGuard® waterproof zippers.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800",
          ]),
          isFeatured: true,
        },
      ],
    },
    {
      name: "Valley Woven Mills & Garments Pvt. Ltd.",
      slug: "valley-woven-mills",
      status: "APPROVED",
      registrationNumber: "16789/055",
      panNumber: "301045612",
      description:
        "Sustainable denim and natural linen mill with dedicated ozone washing and laser distressing machinery in historical Bhaktapur.",
      yearEstablished: 1998,
      employeeCount: 390,
      monthlyCapacityPcs: 120000,
      address: "Suryabinayak Industrial Zone",
      city: "Bhaktapur",
      websiteUrl: "https://valleywoven.com.np",
      contactEmail: "inquiries@valleywoven.com.np",
      contactPhone: "+977-1-6612345",
      logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200",
      exportMarkets: "Japan, United Kingdom, Denmark, Germany, Italy",
      isVerified: true,
      certifications: [
        {
          name: "GOTS (Global Organic Textile Standard)",
          issuer: "Control Union",
          certificateNumber: "CU-GOTS-849201",
          issueDate: daysFromNow(-200),
          expiryDate: daysFromNow(165),
          certificateFileUrl: "https://example.com/certs/gots.pdf",
        },
      ],
      products: [
        {
          title: "13.5oz Raw Indigo Selvedge Denim Jeans",
          slug: "13-5oz-raw-indigo-selvedge-denim",
          categorySlug: "denim",
          fabricType: "100% Organic Ring-Spun Cotton Selvedge Denim",
          gsmWeight: 450,
          moq: 300,
          targetGender: "Men",
          description: "Classic 5-pocket straight-fit selvedge denim woven on shuttle looms with copper rivets.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
          ]),
          isFeatured: true,
        },
      ],
    },
    {
      name: "Annapurna Himalayan Eco-Fiber Industries",
      slug: "annapurna-eco-fiber",
      status: "APPROVED",
      registrationNumber: "42109/069",
      panNumber: "304567890",
      description:
        "Manufacturer of wild Himalayan Giant Nettle (Allo), indigenous industrial hemp, and wild bamboo silk in collaboration with mountain women cooperatives.",
      yearEstablished: 2012,
      employeeCount: 210,
      monthlyCapacityPcs: 65000,
      address: "Pokhara Industrial Estate, Kundahar",
      city: "Pokhara",
      websiteUrl: "https://annapurnaecofiber.com.np",
      contactEmail: "trade@annapurnaecofiber.com.np",
      contactPhone: "+977-61-524900",
      logoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200",
      exportMarkets: "Switzerland, Germany, USA, Canada, Japan, New Zealand",
      isVerified: true,
      certifications: [
        {
          name: "WFTO Guaranteed Fair Trade",
          issuer: "World Fair Trade Organization",
          certificateNumber: "WFTO-NP-014",
          issueDate: daysFromNow(-100),
          expiryDate: daysFromNow(265),
          certificateFileUrl: "https://example.com/certs/wfto.pdf",
        },
      ],
      products: [
        {
          title: "Wild Himalayan Nettle (Allo) Blended Field Shirt",
          slug: "wild-himalayan-nettle-allo-field-shirt",
          categorySlug: "eco-fiber",
          fabricType: "55% Wild Harvested Allo Nettle / 45% Organic Cotton",
          gsmWeight: 195,
          moq: 150,
          targetGender: "Unisex",
          description: "Naturally antimicrobial and temperature-regulating woven shirt derived from mountain stinging nettle.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",
          ]),
          isFeatured: true,
        },
      ],
    },
    // Seed 1 Pending Review Factory for the Onboarding Review Queue demo
    {
      name: "Lumbini Organic Knits & Dyeing Works",
      slug: "lumbini-organic-knits",
      status: "PENDING_REVIEW",
      registrationNumber: "51234/078",
      panNumber: "305987123",
      description:
        "Newly established modern circular knitting and low-impact herbal dyeing mill based in Rupandehi. Seeking GAN accreditation for European organic kids wear exports.",
      yearEstablished: 2023,
      employeeCount: 110,
      monthlyCapacityPcs: 45000,
      address: "Industrial Zone, Butwal-Bhairahawa Corridor",
      city: "Rupandehi",
      websiteUrl: "https://lumbiniknits.com.np",
      contactEmail: "info@lumbiniknits.com.np",
      contactPhone: "+977-71-540123",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200",
      coverImageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
      exportMarkets: "Germany, Denmark, Netherlands",
      isVerified: false,
      repEmail: "rep.lumbini@ganepal.org",
      repName: "Anil Gurung",
      certifications: [],
      products: [],
    },
  ];

  const createdEnterprises: Record<string, any> = {};

  for (const f of factories) {
    const { certifications, products, repEmail, repName, ...enterpriseData } = f;

    const enterprise = await prisma.enterprise.create({
      data: {
        ...enterpriseData,
        certifications: {
          create: certifications,
        },
      },
    });

    createdEnterprises[enterprise.slug] = enterprise;
    console.log(`🏭 Created Factory: ${enterprise.name} [${enterprise.status}]`);

    // Create factory products
    for (const prod of products) {
      const category = categories[prod.categorySlug];
      await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          fabricType: prod.fabricType,
          gsmWeight: prod.gsmWeight,
          moq: prod.moq,
          targetGender: prod.targetGender,
          description: prod.description,
          images: prod.images,
          isFeatured: prod.isFeatured,
          enterpriseId: enterprise.id,
          categoryId: category.id,
        },
      });
    }

    // Create Factory Rep Account if provided
    if (repEmail) {
      const rep = await prisma.user.create({
        data: {
          email: repEmail,
          name: repName || `${enterprise.name} Rep`,
          passwordHash,
          role: "FACTORY_REP",
          enterpriseId: enterprise.id,
        },
      });
      console.log(`  👤 Created Factory Rep: ${rep.email} -> ${enterprise.name}`);
    }
  }

  // 5. Seed Multi-Item B2B RFQ Inquiries
  const himalayan = createdEnterprises["himalayan-knitwear"];
  const ktm = createdEnterprises["kathmandu-apparels"];
  const cashmereProd = await prisma.product.findUnique({ where: { slug: "grade-a-pure-cashmere-crewneck" } });
  const shirtProd = await prisma.product.findUnique({ where: { slug: "classic-oxford-cotton-dress-shirt" } });

  // Lead 1: Multi-item inquiry to Himalayan & KTM
  const inquiry1 = await prisma.leadInquiry.create({
    data: {
      inquiryNumber: "GAN-RFQ-2026-001",
      buyerName: "Marcus Vance",
      buyerEmail: "m.vance@nordstrom-apparel.com",
      buyerCompany: "Nordstrom Luxury Sourcing Group",
      buyerCountry: "United States",
      generalMessage: "We are developing our Fall/Winter 2026 product collection. Requesting quotation for Chyangra cashmere knits and premium oxford shirts with custom brand neck labels.",
      status: "FORWARDED",
      targetDeliveryDate: daysFromNow(90),
      items: {
        create: [
          {
            enterpriseId: himalayan.id,
            productId: cashmereProd?.id,
            requestedQuantity: 2500,
            customSpecifications: "12 GG 2-ply pure cashmere in custom Pantone Heather Oatmeal. Packaged in biodegradable polybags.",
          },
          {
            enterpriseId: ktm.id,
            productId: shirtProd?.id,
            requestedQuantity: 5000,
            customSpecifications: "Oxford 80s 2-ply in Classic White and Light Blue. Single-needle tailored finish.",
          },
        ],
      },
      communications: {
        create: [
          {
            author: "GAN Trade Desk (Admin)",
            content: "Buyer credentials verified. Forwarded technical specifications to Himalayan Knitwear and Kathmandu Apparels merchandising teams.",
          },
          {
            author: "Prakash Shrestha (Himalayan Rep)",
            content: "Lab dip yarn swatches and pre-production cost matrix prepared. Awaiting final size breakdown.",
          },
        ],
      },
    },
  });

  // Lead 2: Single-item inquiry
  await prisma.leadInquiry.create({
    data: {
      inquiryNumber: "GAN-RFQ-2026-002",
      buyerName: "Elena Rostova",
      buyerEmail: "erostova@zalando-partner.de",
      buyerCompany: "Zalando Supply Chain SE",
      buyerCountry: "Germany",
      generalMessage: "Seeking Sedex SMETA audited factory for ongoing GSP Form A compliant knitwear and woven production.",
      status: "NEW",
      targetDeliveryDate: daysFromNow(120),
      items: {
        create: [
          {
            enterpriseId: himalayan.id,
            productId: null,
            requestedQuantity: 8000,
            customSpecifications: "General knitwear private label collection under EU GSP tariff preferences.",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded Multi-Item B2B Inquiries and communications");

  // 6. Seed Sample Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: "ENTERPRISE_APPROVED",
        entityType: "Enterprise",
        entityId: himalayan.id,
        metadata: JSON.stringify({ enterpriseName: himalayan.name, status: "APPROVED" }),
      },
      {
        userId: superAdmin.id,
        action: "COMPLIANCE_VERIFIED",
        entityType: "Certification",
        entityId: "cert-wrap-gold",
        metadata: JSON.stringify({ certification: "WRAP Gold Level", auditScore: "Grade A" }),
      },
      {
        userId: editorAdmin.id,
        action: "LEAD_FORWARDED",
        entityType: "LeadInquiry",
        entityId: inquiry1.id,
        metadata: JSON.stringify({ inquiryNumber: inquiry1.inquiryNumber, targets: ["Himalayan Knitwear", "Kathmandu Apparels"] }),
      },
    ],
  });

  // 7. Seed Sample Analytics Events
  await prisma.analyticsEvent.createMany({
    data: [
      { eventType: "PAGE_VIEW", enterpriseId: himalayan.id, countryCode: "US" },
      { eventType: "PAGE_VIEW", enterpriseId: himalayan.id, countryCode: "DE" },
      { eventType: "PAGE_VIEW", enterpriseId: himalayan.id, countryCode: "JP" },
      { eventType: "PAGE_VIEW", enterpriseId: ktm.id, countryCode: "US" },
      { eventType: "PAGE_VIEW", enterpriseId: ktm.id, countryCode: "UK" },
      { eventType: "RFQ_SENT", enterpriseId: himalayan.id, countryCode: "US" },
      { eventType: "RFQ_SENT", enterpriseId: ktm.id, countryCode: "DE" },
      { eventType: "CATALOG_DOWNLOAD", enterpriseId: himalayan.id, countryCode: "JP" },
    ],
  });

  console.log("✅ Seeded Audit Logs and Analytics Events");
  console.log("🎉 Enterprise platform seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
