
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useCredits } from "@/contexts/credit-context";
import { getPlanConfig, type PlanType } from "@/lib/pricing-config";

export default function CreditProgress() {
  const { credits, planType, loading, error } = useCredits();
  const getMaxCredits = (plan: PlanType) => {
    return getPlanConfig(plan).credits;
  };

  const getPlanColor = (plan: PlanType) => {
    switch (plan) {
      case 'pro': return 'bg-blue-600';
      case 'ultra': return 'bg-purple-600';
      default: return 'bg-gray-600'; // free
    }
  };

  const getPlanName = (plan: PlanType) => {
    return `${getPlanConfig(plan).displayName} Plan`;
  };


  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {/* Plan Badge Skeleton */}
        <Skeleton className="h-6 w-20" />
        
        {/* Credits Display Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          <Skeleton className="h-2 w-full" />
          
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-xs text-red-600">
        Failed to load credits
      </div>
    );
  }

  const maxCredits = getMaxCredits(planType as PlanType);
  const creditPercentage = maxCredits > 0 ? (credits / maxCredits) * 100 : 0;

  return (
    <div className="p-4 space-y-3">
      {/* Plan Badge */}
      <div>
        <Badge className={`${getPlanColor(planType as PlanType)} text-white text-xs font-medium px-3 py-1`}>
          {getPlanName(planType as PlanType)}
        </Badge>
      </div>

      {/* Credits Display */}
      <div className="space-y-2">
        {credits === 0 ? (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">No credits available</div>
            <div className="text-xs text-muted-foreground mt-1">Upgrade to get AI credits</div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">AI Credits</span>
              <span className="font-medium">
                {maxCredits > 0 ? `${credits} / ${maxCredits}` : `${credits} remaining`}
              </span>
            </div>
            
            {maxCredits > 0 && (
              <Progress 
                value={creditPercentage} 
                className="h-2"
              />
            )}
            
            <div className="text-xs text-muted-foreground">
              {planType === 'free' 
                ? 'One-time credits' 
                : 'Resets monthly'
              }
            </div>
          </>
        )}
      </div>

      {/* Low credits warning */}
      {maxCredits > 0 && credits <= 5 && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ Low credits remaining. Consider upgrading your plan.
        </div>
      )}
      
      {/* No credits warning for free plan with 0 credits */}
      {credits === 0 && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          🚫 No credits available. Upgrade to start chatting.
        </div>
      )}
    </div>
  );
}