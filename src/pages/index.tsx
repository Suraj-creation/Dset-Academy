import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import ProblemStatement from "../components/home/ProblemStatement";
import IndustriesSection from "../components/home/IndustriesSection";
import Services from "../components/home/Services";
import About from "../components/home/About";
import SecurityGovernance from "../components/home/SecurityGovernance";
import HomeFAQ from "../components/home/HomeFAQ";
import Contact from "../components/home/Contact";

export default function Home() {
  return (
    <Layout
      title="DSeT Consulting | Vertical AI Platforms for Regulated Operations"
      description="DSeT builds Vertical AI Platforms™ for mining, pharma, wellness, industrial edge and enterprise operations — combining domain workflows, secure cloud and AI-led automation."
    >
      <>
        <Hero />
        <ProblemStatement />
        <IndustriesSection />
        <About />
        <Services />
        <SecurityGovernance />
        <HomeFAQ />
        <Contact />
      </>
    </Layout>
  );
}
