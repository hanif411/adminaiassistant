import FeaturesSection from "@/components/landingpage/FeaturesSection";
import FinalCTA from "@/components/landingpage/FinalCTA";
import Footer from "@/components/landingpage/Footer";
import HeroSection from "@/components/landingpage/HeroSection";
import InsightsSection from "@/components/landingpage/InsightsSection";
import Navigation from "@/components/landingpage/Navigation";
import StatsSection from "@/components/landingpage/StatsSection";
import TestimonialSection from "@/components/landingpage/TestimonialSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <InsightsSection />
      <TestimonialSection />
      <StatsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
