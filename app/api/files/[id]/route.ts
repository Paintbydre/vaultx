// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/files/[id] - Get file details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const file = await prisma.file.findUnique({
      where: {
        id,
      },
      include: {
        downloads: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            whopUserId: true,
            userEmail: true,
            ipAddress: true,
            country: true,
            city: true,
            method: true,
            completed: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            downloads: true,
            shares: true,
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      file,
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get file' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/files/[id] - Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // TODO: Add auth check - only creator or admin can delete

    const file = await prisma.file.findUnique({
      where: {
        id,
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete from R2
    const { deleteFromR2 } = await import('@/lib/storage')
    await deleteFromR2(file.storageKey)

    // Delete from database
    await prisma.file.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    )
  }
}

