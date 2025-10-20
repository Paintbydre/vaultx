// app/api/files/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDownloadUrl } from '@/lib/storage'

export const runtime = 'nodejs'

/**
 * GET /api/files/[id]/download - Generate download URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get file from database
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if file is expired
    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    // Check if download limit reached
    if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 403 }
      )
    }

    // TODO: Add authorization checks
    // - Check if file is public or user has access
    // - Check if user has required plan (if requiresPlan is set)
    // - Verify password if protected

    // Generate pre-signed download URL (valid for 1 hour)
    const downloadUrl = await generateDownloadUrl(file.storageKey, 3600)

    // Update download count and last download time
    await prisma.file.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    })

    // TODO: Track download in Download table for analytics
    // await prisma.download.create({
    //   data: {
    //     fileId: file.id,
    //     whopUserId: userId, // from auth
    //     method: 'direct',
    //     ipAddress: request.headers.get('x-forwarded-for'),
    //     userAgent: request.headers.get('user-agent'),
    //     completed: true,
    //   },
    // })

    return NextResponse.json({
      success: true,
      downloadUrl,
      file: {
        id: file.id,
        name: file.name,
        size: file.fileSize,
        type: file.mimeType,
      },
      expiresIn: 3600, // seconds
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/files/[id]/download - Direct download with tracking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password } = body

    // Get file from database
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if file is expired
    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    // Check if download limit reached
    if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 403 }
      )
    }

    // Check password if file is password-protected
    if (file.password && file.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate download URL
    const downloadUrl = await generateDownloadUrl(file.storageKey, 3600)

    // Update download stats
    await prisma.file.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      file: {
        id: file.id,
        name: file.name,
        originalName: file.originalName,
        size: file.fileSize,
        type: file.mimeType,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download file' },
      { status: 500 }
    )
  }
}

