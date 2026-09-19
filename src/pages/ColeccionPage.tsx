import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Collection3D from "../components/Collection3D";
import Footer from "../components/Footer";
import { museum } from "../data/museum";

export default function ColeccionPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Colección – MUVA – Museo Viedma";
  }, []);

  return (
    <div className="relative bg-muva-ivory text-muva-dark antialiased">
      <Navbar />
      <main className="pt-20 md:pt-24">
        <Collection3D />
      </main>
      <Footer
        contact={museum.contact}
        fullName={museum.fullName}
        tagline={museum.tagline}
        year={new Date().getFullYear()}
      />
    </div>
  );
}
