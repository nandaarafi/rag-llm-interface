'use client';
import { Settings,   
  LogOut,  
  Star, } from 'lucide-react';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';

import { useTheme } from 'next-themes';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useRouter } from 'next/navigation';

export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpgradeToPro = () => {
    router.push('/pricing');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {!user.image ? (
                <div className="size-9 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <Avatar>
                  <AvatarImage
                    src={user.image}
                    alt={user.name || 'User avatar'}
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </div>
            <Settings className="size-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="top">
        <div className="flex items-center gap-3 p-2">
          {!user.image ? (
            <div className="size-9 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-medium text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <Avatar>
              <AvatarImage
                src={user.image}
                alt={user.name || 'User avatar'}
              />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleUpgradeToPro}>
            <Star className="mr-2 size-4" />
            <span>Upgrade to Pro</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-400 hover:!bg-red-400/20 hover:!text-red-400 focus:!bg-red-400/20 focus:!text-red-400"
        >
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
