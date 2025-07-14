import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

export default function CreditProgress({ hasAccess }: { hasAccess: boolean }) {
    const MAX_CREDITS = 200;
    const [credits, setCredits] = useState(120); // Start with 120 credits
    
  
    // Calculate percentage for the progress bar
    const creditPercentage = (credits / MAX_CREDITS) * 100;
  
    return (
        
        <div className="p-4 border-">
        {/* Free Plan Badge */}
        <div className="mb-3">
          <div className="bg-green-600 text-foreground text-xs font-medium px-3 py-1 rounded-full text-center">
          {hasAccess ? 'Pro Plan' : 'Free Plan'}
          </div>
        </div>
        </div>
      );
  }