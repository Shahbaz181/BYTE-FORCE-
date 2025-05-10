"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, ShieldAlert, Ear, Settings } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/location-sharing", label: "Location Sharing", icon: MapPin },
  { href: "/danger-alerts", label: "Danger Alerts", icon: ShieldAlert },
  { href: "/guardian-angel", label: "Guardian Angel", icon: Ear },
];

export function NavLinks() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  return (
    <>
      <div className={cn(
          "flex items-center p-2 h-16 border-b",
          sidebarState === "collapsed" ? "justify-center" : "justify-start pl-3"
        )}>
          <Logo iconOnly={sidebarState === 'collapsed'} />
      </div>
      <SidebarMenu className="p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: "right", align:"center" }}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarMenu className="p-2 mt-auto border-t">
         <SidebarMenuItem>
            <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/settings"}
                tooltip={{ children: "Settings", side: "right", align:"center" }}
              >
                <a>
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
