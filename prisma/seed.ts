import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Garment Association of Nepal (GAN) database...");

  // Clear existing records in correct relation order
  await prisma.leadInquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.enterprise.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Super Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Admin@GAN2024!", salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@ganepal.org",
      name: "GAN Trade Desk Administrator",
      passwordHash,
      role: "SUPERADMIN",
    },
  });
  console.log(`✅ Seeded Super Admin: ${superAdmin.email}`);

  // 2. Seed Garment Categories
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
  console.log(`✅ Seeded ${Object.keys(categories).length} categories`);

  // 3. Seed 5 Realistic Nepalese Garment Export Factories
  const factories = [
    {
      name: "Himalayan Knitwear Industries Pvt. Ltd.",
      slug: "himalayan-knitwear",
      registrationNumber: "12456/051",
      panNumber: "300124567",
      description:
        "Founded in 1994, Himalayan Knitwear is Nepal's benchmark manufacturer for premium cashmere, ultra-fine merino wool, and organic cotton knitwear. Operating state-of-the-art Shima Seiki computerized flat knitting machines in Kathmandu, the facility ships high-end collections to luxury department stores across North America and Western Europe with strict zero-defect quality control.",
      yearEstablished: 1994,
      employeeCount: 480,
      monthlyCapacityPcs: 150000,
      address: "Plot 14-16, Balaju Industrial District",
      city: "Kathmandu",
      websiteUrl: "https://himalayanknitwear.com.np",
      contactEmail: "export@himalayanknitwear.com.np",
      contactPhone: "+977-1-4350123",
      logoUrl: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=200&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
      exportMarkets: "USA, Germany, Japan, United Kingdom, Canada",
      isVerified: true,
      certifications: [
        { name: "WRAP Gold Level", issuer: "Worldwide Responsible Accredited Production", certificateFileUrl: "https://example.com/certs/wrap-gold.pdf" },
        { name: "OEKO-TEX® Standard 100", issuer: "TESTEX AG, Zurich", certificateFileUrl: "https://example.com/certs/oekotex-standard.pdf" },
        { name: "ISO 9001:2015", issuer: "Bureau Veritas Certification", certificateFileUrl: "https://example.com/certs/iso-9001.pdf" },
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
          description: "Hand-finished crewneck pullover spun from genuine Nepalese Chyangra mountain goat down. Ultra-soft touch, ribbed collar, cuffs, and hem. Resistant to pilling with OEKO-TEX class 1 non-toxic reactive dyes.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
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
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
        {
          title: "Merino Wool Thermal Quarter-Zip Pullover",
          slug: "merino-wool-thermal-quarter-zip",
          categorySlug: "knitwear",
          fabricType: "100% Extra-fine Australian Merino Wool (19.5 Micron)",
          gsmWeight: 220,
          moq: 200,
          targetGender: "Men",
          description: "Active lifestyle thermal mid-layer with YKK antique metal zipper, raglan shoulder sleeves, and flatlock anti-chafing seams.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: false,
        },
      ],
    },
    {
      name: "Kathmandu Apparels & Textiles Ltd.",
      slug: "kathmandu-apparels",
      registrationNumber: "8745/045",
      panNumber: "300054321",
      description:
        "One of the earliest pioneers of Nepal's export apparel sector, Kathmandu Apparels operates an 80,000 sq.ft facility equipped with Juki automated sewing lines, Lectra CAD cutting tables, and in-house embroidery suites. The company holds long-term supplier agreements with leading European retail groups and North American private labels, with full social compliance accreditation.",
      yearEstablished: 1988,
      employeeCount: 850,
      monthlyCapacityPcs: 350000,
      address: "Industrial Area Road, Patan Industrial Estate",
      city: "Lalitpur",
      websiteUrl: "https://ktmapparels.com.np",
      contactEmail: "merchandising@ktmapparels.com.np",
      contactPhone: "+977-1-5524890",
      logoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
      exportMarkets: "USA, France, Netherlands, Australia, Germany",
      isVerified: true,
      certifications: [
        { name: "Sedex SMETA 4-Pillar", issuer: "SGS United Kingdom", certificateFileUrl: "https://example.com/certs/sedex-smeta.pdf" },
        { name: "WRAP Platinum Level", issuer: "Worldwide Responsible Accredited Production", certificateFileUrl: "https://example.com/certs/wrap-platinum.pdf" },
        { name: "ISO 14001:2015 Environmental", issuer: "TÜV SÜD", certificateFileUrl: "https://example.com/certs/iso-14001.pdf" },
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
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
        {
          title: "Structured Cotton Twill Cargo Work Trousers",
          slug: "structured-cotton-twill-cargo-trousers",
          categorySlug: "woven",
          fabricType: "98% Heavy Cotton Twill / 2% Elastane",
          gsmWeight: 280,
          moq: 600,
          targetGender: "Men",
          description: "Ergonomic multi-pocket field utility pants with triple-stitched stress points, heavy-duty brass YKK zipper, and reinforced knee articulation.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: false,
        },
      ],
    },
    {
      name: "Everest Technical & Outdoor Garments",
      slug: "everest-technical",
      registrationNumber: "25412/062",
      panNumber: "302198765",
      description:
        "Engineered in the shadow of the Himalayas, Everest Technical Garments manufactures extreme-weather mountaineering outerwear, seam-sealed waterproof hardshells, active down coats, and running apparel. Utilizing ultrasonic bonding and laser cutting, the factory supplies outdoor gear brands across Scandinavia and North America.",
      yearEstablished: 2005,
      employeeCount: 620,
      monthlyCapacityPcs: 180000,
      address: "Morang Industrial Corridor, Highway Road",
      city: "Biratnagar",
      websiteUrl: "https://everestoutdoor.com.np",
      contactEmail: "production@everestoutdoor.com.np",
      contactPhone: "+977-21-460912",
      logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80",
      exportMarkets: "Norway, Sweden, Germany, USA, United Kingdom, Austria",
      isVerified: true,
      certifications: [
        { name: "bluesign® System Partner", issuer: "bluesign technologies ag, Switzerland", certificateFileUrl: "https://example.com/certs/bluesign.pdf" },
        { name: "OEKO-TEX® Standard 100", issuer: "Hohenstein Institute", certificateFileUrl: "https://example.com/certs/hohenstein.pdf" },
        { name: "amfori BSCI Grade A", issuer: "amfori International", certificateFileUrl: "https://example.com/certs/bsci-grade-a.pdf" },
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
          description: "Fully seam-taped alpine mountaineering jacket with helmet-compatible storm hood, AquaGuard® waterproof zippers, underarm pit zips, and RECCO® avalanche reflector.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
        {
          title: "Polartec High-Loft Thermal Fleece Hoodie",
          slug: "polartec-high-loft-thermal-fleece",
          categorySlug: "activewear",
          fabricType: "100% Recycled Polyester High-Loft Shearling Fleece",
          gsmWeight: 310,
          moq: 400,
          targetGender: "Unisex",
          description: "Lightweight, breathable high-loft thermal mid-layer with elastane binding at cuffs and hood, zippered chest pocket, and drop-tail hem.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
      ],
    },
    {
      name: "Valley Woven Mills & Garments Pvt. Ltd.",
      slug: "valley-woven-mills",
      registrationNumber: "16789/055",
      panNumber: "301045612",
      description:
        "Located in historical Bhaktapur, Valley Woven Mills balances authentic Nepalese weaving traditions with modern sustainable garment processing. Featuring a dedicated sustainable laundry equipped with ozone washing and laser distressing machinery, the company manufactures premium denim, organic twill jackets, and natural linen collections for European eco-conscious brands.",
      yearEstablished: 1998,
      employeeCount: 390,
      monthlyCapacityPcs: 120000,
      address: "Suryabinayak Industrial Zone",
      city: "Bhaktapur",
      websiteUrl: "https://valleywoven.com.np",
      contactEmail: "inquiries@valleywoven.com.np",
      contactPhone: "+977-1-6612345",
      logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80",
      exportMarkets: "Japan, United Kingdom, Denmark, Germany, Italy",
      isVerified: true,
      certifications: [
        { name: "GOTS (Global Organic Textile Standard)", issuer: "Control Union Certifications", certificateFileUrl: "https://example.com/certs/gots.pdf" },
        { name: "WRAP Gold Certified", issuer: "WRAP USA", certificateFileUrl: "https://example.com/certs/wrap-gold.pdf" },
        { name: "Sedex Registered Facility", issuer: "Sedex Information Exchange", certificateFileUrl: "https://example.com/certs/sedex.pdf" },
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
          description: "Classic 5-pocket straight-fit selvedge denim woven on shuttle looms. Copper rivets, doughnut buttons, chain-stitched hem, and veg-tanned leather patch.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
        {
          title: "Organic Cotton Duck Canvas Utility Chore Coat",
          slug: "organic-cotton-utility-chore-coat",
          categorySlug: "woven",
          fabricType: "100% Organic Cotton Heavy Canvas (10oz)",
          gsmWeight: 340,
          moq: 350,
          targetGender: "Unisex",
          description: "Vintage-inspired workwear chore coat with corduroy spread collar, 4 patch pockets, reinforced elbow patches, and antique brass shank buttons.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: false,
        },
      ],
    },
    {
      name: "Annapurna Himalayan Eco-Fiber Industries",
      slug: "annapurna-eco-fiber",
      registrationNumber: "42109/069",
      panNumber: "304567890",
      description:
        "Annapurna Eco-Fiber is Nepal's internationally acclaimed social enterprise and manufacturer of high-value sustainable textiles. By harvesting wild Himalayan Giant Nettle (Allo), indigenous industrial hemp, and wild bamboo in collaboration with high-mountain indigenous women cooperatives, Annapurna exports regenerative luxury fashion to ethical boutiques across Switzerland, Japan, and the USA.",
      yearEstablished: 2012,
      employeeCount: 210,
      monthlyCapacityPcs: 65000,
      address: "Pokhara Industrial Estate, Kundahar",
      city: "Pokhara",
      websiteUrl: "https://annapurnaecofiber.com.np",
      contactEmail: "trade@annapurnaecofiber.com.np",
      contactPhone: "+977-61-524900",
      logoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop&q=80",
      exportMarkets: "Switzerland, Germany, USA, Canada, Japan, New Zealand",
      isVerified: true,
      certifications: [
        { name: "WFTO Guaranteed Fair Trade", issuer: "World Fair Trade Organization", certificateFileUrl: "https://example.com/certs/wfto.pdf" },
        { name: "GOTS (Global Organic Textile Standard)", issuer: "OneCert International", certificateFileUrl: "https://example.com/certs/gots-annapurna.pdf" },
        { name: "B-Corp Certified", issuer: "B Lab Global", certificateFileUrl: "https://example.com/certs/bcorp.pdf" },
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
          description: "Naturally antimicrobial and temperature-regulating woven shirt. Derived from indigenous Himalayan stinging nettle harvested sustainably above 2,500m altitude. Botanical indigo dyed.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
        {
          title: "Pure Handspun Organic Hemp Lightweight Kimono",
          slug: "pure-handspun-organic-hemp-kimono",
          categorySlug: "eco-fiber",
          fabricType: "100% Wild Nepalese Mountain Hemp",
          gsmWeight: 210,
          moq: 120,
          targetGender: "Women",
          description: "Breathable wrap kimono jacket handloomed on traditional wooden pit-looms by mountain artisan collectives. Accented with natural madder root red dye.",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
          ]),
          isFeatured: true,
        },
      ],
    },
  ];

  for (const factoryData of factories) {
    const { certifications, products, ...enterpriseInfo } = factoryData;

    const enterprise = await prisma.enterprise.create({
      data: {
        ...enterpriseInfo,
        certifications: {
          create: certifications,
        },
      },
    });

    console.log(`🏭 Created Enterprise: ${enterprise.name}`);

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
  }

  // 4. Seed Realistic B2B RFQs (Trade Inquiries)
  const himalayan = await prisma.enterprise.findUnique({ where: { slug: "himalayan-knitwear" } });
  const cashmereProd = await prisma.product.findUnique({ where: { slug: "grade-a-pure-cashmere-crewneck" } });
  const ktmApparels = await prisma.enterprise.findUnique({ where: { slug: "kathmandu-apparels" } });

  await prisma.leadInquiry.createMany({
    data: [
      {
        enterpriseId: himalayan?.id,
        productId: cashmereProd?.id,
        buyerName: "Marcus Vance",
        buyerEmail: "m.vance@nordstrom-apparel.com",
        buyerCompany: "Nordstrom Sourcing Group",
        buyerCountry: "United States",
        orderQuantityTarget: 2500,
        message: "We are developing our Fall/Winter luxury cashmere line and looking for WRAP-certified facilities capable of spinning 2-ply 12GG Chyangra yarns with custom Pantone dye matching. Please advise lead times for pre-production samples to Seattle.",
        status: "NEW",
      },
      {
        enterpriseId: ktmApparels?.id,
        productId: null,
        buyerName: "Elena Rostova",
        buyerEmail: "erostova@zalando-partner.de",
        buyerCompany: "Zalando Supply Chain SE",
        buyerCountry: "Germany",
        orderQuantityTarget: 10000,
        message: "Seeking Sedex SMETA audited facility for ongoing woven button-down shirts and cargo trousers for European distribution. We require EU GSP Form A compliance for preferential duty import.",
        status: "FORWARDED",
      },
      {
        enterpriseId: null, // General GAN trade inquiry
        productId: null,
        buyerName: "Kenji Takahashi",
        buyerEmail: "takahashi@mitsui-textiles.co.jp",
        buyerCompany: "Mitsui Apparel Corporation",
        buyerCountry: "Japan",
        orderQuantityTarget: 5000,
        message: "General inquiry to the Garment Association of Nepal: We are interested in setting up bilateral sourcing partnerships for Himalayan natural nettle (Allo) and organic mountain cotton fabrics under Japan-Nepal trade preferences.",
        status: "NEW",
      },
    ],
  });

  console.log("✅ Seeded initial B2B RFQ trade inquiries");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
