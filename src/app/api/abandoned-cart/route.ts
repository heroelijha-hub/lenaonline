import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, cartData, totalAmount } = body;

    const rawEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!rawEmail || rawEmail.length > 254) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate cartData structure
    if (cartData && (!Array.isArray(cartData) || cartData.length > 50)) {
      return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 });
    }

    // Validate totalAmount
    const numericTotal = typeof totalAmount === 'number' && totalAmount >= 0 && totalAmount <= 1000000 
      ? Math.round(totalAmount * 100) / 100 
      : 0;

    const safeFirstName = typeof firstName === 'string' ? firstName.slice(0, 100) : null;
    const safeLastName = typeof lastName === 'string' ? lastName.slice(0, 100) : null;
    const safePhone = typeof phone === 'string' ? phone.slice(0, 50) : null;

    // Upsert the abandoned cart record
    await prisma.abandonedCart.upsert({
      where: { email: rawEmail },
      update: {
        firstName: safeFirstName || undefined,
        lastName: safeLastName || undefined,
        phone: safePhone || undefined,
        cartData: cartData || [],
        totalAmount: numericTotal,
        status: 'ABANDONED', // Always set to ABANDONED when they are on checkout page
        lastActive: new Date(),
      },
      create: {
        email: rawEmail,
        firstName: safeFirstName,
        lastName: safeLastName,
        phone: safePhone,
        cartData: cartData || [],
        totalAmount: numericTotal,
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
