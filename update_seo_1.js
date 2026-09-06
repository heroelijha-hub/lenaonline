const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    id: "0da28c5d-dbfc-4ec8-9d25-1e336ce6f5e3",
    metaTitle: "Braunkohlebriketts REKORD (20x 25kg) Palette Kaufen",
    metaDescription: "Bestellen Sie die REKORD Braunkohlebriketts auf einer 500kg Palette (20x 25kg). Hoher Heizwert, langanhaltende Glut und einfache Lagerung für Ihren Kamin."
  },
  {
    id: "b3f6799a-60e9-4807-adf2-9911f8a82fa8",
    metaTitle: "Andora Deluxe Gasheizofen 3,4 kW | Top Heizleistung",
    metaDescription: "Der Andora Deluxe Gasheizofen (3,4 kW) bietet 44h Brenndauer, Piezozündung und das O2Guard System für höchste Sicherheit. Ideal für schnelle Wärme."
  },
  {
    id: "6dbab3f1-946d-4991-bcf3-0af067d39400",
    metaTitle: "THÜRINGER HD Holzpellets 6mm ENplusA1 | 975 kg Palette",
    metaDescription: "Premium Holzpellets 6mm ENplusA1 von THÜRINGER (65 x 15kg). Hoher Heizwert (5,3 kWh/kg), extrem wenig Asche und geringe Feuchtigkeit für sauberes Heizen."
  },
  {
    id: "360bf5a4-f3e2-4831-ab87-16a0600791c8",
    metaTitle: "PURLINE Biokamin BESTBIO DESIGN G | 2000W Wandmontage",
    metaDescription: "Entdecken Sie den wandmontierten PURLINE Biokamin (2000W). Modernes Design (70x20x60cm, 18,5kg) inklusive Aufhängungs-Kit für eine gemütliche Atmosphäre."
  },
  {
    id: "355bb33f-80ac-4a03-97b4-2b95293b9a68",
    metaTitle: "NEMAXX Pelletofen P12 Schwarz - 13,6 kW Leistung",
    metaDescription: "Kaufen Sie den NEMAXX Pelletofen P12 (13,6 kW, Schwarz). TÜV SÜD geprüft, erfüllt 1. und 2. Stufe BImSchV für umweltfreundliches und effizientes Heizen."
  }
];

async function main() {
  for (const update of updates) {
    await prisma.product.update({
      where: { id: update.id },
      data: {
        metaTitle: update.metaTitle,
        metaDescription: update.metaDescription
      }
    });
    console.log(`Updated ${update.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
