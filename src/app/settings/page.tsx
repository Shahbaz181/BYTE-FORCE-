import { PageHeaderTitle } from '@/components/common/page-header-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ManageGuardians } from '@/components/features/settings/manage-guardians';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeaderTitle 
        title="Settings"
        description="Manage your SheSafe application preferences and account details."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="SheSafe User" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@shesafe.com" />
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dangerAlertsNotifications" className="flex flex-col space-y-1">
                <span>Danger Alert Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive push notifications for nearby danger zones.
                </span>
              </Label>
              <Switch id="dangerAlertsNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="guardianAngelNotifications" className="flex flex-col space-y-1">
                <span>Guardian Angel Updates</span>
                 <span className="font-normal leading-snug text-muted-foreground">
                  Alerts related to Guardian Angel mode activity.
                </span>
              </Label>
              <Switch id="guardianAngelNotifications" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <ManageGuardians />
      </div>
    </div>
  );
}

