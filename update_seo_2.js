const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    id: "12236277-0194-490c-8848-76e7482a79ff",
    metaTitle: "Noble Flame JAVA Opti-myst Elektrokamin (Schwarz-Grau)",
    metaDescription: "Kaufen Sie den Noble Flame JAVA Opti-myst (Cassette 400 LED) in Schwarz-Grau. Inkl. Heizung, Knistereffekt und regulierbarem 3D-Flammeneffekt."
  },
  {
    id: "5afd962e-6628-4382-8936-fb8b27624df5",
    metaTitle: "Küchenofen Westminster K176FA-70 Schwarz Links (5 kW)",
    metaDescription: "Küchenofen Westminster K176FA-70 in Schwarz (Backofen Links). Heizen, Kochen und Backen mit 5 kW Nennwärmeleistung und robuster Stahlplatte."
  },
  {
    id: "89981881-f84d-48c5-bf40-32e1663977b8",
    metaTitle: "Noble Flame JAVA Opti-myst Elektrokamin (Platingrau)",
    metaDescription: "Noble Flame JAVA Opti-myst in Platingrau mit Heizung. Genießen Sie den 3D-Flammeneffekt, Knistereffekt und 1000/2000W Heizleistung. Interner Tank."
  },
  {
    id: "6c409a76-d68a-48ad-ab8f-6991563fff51",
    metaTitle: "Noble Flame JAVA Opti-myst Elektrokamin (Weiß-Warm)",
    metaDescription: "Bestellen Sie den Noble Flame JAVA Opti-myst in Weiß-Warm. Elektrokamin mit Thermostat, Knistereffekt und regulierbarer Flamme."
  },
  {
    id: "6894cc62-22f7-48a9-b27b-345819c7d4ee",
    metaTitle: "Noble Flame ELLASON 610 Intensive Clear / Kristall",
    metaDescription: "Noble Flame ELLASON 610 Elektrokamin (Intensive Clear/Kristall). 1400/1600 Watt Heizleistung, separat schaltbarer Flammeneffekt für Ihr Wohnzimmer."
  },
  {
    id: "694ab43b-d698-4b59-9e16-1909c89a79ac",
    metaTitle: "Elektrokamin Noble Flame PARIS Schwarz 660 | Kaufen",
    metaDescription: "Elektrokamin Noble Flame PARIS (Schwarz 660). Kompakte Maße (66 x 13,5 x 42 cm), modernes Design und einfache Wandmontage oder Einbau."
  },
  {
    id: "cfdf59d5-f21b-4f00-ba8a-ec784d298b86",
    metaTitle: "Blumfeldt Flagranti Gasheizstrahler 8 kW",
    metaDescription: "Blumfeldt Flagranti Gasheizstrahler (8 kW). Elektrisches Zündsystem, 4 Sichtfenster aus Glas und Steindekoration für gemütliche Abende auf der Terrasse."
  },
  {
    id: "32222c2c-3b41-4ef8-894b-694b834f2574",
    metaTitle: "Wandkamin Bioethanol DELTA2 HORIZONTAL TÜV",
    metaDescription: "TÜV-geprüfter Bioethanol-Wandkamin DELTA2 HORIZONTAL. Hochwertige Materialien nach ISO 9001:2015 für sicheres und rußfreies Heizen."
  },
  {
    id: "c125e320-405e-4a22-aae7-e3a918616d3c",
    metaTitle: "Noble Flame ELLASON 1530 Saphirschwarz",
    metaDescription: "Noble Flame ELLASON 1530 Saphirschwarz Elektrokamin. Beeindruckende Feuerraumbreite, 1400/1600 W Heizleistung und edles Design."
  },
  {
    id: "3725acd4-5797-4be3-bacf-5b4f4f17441a",
    metaTitle: "Blumfeldt Goldflame Deluxe Terrassenheizstrahler (Silber)",
    metaDescription: "Blumfeldt Goldflame Deluxe Terrassenheizstrahler in Silber (11 kW). Inklusive Schlauch und Druckminderer für sofortige Wärme im Außenbereich."
  },
  {
    id: "5f652644-2f64-4ebf-b8a0-c26d79ce66b0",
    metaTitle: "Blumfeldt Flagranti Crystal View Gasheizstrahler",
    metaDescription: "Blumfeldt Flagranti Crystal View Gasheizstrahler mit Lavastein/Holzdeko. 4 Glas-Sichtfenster und elektrisches Zündsystem für die Terrasse."
  },
  {
    id: "3d7a987c-be28-4c52-861b-f7542c21d9f4",
    metaTitle: "Goldflame Deluxe Terrassenheizstrahler (11 kW)",
    metaDescription: "Goldflame Deluxe Gas-Heizstrahler (11 kW) mit Reflektor. Effiziente Hitzestrahlung, schwarze Pulverbeschichtung und einfacher Anschluss."
  },
  {
    id: "6beda8a7-5fa2-4ff7-93b0-76c70733799d",
    metaTitle: "Andora Flame Gasheizofen 3,4 kW Schwarz",
    metaDescription: "Andora Flame Gasheizofen (3,4 kW, Schwarz). Max. 44h Brenndauer, Piezo-Zündung und Bodenrollen für flexiblen Einsatz in gut belüfteten Räumen."
  },
  {
    id: "82b8fefa-b8a0-4600-b532-ce79961e202a",
    metaTitle: "Elektrokamin Noble Flame Paris 1530 Schwarz",
    metaDescription: "Großer Elektrokamin Noble Flame Paris 1530 in Schwarz (Breite 152,7 cm). Ideal für den Wandeinbau, realistisches Flammenbild und edle Optik."
  },
  {
    id: "14743e0f-6139-4c57-8a6f-b8278ed54b6a",
    metaTitle: "Noble Flame PARIS Elektrokamin Schwarz 1400",
    metaDescription: "Kaufen Sie den Noble Flame PARIS Schwarz 1400 Elektrokamin (Breite 139,7 cm). Einfache Installation, modernes Design und wohlige Atmosphäre."
  },
  {
    id: "ed0c0614-4024-475f-8acc-5bbb726a2fa4",
    metaTitle: "Blumfeldt Goldflame Deluxe Terrassenheizstrahler Schwarz",
    metaDescription: "Schwarzer Blumfeldt Goldflame Deluxe Gas-Heizstrahler (11 kW). Optimaler Wirkungsgrad, einfache Bedienung und stilvolles Design für den Garten."
  },
  {
    id: "b7798a2e-ac9d-46c3-b30d-5e704ce94301",
    metaTitle: "Nemaxx P9 Pelletofen 11 kW (Schwarz, WiFi-Ready)",
    metaDescription: "Nemaxx P9 Pelletkaminofen (11 kW, Schwarz). WiFi-Ready, Energieeffizienzklasse A+, geringe Ascheproduktion und sparsamer Verbrauch."
  },
  {
    id: "87ac690e-547f-4aec-b866-be2401c7899d",
    metaTitle: "Nemaxx P12 Pelletofen 13,6 kW (Schwarz, WiFi-Ready)",
    metaDescription: "Leistungsstarker Nemaxx P12 Pelletofen (13,6 kW, Schwarz). A+ Energieeffizienz, WiFi-Ready und hitzebeständiges Keramikglas."
  },
  {
    id: "356921d4-2738-4a16-8c46-bc1ad56de673",
    metaTitle: "Werkstattofen Megan 2.0 ECS (Stahl, 6,2 kW)",
    metaDescription: "Robuster Werkstattofen Megan 2.0 ECS (6,2 kW, Stahlkorpus). Heizt bis zu 88 m³ zuverlässig und effizient. Zeitbrandofen-Ausführung."
  },
  {
    id: "55662db9-978f-422b-ac13-8abc6de54ac1",
    metaTitle: "Andora Deluxe Gasheizofen | O2Guard System",
    metaDescription: "Andora Deluxe Gasheizofen mit O2Guard System für höchste Sicherheit. Bis zu 44h Brenndauer (Piezozündung) und ideal für 11kg Gasflaschen."
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
