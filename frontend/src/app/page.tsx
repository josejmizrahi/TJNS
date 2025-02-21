import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TrustLevelsSection } from '../components/landing/TrustLevelsSection';
import { RoadmapSection } from '../components/landing/RoadmapSection';
import { ContactSection } from '../components/landing/ContactSection';

export default function Home() {
  return (
    <main className="bg-background">
      <HeroSection />
      <FeaturesSection />
      <TrustLevelsSection />
      <RoadmapSection />
      <ContactSection />
    </main>
  );
}
