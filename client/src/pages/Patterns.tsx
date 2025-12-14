import { motion } from "framer-motion";

export default function Patterns() {
  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="bg-black text-white py-20 border-b-4 border-primary">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase mb-6 tracking-tighter">
            Design <span className="text-primary">Patterns</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl font-light text-gray-300">
            Common visual motifs and structural elements extracted from the ThatThing portfolio.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Typography Card */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-display font-bold uppercase mb-4 border-b-4 border-primary inline-block">Typography</h3>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 border-2 border-black">
                <p className="font-display font-bold text-4xl uppercase">Display</p>
                <p className="text-sm text-gray-500 mt-1">Bold, Tight Tracking, Uppercase</p>
              </div>
              <div className="bg-gray-100 p-4 border-2 border-black">
                <p className="font-body text-lg">Body Copy</p>
                <p className="text-sm text-gray-500 mt-1">Clean Sans-Serif, High Legibility</p>
              </div>
              <p className="font-medium text-gray-700">
                ThatThing often pairs a loud, expressive display font with a neutral, geometric sans-serif.
              </p>
            </div>
          </div>

          {/* Color Card */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-display font-bold uppercase mb-4 border-b-4 border-secondary inline-block">Color</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-20 bg-primary border-2 border-black"></div>
              <div className="h-20 bg-secondary border-2 border-black"></div>
              <div className="h-20 bg-accent border-2 border-black"></div>
              <div className="h-20 bg-black border-2 border-black"></div>
            </div>
            <p className="font-medium text-gray-700">
              High contrast is key. Acid greens, hot pinks, and electric blues are often grounded by deep blacks or stark whites.
            </p>
          </div>

          {/* Layout Card */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-display font-bold uppercase mb-4 border-b-4 border-accent inline-block">Layout</h3>
            <div className="space-y-4 mb-4">
              <div className="border-2 border-black h-32 p-2 flex gap-2">
                <div className="w-1/3 bg-gray-200 border border-black"></div>
                <div className="w-2/3 bg-gray-200 border border-black"></div>
              </div>
            </div>
            <p className="font-medium text-gray-700">
              Asymmetric grids, overlapping elements, and "sticker" placement create a sense of organized chaos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
