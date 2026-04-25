export default function ValueProposition() {
  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 relative z-10">
      {/* Poster Side */}
      <div className="relative p-10 rounded-4xl bg-vexed-bg1/80 backdrop-blur-md border border-vexed-accent2 overflow-hidden group hover:border-vexed-highlight2 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(129,140,248,0.3)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-vexed-highlight2/20 rounded-full blur-[80px] -mr-20 -mt-20 transition-opacity duration-700 group-hover:opacity-100 opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-vexed-highlight2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-vexed-highlight2 transition-colors duration-300">For Posters</h3>
        <p className="text-vexed-dim text-lg mb-8 leading-relaxed">
          Got a problem you wish someone would fix? Vexed is the place to vent constructively.
          Post your frustrations, describe the pain points, and watch developers build solutions to your exact problem.
        </p>
        <ul className="space-y-5 text-gray-300 relative z-10">
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-highlight2 font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-highlight2/20 transition-all duration-300 shadow-inner">1</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Post a frustration</span>
          </li>
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-highlight2 font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-highlight2/20 transition-all duration-300 shadow-inner">2</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Vote on other problems</span>
          </li>
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-highlight2 font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-highlight2/20 transition-all duration-300 shadow-inner">3</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Test developer solutions</span>
          </li>
        </ul>
      </div>

      {/* Solver Side */}
      <div className="relative p-10 rounded-4xl bg-vexed-bg1/80 backdrop-blur-md border border-vexed-accent2 overflow-hidden group hover:border-vexed-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(26,44,254,0.3)]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-vexed-primary/20 rounded-full blur-[80px] -ml-20 -mt-20 transition-opacity duration-700 group-hover:opacity-100 opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-linear-to-bl from-transparent via-transparent to-vexed-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-vexed-primary transition-colors duration-300">For Solvers</h3>
        <p className="text-vexed-dim text-lg mb-8 leading-relaxed">
          Tired of building to-do apps? Build something people actually want.
          Browse real-world problems with validated demand and build targeted solutions that users are asking for.
        </p>
        <ul className="space-y-5 text-gray-300 relative z-10">
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-primary font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-primary/20 transition-all duration-300 shadow-inner">1</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Find validated problems</span>
          </li>
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-primary font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-primary/20 transition-all duration-300 shadow-inner">2</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Build and submit solutions</span>
          </li>
          <li className="flex items-center gap-4 group/item">
            <div className="w-12 h-12 shrink-0 rounded-full bg-vexed-accent2 flex items-center justify-center text-vexed-primary font-bold text-lg group-hover/item:scale-110 group-hover/item:bg-vexed-primary/20 transition-all duration-300 shadow-inner">3</div>
            <span className="text-lg font-medium group-hover/item:text-white transition-colors">Gain real-world users</span>
          </li>
        </ul>
      </div>
    </section>
  )
}