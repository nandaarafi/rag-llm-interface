export type PlanType = 'free' | 'pro';

export interface PricingPlan {
  id: PlanType;
  name: string;
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceDisplay: {
    monthly: string;
    yearly: string;
  };
  description: string;
  features: string[];
  credits: number;
  hasAccess: boolean;
  lemonsqueezy: {
    variantId?: string;
  };
  ui: {
    popular?: boolean;
    proGlow?: boolean;
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'ghost';
  };
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Hobby',
    displayName: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    priceDisplay: {
      monthly: 'Free',
      yearly: 'Free',
    },
    description: 'Free',
    features: [
      "10 access requests to GPT-4o Mini.",
      "Limited agent requests.",
      "Limited tab completions.",
      "Pro two-week trial."
    ],
    credits: 0,
    hasAccess: false,
    lemonsqueezy: {},
    ui: {
      popular: false,
      proGlow: false,
      buttonText: 'Current Plan',
      buttonVariant: 'outline',
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro',
    price: {
      monthly: 9,
      yearly: 8,
    },
    priceDisplay: {
      monthly: '$9',
      yearly: '$8',
    },
    description: 'Everything in Hobby, plus',
    features: [
      "200 access requests to OpenAI GPT-4.1, Claude, etc.",
      "Extended limits on agent requests.",
      "Unlimited tab completions.",
      "Access to Background Agents.",
      "Access to Bug Bot.",
      "Access to maximum context windows."
    ],
    credits: 300,
    hasAccess: true,
    lemonsqueezy: {
      variantId: '818286',
    },
    ui: {
      popular: true,
      proGlow: true,
      buttonText: 'Get Pro',
      buttonVariant: 'default',
    },
  }
  // ultra: {
  //   id: 'ultra',
  //   name: 'Ultra',
  //   displayName: 'Ultra',
  //   price: {
  //     monthly: 20,
  //     yearly: 16,
  //   },
  //   priceDisplay: {
  //     monthly: '$20',
  //     yearly: '$16',
  //   },
  //   description: 'Everything in Pro, plus',
  //   features: [
  //     "20x usage on all OpenAI, Claude, Gemini models.",
  //     "Priority access to new features.",
  //     "Unlimited access to all models."
  //   ],
  //   credits: 1000,
  //   hasAccess: true,
  //   lemonsqueezy: {
  //     variantId: '905815',
  //   },
  //   ui: {
  //     popular: false,
  //     proGlow: false,
  //     buttonText: 'Get Ultra',
  //     buttonVariant: 'default',
  //   },
  // },
} as const;

// Helper functions
export function getPlanByVariantId(variantId: string): PlanType | null {
  for (const [planId, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.lemonsqueezy.variantId === variantId) {
      return planId as PlanType;
    }
  }
  return null;
}

export function getPlanConfig(planType: PlanType): PricingPlan {
  return PRICING_PLANS[planType];
}

export function getAllPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS);
}

export function getCreditsForPlan(planType: PlanType): number {
  return PRICING_PLANS[planType].credits;
}

export function hasAccessForPlan(planType: PlanType): boolean {
  return PRICING_PLANS[planType].hasAccess;
}

// Get plans available for purchase (excluding free)
export function getPurchasablePlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS).filter(plan => plan.id !== 'free');
}