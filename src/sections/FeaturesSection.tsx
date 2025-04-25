'use client'
import { Button } from "@/src/components/ui/button";
import { ArrowRight, Laptop, Settings, Cpu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import Image from "next/image";

const FeaturesSection = () => {
  const categories = [
    {
      title: "Komputer & Laptop",
      description: "Komputer dan laptop premium dari merek ternama dengan garansi dan dukungan eksklusif.",
      detailedDescription: "Kami menyediakan berbagai pilihan komputer dan laptop premium dari merek-merek terpercaya seperti Lenovo, HP, Dell, dan ASUS. Semua produk kami dilengkapi dengan garansi resmi dan dukungan teknis yang siap membantu Anda. Dapatkan performa maksimal untuk kebutuhan kerja, gaming, atau multimedia dengan perangkat yang sesuai dengan kebutuhan Anda.",
      icon: <Laptop className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
      link: "/computers",
      features: [
        "Garansi Resmi Hingga 3 Tahun",
        "Dukungan Teknis 24/7",
        "Pilihan Produk Premium",
        "Pengiriman Gratis"
      ]
    },
    {
      title: "Layanan & Perbaikan",
      description: "Layanan perbaikan komputer dan laptop profesional dengan waktu pengerjaan cepat.",
      detailedDescription: "Tim teknisi berpengalaman kami siap membantu mengatasi berbagai masalah pada perangkat Anda. Kami menawarkan layanan diagnostik gratis, estimasi biaya transparan, dan garansi perbaikan. Dengan waktu pengerjaan yang cepat, perangkat Anda akan kembali optimal dalam waktu singkat.",
      icon: <Settings className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
      link: "/services",
      features: [
        "Diagnostik Gratis",
        "Teknisi Berpengalaman",
        "Waktu Pengerjaan Cepat",
        "Garansi Perbaikan"
      ]
    },
    {
      title: "Suku Cadang",
      description: "Suku cadang asli dan kompatibel untuk semua merek komputer dan laptop terkemuka.",
      detailedDescription: "Temukan berbagai suku cadang berkualitas untuk perangkat Anda. Kami hanya menyediakan komponen asli dan kompatibel yang terjamin kualitasnya. Dengan harga kompetitif dan ketersediaan stok yang lengkap, Anda dapat dengan mudah menemukan suku cadang yang Anda butuhkan.",
      icon: <Cpu className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      link: "/parts",
      features: [
        "Komponen Asli",
        "Garansi Keaslian",
        "Stok Lengkap",
        "Harga Kompetitif"
      ]
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Layanan <span className="text-blue-600">Kami</span>
          </h2>
          <p className="text-lg text-gray-600">
            Jelajahi rangkaian produk dan layanan lengkap kami yang dirancang untuk memenuhi semua kebutuhan teknologi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div 
              key={category.title}
              className="group relative rounded-2xl overflow-hidden bg-white/70 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 opacity-90 group-hover:opacity-80 transition-opacity duration-300">
                <Image 
                  src={category.image} 
                  alt={category.title}
                  width={0}
                  height={0}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              
              <div className="relative p-8 h-full flex flex-col justify-end aspect-[4/5]">
                <div className="mb-4 p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center text-blue-600">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                <p className="text-white/80 mb-6">{category.description}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-fit text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    >
                      Jelajahi
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-2xl">
                        <span className="text-blue-600">{category.icon}</span>
                        {category.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-6">
                      <p className="text-lg text-gray-700 dark:text-white mb-6">
                        {category.detailedDescription}
                      </p>
                      <div className="grid gap-4">
                        <h4 className="font-semibold text-lg">Keunggulan:</h4>
                        <ul className="grid gap-2">
                          {category.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <Button 
                          className="flex items-center gap-2"
                          onClick={() => window.location.href = category.link}
                        >
                          Lihat Selengkapnya
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection