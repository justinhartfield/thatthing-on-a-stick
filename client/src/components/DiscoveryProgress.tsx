import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface DiscoveryProgressProps {
  progress: {
    basics: number;
    business: number;
    market: number;
    strategy: number;
    creative: number;
  };
}

export function DiscoveryProgress({ progress }: DiscoveryProgressProps) {
  const sections = [
    { name: 'Basics', key: 'basics' as const, icon: '📋' },
    { name: 'Business', key: 'business' as const, icon: '💼' },
    { name: 'Market', key: 'market' as const, icon: '🎯' },
    { name: 'Strategy', key: 'strategy' as const, icon: '🧭' },
    { name: 'Creative', key: 'creative' as const, icon: '🎨' },
  ];

  const overallProgress = Math.round(
    (progress.basics + progress.business + progress.market + progress.strategy + progress.creative) / 5
  );

  return (
    <Card className="border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Discovery Progress</h3>
              <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Section Progress */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {sections.map((section) => {
              const sectionProgress = progress[section.key];
              const isComplete = sectionProgress >= 100;
              const isActive = sectionProgress > 0 && sectionProgress < 100;

              return (
                <div
                  key={section.key}
                  className={`text-center p-3 rounded-lg border-2 transition-all ${
                    isComplete
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isActive
                      ? 'bg-accent border-foreground'
                      : 'bg-muted border-muted-foreground/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{section.icon}</div>
                  <div className="text-xs font-bold mb-1">{section.name}</div>
                  <div className="flex items-center justify-center">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{sectionProgress}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
