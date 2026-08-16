'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper pour géocoder (Ville, Pays) -> Lat, Lng via Nominatim
export async function geocodeCity(city: string, country: string): Promise<{ lat: number, lng: number } | null> {
  const query = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Shopelios-Tracking-System/1.0',
      },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur géocodage:", error);
    return null;
  }
}

// Mettre à jour les informations de base de livraison (Origine, Destination, Tracking)
export async function updateOrderTracking(
  orderId: string, 
  trackingNumber: string, 
  originCity: string, 
  originCountry: string, 
  destinationAddress: string, 
  destinationCountry: string
) {
  let originLat: number | null = null;
  let originLng: number | null = null;
  let destinationLat: number | null = null;
  let destinationLng: number | null = null;

  // Geocode Origin
  if (originCity && originCountry) {
    const originCoords = await geocodeCity(originCity, originCountry);
    if (originCoords) {
      originLat = originCoords.lat;
      originLng = originCoords.lng;
    }
  }

  // Geocode Destination
  if (destinationAddress && destinationCountry) {
    const destCoords = await geocodeCity(destinationAddress, destinationCountry);
    if (destCoords) {
      destinationLat = destCoords.lat;
      destinationLng = destCoords.lng;
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: trackingNumber || null,
      originCity,
      originCountry,
      originLat,
      originLng,
      destinationAddress,
      destinationCountry,
      destinationLat,
      destinationLng
    }
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/tracking');
}

// Ajouter une nouvelle position de livraison à l'historique
export async function addDeliveryPosition(orderId: string, city: string, country: string, note?: string) {
  const coords = await geocodeCity(city, country);
  
  if (!coords) {
    throw new Error(`Impossible de trouver les coordonnées pour ${city}, ${country}`);
  }

  await prisma.deliveryPosition.create({
    data: {
      orderId,
      city,
      country,
      latitude: coords.lat,
      longitude: coords.lng,
      note: note || null
    }
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/tracking');
}

// Supprimer une position
export async function deleteDeliveryPosition(positionId: string, orderId: string) {
  await prisma.deliveryPosition.delete({
    where: { id: positionId }
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/tracking');
}
