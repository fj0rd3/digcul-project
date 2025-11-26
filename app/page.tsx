import Navbar from './components/Navbar';
import IntroSection from './components/IntroSection';
import ResearchQuestion from './components/ResearchQuestion';
import DigitalCultureGame from './components/DigitalCultureGame';
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
      <ResearchQuestion />
      <section id="interactive" className="py-24 bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
              Interactive Demo
            </span>
          </div>
          <DigitalCultureGame />
        </div>
      </section>
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
