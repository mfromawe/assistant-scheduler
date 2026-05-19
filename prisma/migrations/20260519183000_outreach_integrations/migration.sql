-- CreateEnum
CREATE TYPE "ChannelProvider" AS ENUM ('WHATSAPP_CLOUD', 'INSTAGRAM_GRAPH', 'N8N', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DRAFT', 'CONNECTED', 'NEEDS_ATTENTION', 'DISABLED');

-- CreateEnum
CREATE TYPE "OutreachLeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'REPLIED', 'BOOKED', 'NOT_INTERESTED', 'INVALID');

-- CreateEnum
CREATE TYPE "OutreachCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateTable
CREATE TABLE "ChannelIntegration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" "ChannelProvider" NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DRAFT',
    "externalAccountId" TEXT,
    "webhookUrl" TEXT,
    "accessTokenSecretName" TEXT,
    "settings" JSONB,
    "lastHealthCheckAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachLead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google_places',
    "externalRef" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "category" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "status" "OutreachLeadStatus" NOT NULL DEFAULT 'NEW',
    "ownerNote" TEXT,
    "consentStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachCampaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OutreachCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "objective" TEXT,
    "defaultChannel" "Channel" NOT NULL DEFAULT 'WHATSAPP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachCampaignLead" (
    "campaignId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachCampaignLead_pkey" PRIMARY KEY ("campaignId","leadId")
);

-- CreateTable
CREATE TABLE "OutreachActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT,
    "leadId" TEXT,
    "channel" "Channel" NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'outbound',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "body" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelIntegration_tenantId_provider_idx" ON "ChannelIntegration"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "ChannelIntegration_tenantId_status_idx" ON "ChannelIntegration"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachLead_tenantId_source_externalRef_key" ON "OutreachLead"("tenantId", "source", "externalRef");

-- CreateIndex
CREATE INDEX "OutreachLead_tenantId_status_idx" ON "OutreachLead"("tenantId", "status");

-- CreateIndex
CREATE INDEX "OutreachLead_tenantId_city_idx" ON "OutreachLead"("tenantId", "city");

-- CreateIndex
CREATE INDEX "OutreachCampaign_tenantId_status_idx" ON "OutreachCampaign"("tenantId", "status");

-- CreateIndex
CREATE INDEX "OutreachCampaignLead_leadId_idx" ON "OutreachCampaignLead"("leadId");

-- CreateIndex
CREATE INDEX "OutreachActivity_tenantId_status_idx" ON "OutreachActivity"("tenantId", "status");

-- CreateIndex
CREATE INDEX "OutreachActivity_tenantId_scheduledAt_idx" ON "OutreachActivity"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "OutreachActivity_leadId_idx" ON "OutreachActivity"("leadId");

-- AddForeignKey
ALTER TABLE "ChannelIntegration" ADD CONSTRAINT "ChannelIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachLead" ADD CONSTRAINT "OutreachLead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachCampaignLead" ADD CONSTRAINT "OutreachCampaignLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachCampaignLead" ADD CONSTRAINT "OutreachCampaignLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OutreachLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachActivity" ADD CONSTRAINT "OutreachActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachActivity" ADD CONSTRAINT "OutreachActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachActivity" ADD CONSTRAINT "OutreachActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OutreachLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
