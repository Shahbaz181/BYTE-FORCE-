"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ShieldAlert, Ear, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PageHeaderTitle } from '@/components/common/page-header-title';
import { AppHeader } from '@/components/layout/app-header'; // Import AppHeader here


const quickActions = [
  {
    title: 'Share Location',
    description: 'Let trusted contacts know where you are in real-time.',
    href: '/location-sharing',
    icon: MapPin,
    cta: 'Start Sharing',
  },
  {
    title: 'Danger Alerts',
    description: 'View AI-powered alerts for nearby danger zones.',
    href: '/danger-alerts',
    icon: ShieldAlert,
    cta: 'Check Alerts',
  },
  {
    title: 'Guardian Angel Mode',
    description: 'Activate enhanced monitoring when you feel unsafe.',
    href: '/guardian-angel',
    icon: Ear,
    cta: 'Activate Mode',
  },
];

export default function DashboardPage() {
  // Update AppHeader title dynamically - this is a common pattern for page-specific titles
  // This could also be done via context or a hook that AppHeader consumes.
  // For simplicity, we're not directly manipulating AppHeader's props from RootLayout here.
  // We assume AppHeader in RootLayout is generic or this page might render its own specific header if needed.
  // Since AppHeader is in RootLayout, this PageHeaderTitle is for the content area.

  return (
    <>
      <PageHeaderTitle title="Dashboard" description="Your personal safety at a glance." />
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to SheSafe</CardTitle>
            <CardDescription>Empowering you with tools for safety and peace of mind. Access key features below or use the SOS button in emergencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Card key={action.title} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{action.title}</CardTitle>
                    <action.icon className="h-6 w-6 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                  <CardContent className="pt-0">
                     <Link href={action.href} passHref>
                        <Button className="w-full">
                           {action.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Safety Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-4">
            <Image 
              src="https://picsum.photos/seed/safetytip/300/200" 
              alt="Safety tip illustration" 
              width={200} 
              height={133} 
              className="rounded-lg object-cover"
              data-ai-hint="safety awareness" 
            />
            <div>
              <p className="text-lg font-semibold text-primary">Stay Aware of Your Surroundings</p>
              <p className="text-muted-foreground mt-1">
                Always be conscious of what's happening around you, especially in new or crowded places. Avoid distractions like using your phone excessively while walking alone.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder for active status, e.g., if location sharing is on */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Active Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No active safety features currently enabled.</p>
            {/* Example: <p className="text-green-600">Location sharing active with 2 guardians (ends in 23 mins).</p> * /}
          </CardContent>
        </Card> */}
      </div>
    </>
  );
}
