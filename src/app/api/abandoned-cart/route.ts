import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, cartData, totalAmount } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Upsert the abandoned cart record
    const abandonedCart = await prisma.abandonedCart.upsert({
      where: { email },
      update: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        cartData: cartData || [],
        totalAmount: totalAmount || 0,
        status: 'ABANDONED', // Always set to ABANDONED when they are on checkout page
        lastActive: new Date(),
      },
      create: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        cartData: cartData || [],
        totalAmount: totalAmount || 0,
        status: 'ABANDONED',
        lastActive: new Date(),
      },
    });

    // SECURITY: never echo the stored record back to avoid leaking PII
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in abandoned-cart route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
