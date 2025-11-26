export default function ResearchQuestion() {
  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black"
    >
      {/* Background layers */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-zinc-900/50 to-black/50"></div>
      </div>

      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-orange-800/10 to-zinc-900/50"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div>
          {/* Label */}
          <span className="inline-block px-4 py-1.5 mb-8 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
            Research Question
          </span>

          {/* Main question */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            How does social media use impact young people&apos;s{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              political engagement preferences
            </span>{' '}
            and{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              political opinion
            </span>
            ?
          </h2>

          {/* Decorative line */}
          <div className="mt-12 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500/50 via-amber-500/50 to-orange-500/50 rounded-full"></div>
          </div>

          {/* Methodology button */}
          <div className="mt-10">
            <a
              href="#about"
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-500/50 rounded-xl hover:border-orange-400 hover:from-orange-500/30 hover:to-amber-500/30 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Methodology
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
