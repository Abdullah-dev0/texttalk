import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { FAQ } from '@/components/FAQ';
import CTASection from '@/components/landing/CTASection';
import FeatureSteps from '@/components/landing/FeatureSteps';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import ProductShowcase from '@/components/landing/ProductShowcase';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

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
