const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { id: "20f97368-e7d6-4d05-b117-e143a216de3a", metaTitle: "Heizfuxx RUF Holzbriketts (Nadelholz, 960kg Palette) Kaufen", metaDescription: "CO2-neutrale Heizfuxx RUF Holzbriketts aus Nadelholz (960kg Palette). Ohne Bindemittel hydraulisch gepresst für effizientes und umweltfreundliches Heizen." },
  { id: "52341ee3-abda-4f40-9d34-e973b5af5a9b", metaTitle: "Kaminholz Buche/Eiche Mix (1 RM) Ofenfertig & Trocken Kaufen", metaDescription: "Trockenes, ofenfertiges Kaminholz (Buche & Eiche Mix, 1 RM) aus Baden-Württemberg. Ca. 25 cm Scheitlänge für perfekten Abbrand in Ihrem Kamin." },
  { id: "876fcd52-acb3-4b38-ad35-7018901313ee", metaTitle: "Prity FM Holzofen mit Backofen (12,1 kW) Kaufen", metaDescription: "Kaminofen Prity FM mit integriertem Backofen (12,1 kW). Hoher Wirkungsgrad (77,7%), ideal zum Heizen, Kochen und Backen in Ihrem Zuhause." },
  { id: "50811503-eaaa-441a-95ec-5d6e0c3eabe1", metaTitle: "Pelletofen Cadel Prince 11 (Titanium/Schwarz, 10,5 kW)", metaDescription: "Cadel Prince 11 Pelletofen in Titanium mit schwarzem Rahmen. 10 kW Nennwärmeleistung, Konvektionsgebläse und optional raumluftunabhängig nutzbar." },
  { id: "a50ee8f8-0872-4e6b-abd6-8728b4351945", metaTitle: "Moeby24 Küchenofen Lotus Inox | Gusseisen Holzherd (11,9 kW)", metaDescription: "Gusseiserner Moeby24 Lotus Inox Holzherd (11,91 kW). Energieeffizienz A+, 85% Wirkungsgrad und robuste Verarbeitung zum Backen und Heizen." },
  { id: "7b47e6aa-f723-4c29-aed7-c9428c9b612a", metaTitle: "Moeby24 Kaminofen Klassik Efes (Anthrazit, EEK A+) Kaufen", metaDescription: "Moeby24 Klassik Efes Kaminofen in Anthrazit. Erfüllt BImSchV 1 & 2, Energieeffizienz A+, Heizvermögen 70-90 m² und extrem hoher Wirkungsgrad." },
  { id: "8bfdfc0f-8d1b-434a-9d5f-3159eede9f13", metaTitle: "Kesser Prio Elektrokamin Large (1900W) | Echte Kaminstimmung", metaDescription: "Kesser Prio Elektrokamin Large (1900 W). Echte Kaminstimmung dank LED-Feuer mit glühenden Resin-Holzscheiten. Einstellbare Heizfunktion bis 28°C." },
  { id: "ac425fe3-8a82-4cd7-bfdb-c9896421493f", metaTitle: "Juskys Elektrischer Kamin Rechteckig (Weiß) | 2000W Heizlüfter", metaDescription: "Weißer Juskys Elektrokamin (1000/2000 W) mit romantischem Flammeneffekt und 13-farbiger LED-Ambientebeleuchtung. Inklusive Fernbedienung & LCD-Display." },
  { id: "da163d7e-d100-4210-9714-38caee2f294b", metaTitle: "Wamsler RH AD-8F Automatik Kaminofen Kaufen", metaDescription: "Entdecken Sie den Wamsler RH AD-8F Automatik Kaminofen. Hochwertige Qualität, effiziente Verbrennungssteuerung und klassisches Design für Ihr Zuhause." },
  { id: "bb67de5c-6a70-44d0-9a81-745015bdba69", metaTitle: "Fireplace Kaminofen Brasil (Specksteinverkleidung) Kaufen", metaDescription: "Fireplace Brasil Kaminofen mit wärmespeichernder Specksteinverkleidung. Heizt bis zu 108 m³, 24h Dauerbetrieb möglich und saubere Scheibenspülung." },
  { id: "3d33dfa4-4758-435e-b74d-92e1bab60ccc", metaTitle: "Bruno Cook 300 Küchenofen (Anthrazit, 10,5 kW) Backofen Rechts", metaDescription: "Anthrazitfarbener Küchenofen Bruno Cook 300 (10,5 kW). Gusseisen-Kochfeld, Backraum rechts. Ideal zum Heizen, Kochen und Backen." },
  { id: "19c4ceb7-db3f-418e-b1e5-4a94cc5d5893", metaTitle: "Bruno Cook 500 Küchenofen Bordeaux (12 kW) Backofen Links", metaDescription: "Bruno Cook 500 Küchenherd in Bordeaux (12 kW). Gusseiserne Herdplatte, Backraum links. Effizientes Heizen, Backen und Kochen mit Holz." },
  { id: "18de0c3d-cd1c-41b4-984a-82a1d3208e02", metaTitle: "Küchenofen Westminster K176FA-70 (Weiß, 5 kW, Rechts)", metaDescription: "Weißer Westminster K176FA-70 Küchenofen (5 kW) mit Rauchrohranschluss rechts. Robuste Stahlplatte zum Heizen, Kochen und Backen." },
  { id: "1d29f108-d6f2-492a-ad46-0b587512f725", metaTitle: "La Nordica Extraflame Dauerbrandofen & Herd (6,5 kW)", metaDescription: "La Nordica Extraflame Dauerbrandofen (6,5 kW) mit Gusseisen-Herdplatte und Backraum rechts. Traditionelles Heizen, Kochen und Backen vereint." },
  { id: "57f89527-e7ff-4599-ba32-0da0e0584265", metaTitle: "Kaminofen Wamsler Jupiter (Stahl Schwarz, 6 kW) Kaufen", metaDescription: "Wamsler Jupiter Zeitbrandofen in schwarzem Stahl (6 kW). Kompakte Maße (94x58,5x43,5 cm), hohe Heizleistung und modernes Design." },
  { id: "add63dbf-52be-4f1c-9bbf-73260a594b65", metaTitle: "Kaminofen Fireplace Royal (5 kW) | 90 m³ Raumheizvermögen", metaDescription: "Fireplace Royal Kaminofen (5 kW Nennwärmeleistung). Zeitbrandofen mit elegantem Design, heizt bis zu 90 m³. Maße: 123,3 x 45 x 45 cm." },
  { id: "9cb74617-2cae-4d77-b478-3c8454bda17f", metaTitle: "Kaminofen Panadero Harmonie (Stahl Schwarz, 7,2 kW)", metaDescription: "Panadero Harmonie Kaminofen in Schwarz (7,2 kW). Kraftvoller Zeitbrandofen für bis zu 220 m³ Raumvolumen. Robuster Stahlkorpus für langanhaltende Wärme." },
  { id: "2b7a7cd1-a499-4d82-8c1c-21db58e0e9f6", metaTitle: "Kaminofen Fireplace Tuvalu (Stahl Schwarz, 6 kW) Kaufen", metaDescription: "Schwarzer Kaminofen Fireplace Tuvalu mit Stahlverkleidung (6 kW). Effizienter Zeitbrandofen für bis zu 116 m³ Heizvermögen." },
  { id: "3003b368-77cb-4d80-a263-74dc78cfa041", metaTitle: "Kaminofen Aduro 9-7 (Stahl Schwarz, 6 kW) | Vermiculite", metaDescription: "Aduro 9-7 Zeitbrandofen aus schwarzem Stahl (6 kW). Hochwertige Vermiculite-Feuerraumauskleidung (150 x 50 x 44,7 cm) für effiziente Verbrennung." },
  { id: "8e4a55c1-d2a3-4053-b96b-dfcc2debc6d1", metaTitle: "Kaminofen Panadero Chopin (8,9 kW, Schwarz) mit Holzfach", metaDescription: "Panadero Chopin Kaminofen in Schwarz (8,9 kW). Integriertes Holzfach, 270 m³ Raumheizvermögen und modernes Design für Ihr Wohnzimmer." },
  { id: "9784836c-6280-44be-8f25-f5209e6b12c4", metaTitle: "La Nordica Extraflame Isotta (Gusseisen Schwarz, 11,9 kW)", metaDescription: "Massiver Dauerbrandofen La Nordica Extraflame Isotta (11,9 kW) aus schwarzem Gusseisen. Enormes Heizvermögen von 238 m³ für große Räume." },
  { id: "701f92dc-2d7a-4f92-89d7-24b6f4098435", metaTitle: "Kaminofen Panadero Ambar (Stahl Schwarz, 7,1 kW)", metaDescription: "Panadero Ambar Zeitbrandofen in Schwarz (7,1 kW). Wiegt 103 kg, integriertes Holzfach und optimale Maße (81 x 56,3 x 43 cm) für jedes Ambiente." },
  { id: "7ca35cfb-074e-4c21-a9f3-214511e81313", metaTitle: "Kaminofen Conforto Nyborg 3 GTS (Naturstein, 7,5 kW)", metaDescription: "Conforto Nyborg 3 GTS Kaminofen mit edler Natursteinverkleidung (7,5 kW). Wärmespeichernd, heizt bis zu 148 m³. Maße: 93,5 x 53,2 x 42,4 cm." },
  { id: "1c49f8fd-9110-41e9-bdda-3d79ee1ec325", metaTitle: "Wasserführender Kamineinsatz Malaga I (Schwarz, 12 kW)", metaDescription: "Malaga I wasserführender Kamineinsatz aus schwarzem Stahl (12 kW). Unterstützt Ihr Heizsystem und wärmt bis zu 290 m³. Kompakte 93x49x45 cm." },
  { id: "ca39bb53-9f56-45b6-88a2-2a780094a69d", metaTitle: "Kaminbausatz Hark Avenso GT ECOplus (Keramik Schwarz, 8 kW)", metaDescription: "Hark Avenso GT ECOplus Kaminbausatz mit schwarzer Keramikverkleidung (8 kW). Umweltfreundlicher Dauerbrandofen, heizt bis zu 175 m³." }
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
