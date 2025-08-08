'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentIndicator } from '@/components/agent-indicator';
import { getMockAgents } from '@/lib/default-agents';
import type { Agent } from '@/lib/db/agent-schema';

interface AgentManagementSectionProps {
  userId?: string;
  showOnlyWhenMultiple?: boolean;
}

export function AgentManagementSection({ 
  userId, 
  showOnlyWhenMultiple = true 
}: AgentManagementSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mock data - in production this would come from API
  const agents = userId ? getMockAgents(userId) : [];
  
  // Don't show if user has no agents or only one agent (when showOnlyWhenMultiple is true)
  if (!userId || agents.length === 0 || (showOnlyWhenMultiple && agents.length <= 1)) {
    return null;
  }

  const activeAgents = agents.filter(agent => agent.isActive);
  const defaultAgent = agents.find(agent => agent.isDefault);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group/label w-full flex items-center justify-between text-xs text-sidebar-foreground/70">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between p-0 h-6 font-medium text-xs hover:bg-transparent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2">
            My Agents
            <span className="text-sidebar-foreground/50">({activeAgents.length})</span>
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="size-3" />
          </motion.div>
        </Button>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <SidebarMenu>
                {activeAgents.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      size="sm"
                      className="group/agent"
                      onClick={() => {
                        // TODO: Open agent settings or quick actions
                        console.log('Manage agent:', agent.name);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <AgentIndicator agent={agent} size="sm" showTooltip={false} />
                        <span className="truncate text-xs">{agent.name}</span>
                        {agent.isDefault && (
                          <span className="px-1 py-0.5 bg-primary/10 text-primary rounded text-[10px] leading-none">
                            Default
                          </span>
                        )}
                      </div>
                      <Settings className="size-3 opacity-0 group-hover/agent:opacity-50 transition-opacity" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Create New Agent Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      // TODO: Open create agent dialog
                      console.log('Create new agent');
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center size-4 rounded-full border border-dashed border-muted-foreground/50">
                        <Plus className="size-2.5" />
                      </div>
                      <span className="text-xs">Create Agent</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}