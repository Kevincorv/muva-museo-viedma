import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutMuseum from "./components/AboutMuseum";
import History from "./components/History";
import CollectionPreview from "./components/CollectionPreview";
import GuaraniExperience from "./components/GuaraniExperience";
import Exhibitions from "./components/Exhibitions";
import News from "./components/News";
import Visit from "./components/Visit";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import { museum } from "./data/museum";

const SculptureViewer = lazy(() => import("./components/SculptureViewer"));
const ColeccionPage = lazy(() => import("./pages/ColeccionPage"));

function HomePage() {
  useEffect(() => {
    document.title = "MUVA – Museo Viedma | Experiencia Guaraní – Jesuítica";
  }, []);

  return (
    <div className="relative bg-muva-ivory text-muva-dark antialiased">
      <LoadingScreen />
      <Navbar />

      <main>
        <Hero />
        <AboutMuseum />
        <History />
        <CollectionPreview />
        <GuaraniExperience />
        <Exhibitions />
        <News />
        <Visit />
        <Contact />
      </main>

      <Footer
        contact={museum.contact}
        fullName={museum.fullName}
        tagline={museum.tagline}
        year={new Date().getFullYear()}
      />

      <Suspense fallback={null}>
        <SculptureViewer />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/coleccion"
        element={
          <Suspense fallback={null}>
            <ColeccionPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
