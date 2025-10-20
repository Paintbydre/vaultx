// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics - Get analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // TODO: Filter by company ID from auth
    const whopCompanyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total stats
    const totalFiles = await prisma.file.count({
      where: { whopCompanyId },
    })

    const totalDownloads = await prisma.download.count({
      where: {
        file: { whopCompanyId },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalStorage = await prisma.file.aggregate({
      where: { whopCompanyId },
      _sum: {
        fileSize: true,
      },
    })

    // Get downloads by day
    const downloadsByDay = await prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT 
        DATE(d."createdAt") as date,
        COUNT(*)::bigint as count
      FROM "Download" d
      INNER JOIN "File" f ON d."fileId" = f.id
      WHERE f."whopCompanyId" = ${whopCompanyId}
        AND d."createdAt" >= ${startDate}
        AND d."createdAt" <= ${endDate}
      GROUP BY DATE(d."createdAt")
      ORDER BY date ASC
    `

    // Get top files
    const topFiles = await prisma.file.findMany({
      where: { whopCompanyId },
      orderBy: {
        downloadCount: 'desc',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        downloadCount: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
      },
    })

    // Get recent downloads
    const recentDownloads = await prisma.download.findMany({
      where: {
        file: { whopCompanyId },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        file: {
          select: {
            name: true,
            fileExtension: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalFiles,
          totalDownloads,
          totalStorage: totalStorage._sum.fileSize || 0,
          dateRange: {
            start: startDate,
            end: endDate,
            days,
          },
        },
        downloadsByDay: downloadsByDay.map(d => ({
          date: d.date,
          count: Number(d.count),
        })),
        topFiles,
        recentDownloads,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

