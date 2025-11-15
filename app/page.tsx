import Navbar from './components/Navbar';
import IntroSection from './components/IntroSection';
import StatisticalInsights from './components/StatisticalInsights';
import ParallelCategories from './components/ParallelCategories';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import Plot3D from './components/Plot3D';
import AboutSection from './components/AboutSection';
import ComprehensiveExport from './components/ComprehensiveExport';

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <Navbar />
      <IntroSection />
      <StatisticalInsights />
      <ParallelCategories />
      <CorrelationHeatmap />
      <section id="visualization" className="bg-gradient-to-b from-black via-zinc-900 to-black">
        <Plot3D />
      </section>
      <AboutSection />
      <ComprehensiveExport />
    </div>
  );
}
