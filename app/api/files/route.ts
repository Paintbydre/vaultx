// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToR2 } from '@/lib/storage'
import { validateFile, getFileExtension } from '@/lib/file-validation'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large uploads

/**
 * POST /api/files - Upload a new file
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const isPublic = formData.get('isPublic') === 'true'
    const requiresPlan = formData.get('requiresPlan') as string | null
    const expiresAt = formData.get('expiresAt') as string | null
    const maxDownloads = formData.get('maxDownloads') as string | null

    // For now, we'll use hardcoded values for auth
    // TODO: Replace with actual Whop SDK authentication
    const whopCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!
    const createdBy = 'user_temp' // TODO: Get from Whop auth

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(
      file.name,
      file.size,
      file.type,
      {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['*'], // Allow all types for now
      }
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2
    console.log('Uploading to R2...')
    const uploadResult = await uploadToR2(
      buffer,
      file.name,
      file.type,
      {
        folder: whopCompanyId,
        makePublic: isPublic,
      }
    )

    // Save metadata to database
    console.log('Saving to database...')
    const fileRecord = await prisma.file.create({
      data: {
        whopCompanyId,
        createdBy,
        name: name || file.name,
        description: description || null,
        originalName: file.name,
        fileName: uploadResult.fileName,
        fileSize: file.size,
        mimeType: file.type,
        fileExtension: getFileExtension(file.name),
        storageProvider: 'cloudflare_r2',
        storageKey: uploadResult.key,
        storageUrl: uploadResult.url,
        isPublic,
        requiresPlan: requiresPlan || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      },
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.fileSize,
        type: fileRecord.mimeType,
        url: fileRecord.storageUrl,
        createdAt: fileRecord.createdAt,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/files - List all files
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // TODO: Filter by company ID from auth
    const whopCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!

    const files = await prisma.file.findMany({
      where: {
        whopCompanyId,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        fileSize: true,
        mimeType: true,
        fileExtension: true,
        isPublic: true,
        downloadCount: true,
        createdAt: true,
        lastDownloadAt: true,
      },
    })

    const total = await prisma.file.count({
      where: {
        whopCompanyId,
      },
    })

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 }
    )
  }
}

