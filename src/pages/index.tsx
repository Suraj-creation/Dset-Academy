import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import IndustriesSection from "../components/home/IndustriesSection";
import Services from "../components/home/Services";
import About from "../components/home/About";
import Contact from "../components/home/Contact";

export default function Home() {
  return (
    <Layout
      title="DSeT Consulting | Vertical AI Platforms for Mining, Industrial & Healthcare Operations"
      description="DSeT builds vertical AI platforms for regulated and operationally complex industries. OreBill AI, EdgeBay Intelligence, SecureCloud, iPaS-RevOps — edge-ready, compliance-first."
    >
      <>
        <Hero />
        <IndustriesSection />
        <About />
        <Services />
        <Contact />
      </>
    </Layout>
  );
}
