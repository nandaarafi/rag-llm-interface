'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Agent } from '@/lib/db/agent-schema';

interface AgentIndicatorProps {
  agent?: Agent | null;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function AgentIndicator({ 
  agent, 
  size = 'sm', 
  showTooltip = true 
}: AgentIndicatorProps) {
  if (!agent) {
    return null;
  }

  const sizeClasses = {
    sm: 'size-4 text-xs',
    md: 'size-6 text-sm',
  };

  const indicator = (
    <div
      className={`flex items-center justify-center rounded-full ${sizeClasses[size]} shrink-0`}
      style={{ 
        backgroundColor: `${agent.color}15`, 
        color: agent.color,
        border: `1px solid ${agent.color}30`
      }}
    >
      {agent.icon}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {indicator}
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <div className="font-medium">{agent.name}</div>
          <div className="text-xs text-muted-foreground">
            {agent.description}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}