// app/api/test/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Count files (should be 0)
    const fileCount = await prisma.file.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      fileCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

