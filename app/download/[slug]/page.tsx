import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DownloadClient from './DownloadClient';

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find share link
  const shareLink = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      file: true,
    },
  });

  if (!shareLink) {
    notFound();
  }

  // Check if expired
  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Link Expired</h1>
          <p className="text-gray-400">This download link has expired.</p>
        </div>
      </div>
    );
  }

  // Check if max downloads reached
  if (
    shareLink.maxUses &&
    shareLink.useCount >= shareLink.maxUses
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Download Limit Reached
          </h1>
          <p className="text-gray-400">
            This file has reached its maximum number of downloads.
          </p>
        </div>
      </div>
    );
  }

  return <DownloadClient shareLink={shareLink} file={shareLink.file} />;
}

