import Navbar from "@/src/components/Navbar";
import HeroSection from "@/src/sections/HeroSection";
import FeaturesSection from "@/src/sections/FeaturesSection";
import LocationMap from "@/src/sections/LocationSection";
import CTASection from "@/src/sections/CTASection";
import AIChat from "@/src/components/AIChat";
import Footer from "@/src/components/Footer";
import Testimonials from "@/src/sections/Testimonials";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <LocationMap />
      <CTASection />
      <AIChat />
      <Footer />
    </main>
  );
}
