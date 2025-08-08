'use client';

import type { User } from 'next-auth';
import { useRouter, usePathname } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { EnhancedSidebarHistory } from '@/components/enhanced-sidebar-history';
import { AgentNewChatDropdown } from '@/components/agent-new-chat-dropdown';
import { AgentManagementSection } from '@/components/agent-management-section';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import SidebarCredit from './sidebar-credit';
import { FileText } from 'lucide-react';
const NAVIGATION_ITEMS = [
  { id: 'library', label: 'Library', icon: FileText },
];

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  // console.log(user)
  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        
   
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/chat"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Mindscribe
              </span>
            </Link>
            <AgentNewChatDropdown userId={user?.id} />
            
          </div>
          
        </SidebarMenu>
        <SidebarMenu>
            {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => (
              <SidebarMenuItem key={id}>
                <Link href={id === 'library' ? '/chat/library' : `/${id}`} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname === `/${id}`} // Check if the current route matches
                    className={pathname === `/${id}` ? 'bg-gray-200 hover:bg-gray-300' : ''}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AgentManagementSection userId={user?.id} />
        <EnhancedSidebarHistory user={user} />
      </SidebarContent>
      <SidebarContent>
      </SidebarContent>
      {/* <SidebarCredit /> */}
      <SidebarFooter>
        {user && <SidebarCredit />}
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
