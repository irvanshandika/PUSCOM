import Navbar from "@/src/components/Navbar";
import HeroSection from "@/src/sections/HeroSection";
import FeaturesSection from "@/src/sections/FeaturesSection";
import CTASection from "@/src/sections/CTASection";
import Footer from "@/src/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
