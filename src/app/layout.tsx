import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { NavLinks } from '@/components/layout/nav-links';
import { SOSButtonFAB } from '@/components/common/sos-button-fab';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SheSafe - Your Personal Safety Companion',
  description: 'Comprehensive safety solution for women with real-time location sharing and smart emergency features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Determine current page title (can be improved with a context or route matching)
  // For now, a placeholder or derive it if possible.
  // This would ideally be dynamic based on the current page.
  // We'll pass a default and let specific pages override if needed or handle in AppHeader.
  const currentPageTitle = "Dashboard"; 

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen bg-background font-sans"
        )}
      >
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon">
            <SidebarContent>
              <NavLinks />
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="flex flex-col">
            {/* AppHeader will be dynamic based on current page. 
                For this example, it might be better to have AppHeader inside each page 
                or use a context to set the title.
                Let's assume for now AppHeader gets title from page props or context.
                For this structure, it makes sense to put it inside the page content,
                or pass title from children.
                Simplified: For now, we assume AppHeader might be part of the child content or a static title.
                Or, for a global header, we pass a generic title or implement dynamic title logic.
            */}
            {/* For a consistent header, it's better placed here, but title needs to be dynamic.
                We'll pass a generic title for now.
            */}
            <AppHeader title="SheSafe" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
          <SOSButtonFAB />
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
