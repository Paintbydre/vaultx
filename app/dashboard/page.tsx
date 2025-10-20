'use client'

import { useEffect, useState } from 'react'
import { formatFileSize } from '@/lib/file-validation'

interface Analytics {
  overview: {
    totalFiles: number
    totalDownloads: number
    totalStorage: number
    dateRange: {
      start: string
      end: string
      days: number
    }
  }
  downloadsByDay: Array<{
    date: string
    count: number
  }>
  topFiles: Array<{
    id: string
    name: string
    downloadCount: number
    fileSize: number
    mimeType: string
  }>
  recentDownloads: Array<{
    id: string
    ipAddress: string | null
    country: string | null
    city: string | null
    createdAt: string
    file: {
      name: string
      fileExtension: string
    }
  }>
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?days=${days}`)
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load analytics</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">VaultX Dashboard</h1>
          <p className="text-gray-600 mt-2">File hosting & download analytics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Files"
            value={analytics.overview.totalFiles}
            icon="📁"
          />
          <StatCard
            title="Total Downloads"
            value={analytics.overview.totalDownloads}
            icon="⬇️"
          />
          <StatCard
            title="Storage Used"
            value={formatFileSize(analytics.overview.totalStorage)}
            icon="💾"
          />
        </div>

        {/* Top Files */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Downloaded Files</h2>
          <div className="space-y-4">
            {analytics.topFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(file.fileSize)} • {file.mimeType}
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {file.downloadCount} downloads
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Downloads</h2>
          <div className="space-y-2">
            {analytics.recentDownloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium">{download.file.name}</div>
                  <div className="text-sm text-gray-600">
                    {download.ipAddress} 
                    {download.city && ` • ${download.city}`}
                    {download.country && `, ${download.country}`}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(download.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { 
  title: string
  value: string | number
  icon: string 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

