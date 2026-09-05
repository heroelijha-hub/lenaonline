import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { layout, font } = await req.json();
    
    // Save draft layout
    if (layout) {
      await prisma.setting.upsert({
        where: { key: 'PREVIEW_LAYOUT_DRAFT' },
        update: { value: JSON.stringify(layout) },
        create: { key: 'PREVIEW_LAYOUT_DRAFT', value: JSON.stringify(layout) }
      });
    }

    // Save draft font
    if (font) {
      await prisma.setting.upsert({
        where: { key: 'PREVIEW_FONT_DRAFT' },
        update: { value: font },
        create: { key: 'PREVIEW_FONT_DRAFT', value: font }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preview draft:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
