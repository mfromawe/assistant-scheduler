# Assistant Scheduler

Firmalar icin randevu, takvim ve musteri iletisim sistemi. Ilk surum WhatsApp, Instagram ve web uzerinden randevu talebi, iki adimli onay ve on odeme akisini destekleyecek sekilde kurgulanmistir.

## Kurulum

```bash
cp .env.example .env
npm install
npm run prisma:generate
docker compose up -d postgres
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Uygulama: `http://localhost:3000`

Demo randevu formu: `http://localhost:3000/book/demo-clinic`

Dashboard: `http://localhost:3000/dashboard`

Platform paneli: `http://localhost:3000/platform`

## Entegrasyon Noktalari

- `POST /api/appointments`: randevu talebi olusturur ve dogrulama kodu gonderir.
- `POST /api/appointments/confirm`: iki adimli dogrulama kodunu onaylar.
- `POST /api/payments/deposit`: on odeme checkout kaydi olusturur.
- `GET/POST /api/webhooks/whatsapp`: WhatsApp Cloud API webhook dogrulama ve mesaj alma.
- `POST /api/webhooks/instagram`: Instagram mesaj webhook girisi.
- `POST /api/integrations/n8n/outreach-leads`: n8n veya Google Places botundan gelen lead kaydini outreach havuzuna alir.

## Notlar

Gercek WhatsApp gonderimi icin `.env` icinde `WHATSAPP_PHONE_NUMBER_ID` ve `WHATSAPP_ACCESS_TOKEN` doldurulmalidir. Bu degerler yoksa mesaj gonderimi mock olarak basarili sayilir.

Stripe anahtari yoksa on odeme de mock checkout URL ile kaydedilir. Stripe aktiflestirildiginde `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ve `NEXT_PUBLIC_APP_URL` girilmelidir.

## Outreach ve n8n

Google Places, Google Sheets veya n8n uzerinden toplanan firma adaylari `OutreachLead` modelinde tutulur. Kampanyalar `OutreachCampaign`, planlanan/gonderilen mesajlar `OutreachActivity`, WhatsApp/Instagram/n8n baglantilari ise `ChannelIntegration` ile izlenir. Dashboard icinde `/dashboard/outreach` sayfasi cold/hot reach operasyon merkezidir.

n8n inbound endpoint'i icin production'da `N8N_WEBHOOK_SECRET` doldurulmalidir. n8n HTTP Request node'u `x-n8n-secret` header'i ile bu degeri gondermelidir.

## Veritabani

Prisma provider PostgreSQL olarak ayarlanmistir. Yerel gelistirme icin `.env.example` icindeki `DATABASE_URL` degeri `docker-compose.yml` ile gelen Postgres servisine baglanir.

Firma verileri multi-tenant modelde `tenantId` ile ayrilir. Firma dashboard sorgulari `DEFAULT_TENANT_SLUG` ile secilen tenant'a kilitlenir; platform paneli ise sistemi kuran ekibin tum firmalari ve temel metrikleri gormesi icindir. `Tenant.isolationMode` ileride firma basina ayri schema veya ayri database modeline gecis icin hazir tutulur.

## Dil ve Yerellestirme

Uygulama dili `Tenant.locale` ve platform varsayilani icin `DEFAULT_LOCALE` ile belirlenir. Ilk desteklenen diller `tr` ve `en`; yeni diller `src/lib/i18n.ts` icindeki `supportedLocales` ve dictionary kayitlarina eklenerek genisletilir. Tarih formatlari da ayni locale uzerinden `date-fns` locale'i ile calisir.

## Takvim Entegrasyonu

Google Calendar ve Microsoft Outlook icin ortak `CalendarConnection` modeli eklendi. Firma geneli veya personel bazli baglanti kurulabilir; randevu-event eslesmeleri `CalendarEventMapping` tablosunda tutulur. OAuth ve gercek provider API cagrilari eklenene kadar `src/lib/calendar-integrations.ts` mock adapter ile calisir.

## Mesaj Yapay Zeka Katmani

WhatsApp ve Instagram webhooklari gelen mesajlari kaydettikten sonra `src/lib/conversation-ai.ts` ile kanal bagimsiz niyet analizi yapar. Bu katman simdilik guvenli heuristic modundadir; OpenAI/LLM entegrasyonu eklendiginde randevu olusturma yine tarih dogrulama, musaitlik ve onay adimlarindan gecmelidir.

Coolify deployment icin:

- Coolify icinde PostgreSQL servisi olustur.
- Uygulama environment variables icine `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` ve `NEXT_PUBLIC_APP_URL` degerlerini gir.
- Build command: `npm run build`
- Start command: `npm run start`
- Ilk kurulum veya release asamasinda migration icin `npm run prisma:deploy` calistir.
