import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Code, Cpu, MessageSquare, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "input",
    title: "Conversational Input",
    icon: <MessageSquare className="w-6 h-6" />,
    desc: "Gather project fundamentals, business context, and strategic intent.",
    code: `{
  "role": "user",
  "content": "We're launching a premium coffee brand for remote workers. It needs to feel focused but cozy."
}`
  },
  {
    id: "strategy",
    title: "Strategic Synthesis",
    icon: <Cpu className="w-6 h-6" />,
    desc: "AI analyzes inputs to define the 4C model and brand positioning.",
    code: `{
  "strategy": {
    "archetype": "The Sage",
    "positioning": "Fuel for the focused mind.",
    "values": ["Clarity", "Craft", "Calm"]
  }
}`
  },
  {
    id: "concept",
    title: "Concept Generation",
    icon: <ImageIcon className="w-6 h-6" />,
    desc: "Generate 3-5 distinct visual and verbal territories.",
    code: `{
  "concepts": [
    { "name": "Deep Focus", "style": "Minimalist" },
    { "name": "The Study", "style": "Academic" },
    { "name": "Flow State", "style": "Ethereal" }
  ]
}`
  },
  {
    id: "toolkit",
    title: "Toolkit Assembly",
    icon: <FileText className="w-6 h-6" />,
    desc: "Compile the final 100+ page brand guideline document.",
    code: `Generating PDF...
[OK] Logo Guidelines
[OK] Color Palette
[OK] Typography System
[OK] Brand in Action
> Toolkit_Final.pdf created.`
  }
];

export default function AIBlueprint() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="bg-black text-white py-20 border-b-4 border-primary">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase mb-6 tracking-tighter">
            AI <span className="text-primary">Blueprint</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl font-light text-gray-300">
            The technical architecture for building an autonomous "Chat-to-Brand" application.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  "border-4 border-black p-6 cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  activeStep === index ? "bg-secondary text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "bg-white hover:bg-gray-50"
                )}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className={cn(
                    "p-2 border-2 border-black bg-white text-black",
                    activeStep === index ? "bg-black text-white border-white" : ""
                  )}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase">{step.title}</h3>
                </div>
                <p className={cn("text-lg font-medium", activeStep === index ? "text-white" : "text-gray-600")}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Code Preview */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="bg-gray-900 border-4 border-black shadow-[12px_12px_0px_0px_#CCFF00] rounded-none overflow-hidden">
                <div className="bg-gray-800 p-4 border-b-2 border-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 font-mono text-sm text-gray-400">process_engine.py</span>
                </div>
                <div className="p-6 min-h-[400px] font-mono text-sm md:text-base">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <pre className="text-green-400 whitespace-pre-wrap">
                      {steps[activeStep].code}
                    </pre>
                  </motion.div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-accent border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-display font-bold text-xl uppercase mb-2">Implementation Note</h4>
                <p className="font-medium">
                  This workflow requires chaining multiple LLM calls. Do not attempt to generate the entire toolkit in one pass. Use intermediate validation steps (human-in-the-loop) after the Strategy and Concept phases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
