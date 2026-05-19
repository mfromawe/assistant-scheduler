import { addDays, setHours, setMinutes } from "date-fns";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.outreachActivity.deleteMany();
  await prisma.outreachCampaignLead.deleteMany();
  await prisma.outreachCampaign.deleteMany();
  await prisma.outreachLead.deleteMany();
  await prisma.channelIntegration.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformUser.deleteMany();
  await prisma.tenant.deleteMany();

  await prisma.platformUser.create({
    data: {
      name: "Platform Admin",
      email: "platform@assistant.local",
      password: await bcrypt.hash("platform12345", 10),
      role: "SUPER_ADMIN"
    }
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: "Demo Klinik",
      slug: "demo-clinic",
      sector: "Saglik",
      timezone: "Europe/Istanbul",
      locale: "tr",
      status: "ACTIVE",
      plan: "starter",
      isolationMode: "SHARED_DATABASE"
    }
  });

  await prisma.tenant.create({
    data: {
      name: "Demo Guzellik",
      slug: "demo-beauty",
      sector: "Guzellik",
      timezone: "Europe/Istanbul",
      locale: "tr",
      status: "TRIAL",
      plan: "starter",
      isolationMode: "SHARED_DATABASE"
    }
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Demo Admin",
      email: "admin@demo.local",
      password: await bcrypt.hash("demo12345", 10),
      role: "OWNER"
    }
  });

  const location = await prisma.location.create({
    data: {
      tenantId: tenant.id,
      name: "Merkez Sube",
      address: "Istanbul",
      phone: "+902120000000"
    }
  });

  const staff = await prisma.staffMember.create({
    data: {
      tenantId: tenant.id,
      name: "Dr. Ayse Demir",
      title: "Uzman"
    }
  });

  const consult = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: "On Gorusme",
      description: "Ilk degerlendirme ve planlama",
      durationMinutes: 30,
      depositAmount: 0,
      currency: "TRY"
    }
  });

  const paid = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: "Muayene",
      description: "On odemeli randevu",
      durationMinutes: 45,
      depositAmount: 75000,
      currency: "TRY"
    }
  });

  const customer = await prisma.customer.create({
    data: {
      id: `${tenant.id}:+905551112233`,
      tenantId: tenant.id,
      name: "Ece Yilmaz",
      phone: "+905551112233",
      whatsappId: "+905551112233"
    }
  });

  await prisma.appointment.createMany({
    data: [
      {
        tenantId: tenant.id,
        customerId: customer.id,
        serviceId: consult.id,
        staffMemberId: staff.id,
        locationId: location.id,
        channel: "WHATSAPP",
        status: "CONFIRMED",
        paymentStatus: "NOT_REQUIRED",
        startsAt: setMinutes(setHours(addDays(new Date(), 1), 10), 0),
        endsAt: setMinutes(setHours(addDays(new Date(), 1), 10), 30)
      },
      {
        tenantId: tenant.id,
        customerId: customer.id,
        serviceId: paid.id,
        staffMemberId: staff.id,
        locationId: location.id,
        channel: "INSTAGRAM",
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        startsAt: setMinutes(setHours(addDays(new Date(), 2), 14), 0),
        endsAt: setMinutes(setHours(addDays(new Date(), 2), 14), 45),
        depositAmount: 75000
      }
    ]
  });

  await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      channel: "WHATSAPP",
      externalId: "demo-message",
      messages: {
        create: {
          direction: "inbound",
          body: "Merhaba, yarin randevu almak istiyorum."
        }
      }
    }
  });

  await prisma.channelIntegration.createMany({
    data: [
      {
        tenantId: tenant.id,
        provider: "WHATSAPP_CLOUD",
        displayName: "WhatsApp Cloud API",
        status: "CONNECTED",
        externalAccountId: "demo-phone-number",
        accessTokenSecretName: "WHATSAPP_ACCESS_TOKEN"
      },
      {
        tenantId: tenant.id,
        provider: "INSTAGRAM_GRAPH",
        displayName: "Instagram Messaging",
        status: "DRAFT",
        accessTokenSecretName: "INSTAGRAM_ACCESS_TOKEN"
      },
      {
        tenantId: tenant.id,
        provider: "N8N",
        displayName: "n8n Outreach Workflow",
        status: "DRAFT",
        webhookUrl: "https://n8n.example.com/webhook/assistant-scheduler"
      }
    ]
  });

  const restaurantLead = await prisma.outreachLead.create({
    data: {
      tenantId: tenant.id,
      source: "google_places",
      externalRef: "demo-place-monika",
      name: "Monica Kitchen",
      phone: "+902160000001",
      website: "https://example.com/monica",
      googleMapsUrl: "https://maps.google.com/?q=Monica+Kitchen",
      address: "Pendik, Istanbul",
      city: "Pendik, Istanbul",
      category: "Restaurant",
      rating: 4.6,
      reviewCount: 820,
      status: "QUALIFIED",
      ownerNote: "Luks restoran segmenti, rezervasyon otomasyonu teklif edilebilir."
    }
  });

  const campaign = await prisma.outreachCampaign.create({
    data: {
      tenantId: tenant.id,
      name: "Pendik luks restoran cold reach",
      status: "DRAFT",
      objective: "WhatsApp uzerinden demo randevusu almak",
      defaultChannel: "WHATSAPP",
      leads: {
        create: {
          leadId: restaurantLead.id
        }
      },
      activities: {
        create: {
          tenantId: tenant.id,
          leadId: restaurantLead.id,
          channel: "WHATSAPP",
          status: "scheduled",
          body: "Merhaba, restoraniniz icin WhatsApp uzerinden otomatik rezervasyon ve takip sistemi kuruyoruz. Kisa bir demo planlayabilir miyiz?"
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
