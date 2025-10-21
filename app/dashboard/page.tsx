'use client';

import { useEffect, useState } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Share2,
  Check,
  File as FileIcon,
  HardDrive,
  TrendingUp,
  Calendar,
  X,
} from 'lucide-react';

interface FileData {
  id: string;
  name: string;
  description: string | null;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  downloadCount: number;
  createdAt: string;
  lastDownloadAt: string | null;
}

interface Analytics {
  overview: {
    totalFiles: number;
    totalDownloads: number;
    totalStorage: number;
  };
  topFiles: FileData[];
  recentDownloads: any[];
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading dashboard data...');
      const [filesRes, analyticsRes] = await Promise.all([
        fetch('/api/files'),
        fetch('/api/analytics'),
      ]);

      console.log('Files response:', filesRes.status);
      console.log('Analytics response:', analyticsRes.status);

      if (filesRes.status === 401 || analyticsRes.status === 401) {
        console.warn('Unauthorized access, redirecting to login');
        setIsAuthenticated(false);
        setFiles([]);
        setAnalytics({
          overview: { totalFiles: 0, totalDownloads: 0, totalStorage: 0 },
          topFiles: [],
          recentDownloads: []
        });
        return;
      }

      let filesData;
      let analyticsData;

      if (!filesRes.ok) {
        console.warn('Files API failed with status:', filesRes.status);
        filesData = { success: false };
      } else {
        filesData = await filesRes.json();
      }

      if (!analyticsRes.ok) {
        console.warn('Analytics API failed with status:', analyticsRes.status);
        analyticsData = { success: false };
      } else {
        analyticsData = await analyticsRes.json();
      }

      console.log('Files data:', filesData);
      console.log('Analytics data:', analyticsData);

      if (filesData.success) setFiles(filesData.files);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
      
      // If API calls fail (but not auth), show empty state
      if (!filesData.success || !analyticsData.success) {
        console.warn('API calls failed, showing empty state');
        setFiles([]);
        setAnalytics({
          overview: { totalFiles: 0, totalDownloads: 0, totalStorage: 0 },
          topFiles: [],
          recentDownloads: []
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty data to show the interface even if API fails
      setFiles([]);
      setAnalytics({
        overview: { totalFiles: 0, totalDownloads: 0, totalStorage: 0 },
        topFiles: [],
        recentDownloads: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName);
      formData.append('description', uploadDescription);
      formData.append('isPublic', 'true');

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadName('');
        setUploadDescription('');
        loadData();
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGetShareLink = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Share link failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await navigator.clipboard.writeText(data.shareLink.url);
        setCopiedId(fileId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create share link');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-white text-base sm:text-lg font-medium">Loading VaultX Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center p-6 sm:p-8 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">🔐 VaultX</h1>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">Please log in with your Whop account to access the dashboard.</p>
          <button
            onClick={() => window.location.href = '/api/oauth/init?next=/'}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
          >
            Login with Whop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/70 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                🔐 VaultX Dashboard
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm">
                Secure file hosting & download analytics
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 w-full sm:w-auto justify-center sm:justify-start"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload New File
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Files */}
            <div className="bg-gradient-to-br from-blue-900/70 to-blue-800/50 border border-blue-700/30 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300" />
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {analytics.overview.totalFiles}
                </span>
              </div>
              <p className="text-blue-100 font-medium text-sm sm:text-base">Total Files</p>
            </div>

            {/* Total Downloads */}
            <div className="bg-gradient-to-br from-green-900/70 to-green-800/50 border border-green-700/30 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-green-300" />
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {analytics.overview.totalDownloads}
                </span>
              </div>
              <p className="text-green-100 font-medium text-sm sm:text-base">Total Downloads</p>
            </div>

            {/* Storage Used */}
            <div className="bg-gradient-to-br from-purple-900/70 to-purple-800/50 border border-purple-700/30 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {formatFileSize(analytics.overview.totalStorage)}
                </span>
              </div>
              <p className="text-purple-100 font-medium text-sm sm:text-base">Storage Used</p>
            </div>
          </div>
        )}

        {/* Files List */}
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              All Files
            </h2>
          </div>

          {files.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FileIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-200 text-base sm:text-lg font-medium mb-2">No files yet</p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 sm:p-6 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 truncate">
                        {file.name}
                      </h3>
                      {file.description && (
                        <p className="text-gray-300 text-xs sm:text-sm mb-3">
                          {file.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          {file.fileExtension?.toUpperCase() || 'FILE'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          {file.downloadCount} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleGetShareLink(file.id)}
                        className="p-1 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Get Share Link"
                        aria-label="Get Share Link"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        ) : (
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1 sm:p-2 text-red-400 hover:text-red-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Delete File"
                        aria-label="Delete File"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Downloaded Files */}
        {analytics && analytics.topFiles.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                Top Downloaded Files
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {analytics.topFiles.map((file, index) => (
                <div key={file.id} className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-base">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm sm:text-base">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {formatFileSize(file.fileSize)} •{' '}
                      {file.fileExtension?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm sm:text-base">
                      {file.downloadCount}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">downloads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-xl max-w-md w-full shadow-2xl mx-2 sm:mx-0">
            <div className="p-4 sm:p-6 border-b border-gray-600 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white">Upload File</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close Upload Modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Select File to Upload
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    required
                    className="w-full text-gray-100 bg-gray-900/70 border border-gray-500 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs sm:text-sm cursor-pointer"
                  />
                  <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {uploadFile && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-300">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)}) •{' '}
                    {uploadFile.type || 'Unknown type'}
                  </p>
                )}
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  required
                  placeholder="Enter a name for your file"
                  className="w-full text-white bg-gray-900/70 border border-gray-500 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Add a description for your file"
                  rows={3}
                  className="w-full text-white bg-gray-900/70 border border-gray-500 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Upload File
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
