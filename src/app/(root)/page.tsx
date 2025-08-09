import { FAQ } from '@/components/FAQ';
import CTASection from '@/components/landing/CTASection';
import FeatureSteps from '@/components/landing/FeatureSteps';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import ProductShowcase from '@/components/landing/ProductShowcase';

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureSteps />
      <ProductShowcase />
      <FAQ />
      <CTASection />
      <Footer />
    </>
  );
}
