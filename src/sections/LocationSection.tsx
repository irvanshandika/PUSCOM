const LocationMap = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.6s ease-out forwards" }}>
            Lokasi <span className="text-[hsl(var(--puscom))]">Kami</span>
          </h2>
          <p className="text-lg text-foreground/70 opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.6s ease-out forwards", animationDelay: "0.1s" }}>
            Kunjungi toko kami untuk melihat langsung produk dan layanan kami.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.6s ease-out forwards", animationDelay: "0.2s" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.3055458641834!2d110.39162547457234!3d-7.787912292231933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59dbbbc458a5%3A0x6307949df8d9f156!2sPusComp!5e1!3m2!1sid!2sid!4v1745551333118!5m2!1sid!2sid"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pusat Komputer Location"
            className="w-full"></iframe>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.6s ease-out forwards", animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--puscom))]/10 flex items-center justify-center text-[hsl(var(--puscom))]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Hubungi Kami</h3>
              <p className="text-foreground/70">+62 123 456 7890</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--puscom))]/10 flex items-center justify-center text-[hsl(var(--puscom))]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Alamat Kami</h3>
              <p className="text-foreground/70">Pusat Komputer, Bogor, Indonesia</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--puscom))]/10 flex items-center justify-center text-[hsl(var(--puscom))]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Jam Buka</h3>
              <p className="text-foreground/70">Senin - Sabtu: 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;