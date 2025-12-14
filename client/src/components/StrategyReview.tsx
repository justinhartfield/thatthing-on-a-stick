import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Lightbulb, Users, Sparkles, Heart, MessageSquare, Zap } from "lucide-react";

interface BrandStrategy {
  positioning: string;
  purposeStatement: string;
  targetAudience: string;
  personality: string[];
  values: string[];
  toneOfVoice: string;
  keyDifferentiators: string[];
}

interface StrategyReviewProps {
  strategy: BrandStrategy;
}

export function StrategyReview({ strategy }: StrategyReviewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6" />
            Brand Positioning
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Your unique market position
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed">{strategy.positioning}</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-secondary text-secondary-foreground">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="w-6 h-6" />
            Brand Purpose
          </CardTitle>
          <CardDescription className="text-secondary-foreground/80">
            Why you exist beyond profit
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed">{strategy.purposeStatement}</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-accent text-accent-foreground">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6" />
            Target Audience
          </CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Who you're building for
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed">{strategy.targetAudience}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Brand Personality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strategy.personality.map((trait, i) => (
                <Badge key={i} variant="default" className="text-sm px-3 py-1">
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary" />
              Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strategy.values.map((value, i) => (
                <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                  {value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            Tone of Voice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">{strategy.toneOfVoice}</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-chart-4" />
            Key Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {strategy.keyDifferentiators.map((diff, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </div>
                <p className="flex-1 leading-relaxed">{diff}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
