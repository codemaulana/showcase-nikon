"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MonochromeSection from "./components/MonochromeSection";
import CraftsmanshipSection from "./components/CraftsmanshipSection";
import FeaturesSection from "./components/FeaturesSection";
import SpecsSection from "./components/SpecsSection";
import ConfiguratorModal from "./components/ConfiguratorModal";
import IntroLoadingScreen from "./components/IntroLoadingScreen";
import CameraCursor from "./components/CameraCursor";
import Footer from "./components/Footer";
import { ColorEdition } from "./components/HalcyonColorCard";

export default function Home() {
  const [activeEdition, setActiveEdition] = useState<ColorEdition>("onyx");
  const [configuratorOpen, setConfiguratorOpen] = useState(false);

  return (
    <>
      {/* Cinematic Viewfinder Focus Cursor */}
      <CameraCursor activeEdition={activeEdition} />

      {/* Cinematic Aperture Shutter Loading Screen */}
      <IntroLoadingScreen />

      <Navbar onOpenConfigurator={() => setConfiguratorOpen(true)} />
      <main>
        <HeroSection
          activeEdition={activeEdition}
          onSelectEdition={setActiveEdition}
          onOpenConfigurator={() => setConfiguratorOpen(true)}
          isConfiguratorOpen={configuratorOpen}
        />
        <MonochromeSection />
        <CraftsmanshipSection />
        <FeaturesSection />
        <SpecsSection />
      </main>
      <Footer />

      {/* Interactive Bespoke Build Configurator */}
      <ConfiguratorModal
        isOpen={configuratorOpen}
        onClose={() => setConfiguratorOpen(false)}
        activeEdition={activeEdition}
        onSelectEdition={setActiveEdition}
      />
    </>
  );
}
