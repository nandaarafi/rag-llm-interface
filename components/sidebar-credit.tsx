import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCredits } from "@/contexts/credit-context";

export default function CreditProgress() {
  const { credits, planType, error } = useCredits();
  const getMaxCredits = (plan: string) => {
    switch (plan) {
      case 'pro': return 300;
      case 'ultra': return 1000;
      default: return 30; // free
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-600';
      case 'ultra': return 'bg-purple-600';
      default: return 'bg-gray-600'; // free
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro Plan';
      case 'ultra': return 'Ultra Plan';
      default: return 'Free Plan';
    }
  };


  if (error) {
    return (
      <div className="p-4 text-xs text-red-600">
        Failed to load credits
      </div>
    );
  }

  const maxCredits = getMaxCredits(planType);
  const creditPercentage = (credits / maxCredits) * 100;

  return (
    <div className="p-4 space-y-3">
      {/* Plan Badge */}
      <div>
        <Badge className={`${getPlanColor(planType)} text-white text-xs font-medium px-3 py-1`}>
          {getPlanName(planType)}
        </Badge>
      </div>

      {/* Credits Display */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">AI Credits</span>
          <span className="font-medium">{credits} / {maxCredits}</span>
        </div>
        
        <Progress 
          value={creditPercentage} 
          className="h-2"
        />
        
        <div className="text-xs text-muted-foreground">
          {planType === 'free' 
            ? 'One-time credits' 
            : 'Resets monthly'
          }
        </div>
      </div>

      {/* Low credits warning */}
      {credits <= 5 && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ Low credits remaining. Consider upgrading your plan.
        </div>
      )}
    </div>
  );
}