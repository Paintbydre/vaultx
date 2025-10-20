// app/api/files/[id]/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateDownloadUrl } from '@/lib/storage'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Generate signed URL for preview (shorter expiration)
    const url = await generateDownloadUrl(file.storageKey, 3600) // 1 hour

    // Redirect to the signed URL
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Preview error:', error)
    return new NextResponse('Failed to load preview', { status: 500 })
  }
}

