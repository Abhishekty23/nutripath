import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import HowItWorks from "@/components/home/HowItWorks";
import Plans from "@/components/home/Plans";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import { getPlans } from "@/lib/plans";

export default async function Home() {
  const plans = await getPlans();

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Marquee />
        <HowItWorks />
        <Plans plans={plans} />
        <About />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
