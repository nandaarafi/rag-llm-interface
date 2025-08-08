'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMockAgents } from '@/lib/default-agents';
import { AgentMemory, useAgentMemory } from '@/lib/agent-memory';
import type { Agent } from '@/lib/db/agent-schema';

interface AgentNewChatDropdownProps {
  userId?: string;
}

export function AgentNewChatDropdown({ userId }: AgentNewChatDropdownProps) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [lastUsedAgent, setLastUsedAgent] = useState<Agent | null>(null);
  const { getLastUsedAgent, setLastUsedAgent: saveLastUsedAgent, getRecentlyUsedAgents } = useAgentMemory();

  // Memoize agents to prevent unnecessary re-renders
  const agents = useMemo(() => {
    return userId ? getMockAgents(userId) : [];
  }, [userId]);
  
  const defaultAgent = agents.find(agent => agent.isDefault) || agents[0];

  // Load last used agent on component mount
  useEffect(() => {
    const lastUsedId = getLastUsedAgent();
    if (lastUsedId) {
      const agent = agents.find(a => a.id === lastUsedId);
      setLastUsedAgent(agent || null);
    }
  }, [agents, getLastUsedAgent]);

  // Get recently used agents for prioritized display
  const recentlyUsed = getRecentlyUsedAgents(3);
  const recentAgentIds = recentlyUsed.map(record => record.agentId);
  
  // Sort agents: recently used first, then others
  const sortedAgents = [
    ...agents.filter(agent => recentAgentIds.includes(agent.id))
      .sort((a, b) => {
        const aIndex = recentAgentIds.indexOf(a.id);
        const bIndex = recentAgentIds.indexOf(b.id);
        return aIndex - bIndex;
      }),
    ...agents.filter(agent => !recentAgentIds.includes(agent.id))
  ];

  const handleNewChat = (agent?: Agent) => {
    setOpenMobile(false);
    
    // Use last used agent, selected agent, or default agent
    const selectedAgent = agent || lastUsedAgent || defaultAgent;
    
    if (selectedAgent) {
      // Save to memory for future reference
      saveLastUsedAgent(selectedAgent.id);
      
      // Store for new chat creation
      localStorage.setItem('selectedAgentId', selectedAgent.id);
    }
    
    router.push('/chat');
    router.refresh();
  };

  // If no user or no agents, show simple new chat button
  if (!userId || agents.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="p-2 h-fit"
            onClick={() => handleNewChat()}
          >
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">New Chat</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 h-fit flex items-center gap-1 hover:bg-muted"
          type="button"
        >
          <Plus className="size-4" />
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          New Chat With
          {lastUsedAgent && (
            <span className="text-xs text-muted-foreground font-normal">
              Last: {lastUsedAgent.name}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Quick start with last used agent */}
        {lastUsedAgent && (
          <>
            <DropdownMenuItem
              onClick={() => handleNewChat(lastUsedAgent)}
              className="flex items-center gap-3 p-3 cursor-pointer bg-muted/50"
            >
              <div 
                className="flex items-center justify-center size-8 rounded-full text-sm"
                style={{ backgroundColor: `${lastUsedAgent.color}20`, color: lastUsedAgent.color }}
              >
                {lastUsedAgent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {lastUsedAgent.name}
                  <Clock className="size-3 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Continue with last used
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {sortedAgents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => handleNewChat(agent)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div 
              className="flex items-center justify-center size-8 rounded-full text-sm"
              style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
            >
              {agent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm flex items-center gap-2">
                {agent.name}
                {recentAgentIds.includes(agent.id) && agent.id !== lastUsedAgent?.id && (
                  <span className="px-1 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[10px] leading-none">
                    Recent
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {agent.description}
              </div>
            </div>
            {agent.isDefault && (
              <div className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                Default
              </div>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // TODO: Open agent management/creation dialog
            console.log('Create new agent');
          }}
          className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground"
        >
          <div className="flex items-center justify-center size-8 rounded-full border-2 border-dashed border-muted-foreground/30">
            <Plus className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">Create New Agent</div>
            <div className="text-xs text-muted-foreground">
              Custom instructions and personality
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}