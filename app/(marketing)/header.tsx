"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LogoWithName } from "./logo"
import { useEffect, useState } from "react"
// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home", active: false },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
]

interface HeaderProps {
  isAuthenticated: boolean;
}

export default function Header({ isAuthenticated }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
    return undefined
  }, [lastScrollY])

  return (
    <header className={`fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="flex h-16 items-center">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-&lsqb;cubic-bezier(.5,.85,.25,1.1)&rsqb; group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-&lsqb;cubic-bezier(.5,.85,.25,1.8)&rsqb; group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-&lsqb;cubic-bezier(.5,.85,.25,1.1)&rsqb; group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink
                        href={link.href}
                        className="py-1.5"
                        active={link.active}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Logo */}
          <a href="#" className="text-primary hover:text-primary/90">
            <LogoWithName />
          </a>
        </div>

        {/* Center - Navigation menu */}
        <div className="flex-1 flex justify-center">
          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-8">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    active={link.active}
                    href={link.href}
                    className={`relative py-1.5 text-md font-medium transition-colors hover:bg-transparent focus:bg-transparent data-[active]:hover:bg-transparent data-[active]:bg-transparent data-[active]:text-foreground ${
                      link.active 
                        ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary' 
                        : 'text-muted-foreground hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full'
                    }`}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Auth buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            // Authenticated user - Show Dashboard button
            <Button asChild size="sm" className="text-md shadow-lg border-t border-l border-gray-600 shadow-black/50">
              <a href="/chat">Dashboard</a>
            </Button>
          ) : (
            // Unauthenticated user - Show Sign In and Get Started buttons
            <>
              <Button asChild variant="ghost" size="sm" className="text-md shadow-lg border-t border-l border-gray-600 shadow-black/50">
                <a href="/login">Sign In</a>
              </Button>
              <Button asChild size="sm" className="text-md shadow-lg border-t border-l border-gray-600 shadow-black/50">
                <a href="/register">Get Started Free</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
