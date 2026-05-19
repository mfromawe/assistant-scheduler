import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

const leadSchema = z.object({
  tenantSlug: z.string().optional(),
  source: z.string().default("google_places"),
  externalRef: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  rating: z.coerce.number().optional(),
  reviewCount: z.coerce.number().int().optional(),
  ownerNote: z.string().optional(),
  campaignName: z.string().optional()
});

function isAuthorized(request: Request) {
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return true;
  }

  return request.headers.get("x-n8n-secret") === expectedSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = leadSchema.parse(await request.json());
  const tenant = await getTenantContext(payload.tenantSlug);

  const lead = payload.externalRef
    ? await prisma.outreachLead.upsert({
        where: {
          tenantId_source_externalRef: {
            tenantId: tenant.id,
            source: payload.source,
            externalRef: payload.externalRef
          }
        },
        update: {
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          website: payload.website,
          googleMapsUrl: payload.googleMapsUrl,
          address: payload.address,
          city: payload.city,
          category: payload.category,
          rating: payload.rating,
          reviewCount: payload.reviewCount,
          ownerNote: payload.ownerNote
        },
        create: {
          tenantId: tenant.id,
          source: payload.source,
          externalRef: payload.externalRef,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          website: payload.website,
          googleMapsUrl: payload.googleMapsUrl,
          address: payload.address,
          city: payload.city,
          category: payload.category,
          rating: payload.rating,
          reviewCount: payload.reviewCount,
          ownerNote: payload.ownerNote
        }
      })
    : await prisma.outreachLead.create({
        data: {
          tenantId: tenant.id,
          source: payload.source,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          website: payload.website,
          googleMapsUrl: payload.googleMapsUrl,
          address: payload.address,
          city: payload.city,
          category: payload.category,
          rating: payload.rating,
          reviewCount: payload.reviewCount,
          ownerNote: payload.ownerNote
        }
      });

  if (payload.campaignName) {
    const campaign = await prisma.outreachCampaign.upsert({
      where: {
        id: `${tenant.id}:${payload.campaignName}`
      },
      update: {},
      create: {
        id: `${tenant.id}:${payload.campaignName}`,
        tenantId: tenant.id,
        name: payload.campaignName,
        objective: "n8n ile ice aktarilan lead havuzundan demo randevusu almak",
        defaultChannel: "WHATSAPP"
      }
    });

    await prisma.outreachCampaignLead.upsert({
      where: {
        campaignId_leadId: {
          campaignId: campaign.id,
          leadId: lead.id
        }
      },
      update: {},
      create: {
        campaignId: campaign.id,
        leadId: lead.id
      }
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
