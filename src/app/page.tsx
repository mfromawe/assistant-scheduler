import Link from "next/link";
import { CalendarCheck, MessageCircle, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Merkezi randevu ve iletisim sistemi</p>
          <h1>Firmalar icin randevu, takvim ve musteri talep yonetimi</h1>
          <p>
            WhatsApp, Instagram ve web uzerinden gelen talepleri tek akis icinde toplayin; iki adimli onay ve on odeme ile takvimi guncel tutun.
          </p>
          <Link className="button" href="/dashboard">
            <CalendarCheck size={18} />
            Dashboard
          </Link>
        </div>
      </section>
      <main className="main">
        <div className="grid cols-3">
          <div className="card">
            <MessageCircle size={24} />
            <h3>WhatsApp ve Instagram</h3>
            <p>Musteri mesajlari randevu talebine donusur, personel ve hizmet secimiyle takvime baglanir.</p>
          </div>
          <div className="card">
            <ShieldCheck size={24} />
            <h3>Iki adimli onay</h3>
            <p>Randevu olustuktan sonra kodla onay alinir, gerekli hizmetlerde on odeme baslatilir.</p>
          </div>
          <div className="card">
            <CalendarCheck size={24} />
            <h3>Operasyon paneli</h3>
            <p>Yoneticiler, subeler, personel, hizmetler, randevular ve odeme durumlari tek panelden izlenir.</p>
          </div>
        </div>
      </main>
    </>
  );
}
