'use client';

const STORAGE_KEYS = {
  LAST_USED_AGENT: 'mindscribe_last_used_agent',
  AGENT_USAGE_HISTORY: 'mindscribe_agent_usage',
} as const;

export interface AgentUsageRecord {
  agentId: string;
  lastUsed: Date;
  usageCount: number;
}

export class AgentMemory {
  static getLastUsedAgent(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_USED_AGENT);
    } catch {
      return null;
    }
  }

  static setLastUsedAgent(agentId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_USED_AGENT, agentId);
      AgentMemory.updateUsageHistory(agentId);
    } catch {
      // Handle localStorage errors gracefully
    }
  }

  static getUsageHistory(): AgentUsageRecord[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGENT_USAGE_HISTORY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((record: any) => ({
        ...record,
        lastUsed: new Date(record.lastUsed),
      }));
    } catch {
      return [];
    }
  }

  static updateUsageHistory(agentId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = AgentMemory.getUsageHistory();
      const existingIndex = history.findIndex(record => record.agentId === agentId);
      
      if (existingIndex >= 0) {
        history[existingIndex].lastUsed = new Date();
        history[existingIndex].usageCount += 1;
      } else {
        history.push({
          agentId,
          lastUsed: new Date(),
          usageCount: 1,
        });
      }
      
      // Keep only the most recent 50 records
      history.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
      const trimmedHistory = history.slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.AGENT_USAGE_HISTORY, JSON.stringify(trimmedHistory));
    } catch {
      // Handle localStorage errors gracefully
    }
  }

  static getMostUsedAgents(limit = 5): AgentUsageRecord[] {
    const history = AgentMemory.getUsageHistory();
    return history
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  static getRecentlyUsedAgents(limit = 5): AgentUsageRecord[] {
    const history = AgentMemory.getUsageHistory();
    return history
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_USED_AGENT);
      localStorage.removeItem(STORAGE_KEYS.AGENT_USAGE_HISTORY);
    } catch {
      // Handle localStorage errors gracefully
    }
  }
}

// Hook for easy React integration
export function useAgentMemory() {
  const getLastUsedAgent = (): string | null => {
    return AgentMemory.getLastUsedAgent();
  };

  const setLastUsedAgent = (agentId: string): void => {
    AgentMemory.setLastUsedAgent(agentId);
  };

  const getUsageHistory = (): AgentUsageRecord[] => {
    return AgentMemory.getUsageHistory();
  };

  const getMostUsedAgents = (limit?: number): AgentUsageRecord[] => {
    return AgentMemory.getMostUsedAgents(limit);
  };

  const getRecentlyUsedAgents = (limit?: number): AgentUsageRecord[] => {
    return AgentMemory.getRecentlyUsedAgents(limit);
  };

  return {
    getLastUsedAgent,
    setLastUsedAgent,
    getUsageHistory,
    getMostUsedAgents,
    getRecentlyUsedAgents,
  };
}