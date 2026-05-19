"use client";

import { useState } from "react";
import type { Service } from "@prisma/client";

export function BookingForm({
  tenantSlug,
  services
}: {
  tenantSlug: string;
  services: Service[];
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug,
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        serviceId: formData.get("serviceId"),
        startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
        channel: formData.get("channel"),
        notes: formData.get("notes")
      })
    });

    if (!response.ok) {
      setMessage("Randevu talebi olusturulamadi.");
      setPending(false);
      return;
    }

    const data = await response.json();
    setMessage(`Talep olustu. Onay kodu gonderildi. Randevu ID: ${data.appointment.id}`);
    setPending(false);
  }

  return (
    <form action={submit} className="grid">
      <div className="field">
        <label>Ad Soyad</label>
        <input name="customerName" required placeholder="Musteri adi" />
      </div>
      <div className="field">
        <label>Telefon</label>
        <input name="customerPhone" required placeholder="+905..." />
      </div>
      <div className="field">
        <label>Hizmet</label>
        <select name="serviceId" required>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.durationMinutes} dk
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Kanal</label>
        <select name="channel" defaultValue="WHATSAPP">
          <option value="WHATSAPP">WhatsApp</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="WEB">Web</option>
          <option value="PHONE">Telefon</option>
        </select>
      </div>
      <div className="field">
        <label>Tarih ve saat</label>
        <input name="startsAt" type="datetime-local" required />
      </div>
      <div className="field">
        <label>Not</label>
        <textarea name="notes" rows={3} placeholder="Talep detayi" />
      </div>
      <button className="button" disabled={pending} type="submit">
        {pending ? "Olusturuluyor" : "Randevu Talebi Olustur"}
      </button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
