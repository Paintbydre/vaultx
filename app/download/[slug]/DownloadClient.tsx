'use client';

import { useState } from 'react';
import { Download, FileIcon, Calendar, HardDrive } from 'lucide-react';
import Image from 'next/image';

export default function DownloadClient({ shareLink, file }: any) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Get download URL
      const response = await fetch(`/api/files/${file.id}/download`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get download URL');
      }

      // Track download for share link
      await fetch(`/api/share/${shareLink.slug}/track`, {
        method: 'POST',
      });

      // Trigger download
      window.location.href = data.downloadUrl;
      setDownloaded(true);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const isImage = file.mimeType.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* VaultX Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🔐 VaultX
            </h1>
            <p className="text-gray-400">Secure File Delivery</p>
          </div>

          {/* Main Card */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            {/* File Preview */}
            {isImage && (
              <div className="relative h-96 bg-gray-900">
                <Image
                  src={`/api/files/${file.id}/preview`}
                  alt={file.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {isPDF && (
              <div className="h-96 bg-gray-900 flex items-center justify-center">
                <FileIcon className="w-24 h-24 text-gray-600" />
              </div>
            )}

            {!isImage && !isPDF && (
              <div className="h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <FileIcon className="w-24 h-24 text-gray-600" />
              </div>
            )}

            {/* File Info */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {file.name}
              </h2>

              {file.description && (
                <p className="text-gray-400 mb-6">{file.description}</p>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-400">
                  <HardDrive className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-gray-500">File Size</p>
                    <p className="text-white font-medium">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <FileIcon className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-white font-medium">
                      {file.fileExtension.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="text-white font-medium">
                      {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <Download className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-gray-500">Downloads</p>
                    <p className="text-white font-medium">
                      {file.downloadCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading || downloaded}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                  downloaded
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Preparing Download...
                  </>
                ) : downloaded ? (
                  <>
                    ✓ Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Download File
                  </>
                )}
              </button>

              {/* Share Link Info */}
              {(shareLink.expiresAt || shareLink.maxUses) && (
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400">
                    {shareLink.expiresAt && (
                      <span>
                        Expires: {formatDate(shareLink.expiresAt)}
                      </span>
                    )}
                    {shareLink.expiresAt && shareLink.maxUses && ' • '}
                    {shareLink.maxUses && (
                      <span>
                        Downloads: {shareLink.useCount}/
                        {shareLink.maxUses}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by VaultX • Secure File Delivery Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

