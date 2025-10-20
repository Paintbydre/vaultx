// app/api/share/[slug]/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/share/[slug]/track - Track share link usage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find and update share link
    const shareLink = await prisma.shareLink.update({
      where: { slug },
      data: {
        useCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      useCount: shareLink.useCount,
    })
  } catch (error) {
    console.error('Track share link error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track usage' },
      { status: 500 }
    )
  }
}

