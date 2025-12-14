import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Layers, Cpu, Palette, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const phases = [
    {
      id: 1,
      title: "KICKOFF & DISCOVERY",
      desc: "Market analysis, stakeholder interviews, and insight synthesis.",
      icon: <Zap className="w-8 h-8" />,
      color: "bg-primary",
      border: "border-primary",
      image: "/images/icon-discovery-pop.png"
    },
    {
      id: 2,
      title: "BRAND STRATEGY",
      desc: "Defining the Consumer, Commercialisation, Concept, and Culture.",
      icon: <Layers className="w-8 h-8" />,
      color: "bg-secondary",
      border: "border-secondary",
      image: "/images/icon-strategy-pop.png"
    },
    {
      id: 3,
      title: "CREATIVE CONCEPTS",
      desc: "Developing 3-5 distinct visual and verbal territories.",
      icon: <Palette className="w-8 h-8" />,
      color: "bg-accent",
      border: "border-accent",
      image: "/images/icon-concepts-pop.png"
    },
    {
      id: 4,
      title: "CREATIVE DEVELOPMENT",
      desc: "Refining the chosen concept into a robust system.",
      icon: <Cpu className="w-8 h-8" />,
      color: "bg-[#FF9900]", // Orange
      border: "border-[#FF9900]",
      image: "/images/icon-development-pop.png"
    },
    {
      id: 5,
      title: "BRAND TOOLKIT",
      desc: "The final 100+ page guide and asset library.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "bg-[#9900FF]", // Purple
      border: "border-[#9900FF]",
      image: "/images/icon-strategy-pop.png" // Reusing for now or generate specific one
    }
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background border-b-4 border-black">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
           <div className="absolute top-10 right-10 w-64 h-64 bg-secondary rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
           <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-accent rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-black text-white px-4 py-2 font-bold font-display text-sm uppercase tracking-widest transform -rotate-2">
              The ThatThing Methodology
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter uppercase">
              Build Brands <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">Like A Pro</span>
            </h1>
            <p className="text-xl md:text-2xl font-body font-medium max-w-xl border-l-4 border-primary pl-6 py-2">
              A deconstructed framework for creating world-class brand identities, powered by AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/framework">
                <Button className="h-16 px-8 text-xl bg-primary text-primary-foreground border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-display font-bold uppercase">
                  Explore Framework
                </Button>
              </Link>
              <Link href="/ai-blueprint">
                <Button variant="outline" className="h-16 px-8 text-xl bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-display font-bold uppercase">
                  AI Blueprint
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <img 
              src="/images/hero-popart.png" 
              alt="Brand Process Collage" 
              className="w-full h-auto border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
            {/* Floating Elements */}
            <div className="absolute -top-12 -right-12 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-6">
              <span className="font-display font-bold text-2xl">5 PHASES</span>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-secondary text-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
              <span className="font-display font-bold text-2xl">100% PROVEN</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-24 bg-white border-b-4 border-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase mb-6">The 5-Phase Cycle</h2>
            <p className="text-xl max-w-2xl mx-auto font-medium text-gray-600">
              From chaos to clarity. Follow the proven path to build brands that stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {phases.map((phase, index) => (
              <motion.div 
                key={phase.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all"
              >
                <div className={`absolute -top-6 -right-6 w-16 h-16 ${phase.color} border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform`}>
                  <span className="font-display font-bold text-2xl text-black">{phase.id}</span>
                </div>
                
                <div className="mb-6 overflow-hidden border-2 border-black h-48 bg-gray-100 relative">
                   <img src={phase.image} alt={phase.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>

                <h3 className="text-2xl font-display font-bold uppercase mb-3 group-hover:text-primary transition-colors">
                  {phase.title}
                </h3>
                <p className="text-lg font-medium text-gray-600 mb-6">
                  {phase.desc}
                </p>
                
                <Link href="/framework">
                  <a className="inline-flex items-center font-bold uppercase tracking-wide border-b-2 border-black hover:text-primary hover:border-primary transition-all">
                    Learn More <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Blueprint Teaser */}
      <section className="py-24 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase mb-8 leading-tight">
                Automate <br/>
                <span className="text-primary">The Process</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
                We've deconstructed the methodology into a replicable framework for AI. Build your own "Chat-to-Brand" application.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Conversational Discovery Engine",
                  "Strategic Synthesis Models",
                  "Automated Asset Generation",
                  "100+ Page Toolkit Assembly"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-lg font-bold uppercase">
                    <div className="w-6 h-6 bg-secondary mr-4 border-2 border-white"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ai-blueprint">
                <Button className="h-16 px-8 text-xl bg-white text-black border-4 border-white hover:bg-primary hover:border-primary hover:text-white transition-all font-display font-bold uppercase">
                  View The Blueprint
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl transform rotate-12"></div>
              <div className="relative bg-gray-900 border-4 border-white p-8 shadow-[16px_16px_0px_0px_#CCFF00]">
                <pre className="font-mono text-sm md:text-base text-green-400 overflow-x-auto">
{`{
  "phase": "creative_concepts",
  "status": "generating",
  "inputs": {
    "strategy": "rebellious_luxury",
    "archetype": "the_outlaw",
    "palette": ["#FF00CC", "#000000"]
  },
  "output": {
    "concept_1": "Neon Noir",
    "concept_2": "Digital Decay",
    "concept_3": "Future Primitive"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
