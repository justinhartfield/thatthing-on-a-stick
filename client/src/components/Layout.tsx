import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/framework", label: "THE FRAMEWORK" },
    { href: "/ai-blueprint", label: "AI BLUEPRINT" },
    { href: "/patterns", label: "PATTERNS" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Neo-Brutalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-black bg-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <a className="text-3xl font-display font-bold tracking-tighter hover:text-primary transition-colors uppercase">
              ThatThing<span className="text-primary">.Guide</span>
            </a>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "font-display font-bold text-lg uppercase tracking-wide border-b-4 border-transparent hover:border-primary transition-all",
                    location === item.href ? "border-primary text-primary" : ""
                  )}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            <Button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase"
            >
              Start Building
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b-4 border-black p-4 flex flex-col gap-4 shadow-xl">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "font-display font-bold text-2xl uppercase tracking-wide py-2 border-b-2 border-border/20",
                    location === item.href ? "text-primary" : ""
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            <Button className="w-full bg-secondary text-secondary-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase mt-4">
              Start Building
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl font-display font-bold mb-4 text-primary">THATTHING.GUIDE</h2>
              <p className="text-lg max-w-md text-gray-300">
                Deconstructing the process of world-class brand building. An interactive framework for the next generation of creative agencies.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-4 text-secondary">SITEMAP</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className="hover:text-primary transition-colors uppercase font-bold">{item.label}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-4 text-accent">RESOURCES</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Case Studies</a></li>
                <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2025 MANUS AI. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
              <div className="w-8 h-8 bg-secondary rounded-full"></div>
              <div className="w-8 h-8 bg-accent rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
