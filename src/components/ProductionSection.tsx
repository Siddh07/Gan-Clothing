import React from "react";
import Image from "next/image";

export interface ProductionCardItem {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export const DEFAULT_PRODUCTION_ITEMS: ProductionCardItem[] = [
  {
    id: "knitting-mill",
    title: "KNITTING MILL",
    description:
      "Our parent company Roopa Knitting Mills has been manufacturing world class knit textiles for the last 30 years in Toronto, Canada. Our knowledge base and state of the art knitting machines allow us to create the highest quality fabrics for every product in our line.",
    imageSrc: "/production/knitting-mill.jpg",
    imageAlt:
      "Knitting mill interior with state of the art industrial circular knitting machines",
  },
  {
    id: "dye-house",
    title: "DYE HOUSE",
    description:
      "Milling fabrics to the highest quality specifications is only the first part of our process. Our dye house is located a few metres from the mill and allows us the opportunity to be hands on with our products every step of the way.",
    imageSrc: "/production/dye-house.jpg",
    imageAlt:
      "Textile dye house with stainless steel dyeing vats and fabric finishing machines",
  },
  {
    id: "sewing-factory",
    title: "SEWING FACTORY",
    description:
      "Located only 15 km from the mill, our sewing operation is where art and manufacturing connect with unparalleled construction techniques and an extreme attention to detail. Every product is carefully sewn to the highest quality specification and quality assured before shipping to you.",
    imageSrc: "/production/sewing-factory.jpg",
    imageAlt:
      "Apparel sewing factory floor with skilled artisans at industrial sewing stations",
  },
];

export interface ProductionSectionProps {
  heading?: string;
  items?: ProductionCardItem[];
  className?: string;
}

export function ProductionSection({
  heading = "OUR PRODUCTION",
  items = DEFAULT_PRODUCTION_ITEMS,
  className = "",
}: ProductionSectionProps) {
  return (
    <section
      aria-labelledby="our-production-heading"
      className={`bg-[#EFECE6] border-t border-b border-[#DFD8CE] py-14 sm:py-20 lg:py-24 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading at Top Left */}
        <div className="mb-8 sm:mb-12">
          <h2
            id="our-production-heading"
            className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-[#231F20]"
          >
            {heading}
          </h2>
        </div>

        {/* 3-Column Production Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col group">
              {/* Aspect-Ratio Governed Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#DFD8CE] mb-4 sm:mb-5 border border-[#DFD8CE]">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>

              {/* Title Underneath Image */}
              <h3 className="font-mono text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#231F20] mb-2 sm:mb-2.5">
                {item.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-[12px] sm:text-[13px] text-[#5E5F5A] leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
