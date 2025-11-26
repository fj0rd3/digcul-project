import Navbar from './components/Navbar';
import IntroSection from './components/IntroSection';
import ResearchQuestion from './components/ResearchQuestion';
import ResultsSection from './components/ResultsSection';
import ParallelCategories from './components/ParallelCategories';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import Plot3D from './components/Plot3D';
import ConclusionSection from './components/ConclusionSection';
import AboutSection from './components/AboutSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <Navbar />
      <IntroSection />
      <ResearchQuestion />
      <ResultsSection />
      
      {/* Visualize It Yourself Section */}
      <section id="visualization" className="bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="py-16 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
            Interactive Tools
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Visualize It Yourself
          </h2>
        </div>
        <ParallelCategories />
        <CorrelationHeatmap />
        <Plot3D />
      </section>
      
      <ConclusionSection />
      <AboutSection />
    </div>
  );
}
