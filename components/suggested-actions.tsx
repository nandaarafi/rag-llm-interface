'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  credits: number;
  planType: string;
  hasAccess?: boolean;
}

function PureSuggestedActions({ 
  chatId, 
  append, 
  credits, 
  planType, 
  hasAccess
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      badge: 'Image',
      title: 'Generate an image',
      label: 'of a sunset over mountains',
      action: 'Generate an image of a sunset over mountains',
    },
    {
      badge: 'Code',
      title: 'Write code to',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code to demonstrate djikstra's algorithm`,
    },
    {
      badge: 'Essay',
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      badge: 'PPT',
      title: 'Help me to generate a PPT',
      label: 'about AI in general',
      action: 'Help me to generate a PPT about AI in general',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              // Remove client-side credit checking - let server handle it
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-2 sm:flex-col w-full h-auto justify-start items-start"
          >
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{suggestedAction.title}</span>
                <span className="text-muted-foreground text-left">
                  {suggestedAction.label}
                </span>
              </div>
              <Badge variant="outline" className="text-xs bg-black text-white border-black shrink-0">
                {suggestedAction.badge}
              </Badge>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, (prevProps, nextProps) => {
  if (prevProps.credits !== nextProps.credits) return false;
  if (prevProps.planType !== nextProps.planType) return false;
  if (prevProps.hasAccess !== nextProps.hasAccess) return false;
  return true;
});
