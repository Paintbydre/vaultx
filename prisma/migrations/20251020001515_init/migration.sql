-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "whopCompanyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "requiresPlan" TEXT,
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastDownloadAt" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "whopUserId" TEXT,
    "whopMembershipId" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "method" TEXT NOT NULL,
    "shareLinkId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "bytesTransferred" INTEGER,
    "downloadDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "requiresEmail" BOOLEAN NOT NULL DEFAULT false,
    "notifyCreator" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileVersion" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "changeNote" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "notifiedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "FileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "whopCompanyId" TEXT NOT NULL,
    "maxFileSize" INTEGER NOT NULL DEFAULT 104857600,
    "allowedFileTypes" TEXT[] DEFAULT ARRAY['*']::TEXT[],
    "brandColor" TEXT,
    "logoUrl" TEXT,
    "customDomain" TEXT,
    "emailOnUpload" BOOLEAN NOT NULL DEFAULT false,
    "emailOnDownload" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" TEXT,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "whopCompanyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "uploads" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "totalBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_fileName_key" ON "File"("fileName");

-- CreateIndex
CREATE INDEX "File_whopCompanyId_idx" ON "File"("whopCompanyId");

-- CreateIndex
CREATE INDEX "File_createdBy_idx" ON "File"("createdBy");

-- CreateIndex
CREATE INDEX "File_fileName_idx" ON "File"("fileName");

-- CreateIndex
CREATE INDEX "File_createdAt_idx" ON "File"("createdAt");

-- CreateIndex
CREATE INDEX "Download_fileId_idx" ON "Download"("fileId");

-- CreateIndex
CREATE INDEX "Download_whopUserId_idx" ON "Download"("whopUserId");

-- CreateIndex
CREATE INDEX "Download_createdAt_idx" ON "Download"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_slug_key" ON "ShareLink"("slug");

-- CreateIndex
CREATE INDEX "ShareLink_slug_idx" ON "ShareLink"("slug");

-- CreateIndex
CREATE INDEX "ShareLink_fileId_idx" ON "ShareLink"("fileId");

-- CreateIndex
CREATE INDEX "FileVersion_fileId_idx" ON "FileVersion"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileVersion_fileId_version_key" ON "FileVersion"("fileId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_whopCompanyId_key" ON "Settings"("whopCompanyId");

-- CreateIndex
CREATE INDEX "Settings_whopCompanyId_idx" ON "Settings"("whopCompanyId");

-- CreateIndex
CREATE INDEX "DailyStats_whopCompanyId_idx" ON "DailyStats"("whopCompanyId");

-- CreateIndex
CREATE INDEX "DailyStats_date_idx" ON "DailyStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_whopCompanyId_date_key" ON "DailyStats"("whopCompanyId", "date");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileVersion" ADD CONSTRAINT "FileVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
