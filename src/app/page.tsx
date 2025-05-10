
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ShieldAlert, Ear, ArrowRight, Users, Edit } from 'lucide-react';
import Image from 'next/image';
import { PageHeaderTitle } from '@/components/common/page-header-title';
import { StandaloneAddContactForm } from '@/components/features/contacts/standalone-add-contact-form';

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

        {/* Standalone Add Contact Form integrated into the dashboard */}
        <div className="pt-6"> {/* Add some spacing above the form */}
            <StandaloneAddContactForm />
        </div>


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

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary" />
                Manage Emergency Contacts
              </CardTitle>
              <CardDescription className="mt-1">Add, edit, or remove your trusted guardians who receive alerts.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your emergency contacts, or "Guardians," are key to your safety net. Keep their information up-to-date and assign priorities for SOS alerts.
            </p>
            <Image
                src="https://picsum.photos/seed/contactsmanage/600/200"
                alt="Illustration of people connecting"
                width={600}
                height={200}
                className="w-full rounded-lg object-cover aspect-[3/1] mb-4"
                data-ai-hint="contacts network"
            />
          </CardContent>
          <CardFooter>
            <Link href="/settings" passHref>
              <Button className="w-full md:w-auto">
                <Edit className="mr-2 h-4 w-4" /> Manage Contacts
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
      </div>
    </>
  );
}
