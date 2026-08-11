import type { Metadata } from "next";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { HeroSection }     from "@/components/home/HeroSection";
import { TickerStrip }     from "@/components/home/TickerStrip";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CoursesSection }  from "@/components/home/CoursesSection";
import { GallerySection }  from "@/components/home/GallerySection";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TickerStrip />
      <ServicesSection />
      <CoursesSection />
      <GallerySection />
      <Footer />
    </>
  );
}
