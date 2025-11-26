import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Safari Packages
  const packages = [
    {
      slug: "snowmobile-safari",
      name: "Snowmobile Safari",
      description:
        "Explore the Arctic wilderness on a thrilling snowmobile adventure through pristine Lapland forests and frozen lakes.",
      basePrice: 120,
      durationMin: 240, // 4 hours
      capacity: 8,
      difficulty: "Moderate",
      imageUrl: "/images/snowmobile.jpg",
      active: true,
    },
    {
      slug: "enduro-bike-tour",
      name: "Enduro Bike Tour",
      description:
        "Experience the thrill of off-road biking through beautiful Finnish wilderness trails.",
      basePrice: 85,
      durationMin: 150, // 2.5 hours
      capacity: 12,
      difficulty: "Easy",
      imageUrl: "/images/enduro-bike.jpg",
      active: true,
    },
    {
      slug: "atv-extreme-safari",
      name: "ATV Extreme Safari",
      description:
        "For thrill-seekers looking for an advanced challenge through rugged Arctic terrain.",
      basePrice: 180,
      durationMin: 360, // 6 hours
      capacity: 6,
      difficulty: "Advanced",
      imageUrl: "/images/atv.jpg",
      active: true,
    },
  ];

  for (const pkg of packages) {
    await prisma.safariPackage.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
    console.log(`✓ Created/Updated package: ${pkg.name}`);
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
