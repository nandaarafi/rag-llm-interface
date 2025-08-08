'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chat } from './chat';
import type { VisibilityType } from './visibility-selector';
import { AgentMemory } from '@/lib/agent-memory';
import { getMockAgents } from '@/lib/default-agents';
import type { Agent } from '@/lib/db/agent-schema';
import type { UIMessage } from 'ai';

interface AgentAwareChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  userId?: string;
}

export function AgentAwareChat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  userId,
}: AgentAwareChatProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadSelectedAgent = () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const agents = getMockAgents(userId);
        let agentToUse: Agent | null = null;

        // 1. Check URL params for agent selection (future feature)
        const agentIdFromUrl = searchParams.get('agent');
        if (agentIdFromUrl) {
          agentToUse = agents.find(agent => agent.id === agentIdFromUrl) || null;
        }

        // 2. Check localStorage for selected agent (from dropdown)
        if (!agentToUse) {
          const selectedAgentId = localStorage.getItem('selectedAgentId');
          if (selectedAgentId) {
            agentToUse = agents.find(agent => agent.id === selectedAgentId) || null;
            // Clear the localStorage item after use
            localStorage.removeItem('selectedAgentId');
          }
        }

        // 3. Fall back to last used agent
        if (!agentToUse) {
          const lastUsedId = AgentMemory.getLastUsedAgent();
          if (lastUsedId) {
            agentToUse = agents.find(agent => agent.id === lastUsedId) || null;
          }
        }

        // 4. Fall back to default agent
        if (!agentToUse) {
          agentToUse = agents.find(agent => agent.isDefault) || agents[0] || null;
        }

        setSelectedAgent(agentToUse);

        // Save agent selection to memory if we have one
        if (agentToUse) {
          AgentMemory.setLastUsedAgent(agentToUse.id);
        }
      } catch (error) {
        console.warn('Failed to load agent selection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedAgent();
  }, [userId, searchParams]);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Setting up chat...
        </div>
      </div>
    );
  }

  // For now, pass the same props to Chat - in future this will include agent context
  return (
    <div className="flex flex-col h-full">
      {/* Agent context indicator (optional, for debugging) */}
      {selectedAgent && process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 text-xs bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <span 
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: selectedAgent.color }}
            />
            <span>Agent: {selectedAgent.name}</span>
          </div>
        </div>
      )}
      
      <Chat
        id={id}
        initialMessages={initialMessages}
        selectedChatModel={selectedChatModel}
        selectedVisibilityType={selectedVisibilityType}
        isReadonly={isReadonly}
      />
    </div>
  );
}