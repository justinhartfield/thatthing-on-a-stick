import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const phases = [
  {
    id: 1,
    title: "Kickoff & Discovery",
    duration: "1-2 Weeks",
    deliverable: "Kickoff Presentation",
    color: "bg-primary",
    borderColor: "border-primary",
    description: "The foundation. We immerse ourselves in the business, the market, and the audience to establish a shared truth.",
    activities: [
      "Market & Competitor Analysis",
      "Stakeholder Interviews",
      "Business Review",
      "Audience Research",
      "Insight Synthesis"
    ]
  },
  {
    id: 2,
    title: "Brand Strategy",
    duration: "2-3 Weeks",
    deliverable: "Strategy Presentation",
    color: "bg-secondary",
    borderColor: "border-secondary",
    description: "The blueprint. We define the core DNA using the 4C Model: Consumer, Commercialisation, Concept, and Culture.",
    activities: [
      "Strategic Framework Development",
      "Positioning Definition",
      "Audience Segmentation",
      "Purpose & Ambition Setting",
      "Brand Personality Definition"
    ]
  },
  {
    id: 3,
    title: "Creative Concepts",
    duration: "2-3 Weeks",
    deliverable: "Creative Concepts Presentation",
    color: "bg-accent",
    borderColor: "border-accent",
    description: "The exploration. We develop 3-5 distinct visual and verbal territories to explore different strategic angles.",
    activities: [
      "Concept Naming & Storytelling",
      "Visual Identity Exploration",
      "Tone of Voice Development",
      "Application Mockups",
      "Territory Definition"
    ]
  },
  {
    id: 4,
    title: "Creative Development",
    duration: "3-4 Weeks",
    deliverable: "Creative Development Presentation",
    color: "bg-[#FF9900]",
    borderColor: "border-[#FF9900]",
    description: "The refinement. We take the chosen concept and build it out into a robust, flexible system.",
    activities: [
      "Logo & Type Refinement",
      "Color System Finalization",
      "Illustration & Iconography",
      "Motion Principles",
      "Messaging Bank Creation"
    ]
  },
  {
    id: 5,
    title: "Brand Toolkit",
    duration: "2-3 Weeks",
    deliverable: "Comprehensive Brand Toolkit (PDF)",
    color: "bg-[#9900FF]",
    borderColor: "border-[#9900FF]",
    description: "The bible. A 100+ page document that codifies every aspect of the brand for future consistency.",
    activities: [
      "Guideline Writing",
      "Asset Production",
      "Specification Detailing",
      "Template Creation",
      "Final Deliverable Assembly"
    ]
  }
];

export default function Framework() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="bg-black text-white py-20 border-b-4 border-primary">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase mb-6 tracking-tighter">
            The <span className="text-primary">Framework</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl font-light text-gray-300">
            A rigorous, five-phase methodology designed to take a brand from abstract idea to production-ready reality.
          </p>
        </div>
      </div>

      {/* Phase List */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300",
                expandedPhase === phase.id ? "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
              )}
            >
              <div 
                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-4 border-black font-display font-bold text-3xl md:text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    phase.color
                  )}>
                    {phase.id}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-display font-bold uppercase mb-2">{phase.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-bold uppercase tracking-wide text-gray-600">
                      <span className="flex items-center gap-2">
                        <Clock size={16} /> {phase.duration}
                      </span>
                      <span className="flex items-center gap-2">
                        <Target size={16} /> {phase.deliverable}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="self-end md:self-center">
                  {expandedPhase === phase.id ? <ChevronUp size={32} /> : <ChevronDown size={32} />}
                </div>
              </div>

              <AnimatePresence>
                {expandedPhase === phase.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t-4 border-black bg-gray-50"
                  >
                    <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-display font-bold text-xl uppercase mb-4 border-b-2 border-black inline-block">Description</h3>
                        <p className="text-lg leading-relaxed font-medium text-gray-800">
                          {phase.description}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl uppercase mb-4 border-b-2 border-black inline-block">Key Activities</h3>
                        <ul className="space-y-3">
                          {phase.activities.map((activity, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className={cn("w-6 h-6 mt-1 border-2 border-black flex-shrink-0", phase.color)}></div>
                              <span className="font-bold text-gray-800">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
