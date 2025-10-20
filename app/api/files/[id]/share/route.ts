import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { expiresAt, maxUses, slug } = body;

    // Check if file exists
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Generate slug if not provided
    const shareSlug = slug || nanoid(10);

    // Check if slug already exists
    const existingLink = await prisma.shareLink.findUnique({
      where: { slug: shareSlug },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // TODO: Get createdBy from auth
    const createdBy = 'user_temp';

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        fileId: id,
        slug: shareSlug,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || null,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/download/${shareSlug}`;

    return NextResponse.json({
      success: true,
      shareLink: {
        ...shareLink,
        url: shareUrl,
      },
    });
  } catch (error) {
    console.error('Share link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

