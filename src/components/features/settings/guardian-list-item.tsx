// src/components/features/settings/guardian-list-item.tsx
"use client";

import type { Guardian } from '@/types/guardian';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  HelpCircle,
  MapPin,
  MessageSquare,
  Phone,
  ShieldQuestion,
  Trash2,
  UserCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuardianListItemProps {
  guardian: Guardian;
  onEdit: (guardian: Guardian) => void;
  onDelete: (guardianId: string) => void;
  onCall: (guardian: Guardian) => void;
  onSms: (guardian: Guardian) => void;
  onShareLocation: (guardian: Guardian) => void;
  onResendInvite: (guardian: Guardian) => void;
}

export function GuardianListItem({
  guardian,
  onEdit,
  onDelete,
  onCall,
  onSms,
  onShareLocation,
  onResendInvite,
}: GuardianListItemProps) {
  
  const getConsentStatusIndicator = () => {
    switch (guardian.consentStatus) {
      case 'Accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Pending':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      case 'Declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Not Sent':
        return <ShieldQuestion className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getOnlineStatusColor = () => {
    if (!guardian.onlineStatus) return "bg-gray-400";
    switch (guardian.onlineStatus) {
        case "Online": return "bg-green-500";
        case "Offline": return "bg-slate-400";
        case "Unknown": return "bg-yellow-400";
        default: return "bg-gray-400";
    }
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={guardian.photoUrl} alt={guardian.name} data-ai-hint="person photo" />
          <AvatarFallback>
            {guardian.name.substring(0, 2).toUpperCase() || <UserCircle />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl">{guardian.name}</CardTitle>
          <CardDescription className="text-sm">{guardian.relation} - Priority: {guardian.priority}</CardDescription>
          <p className="text-xs text-muted-foreground">{guardian.phone}</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center gap-1.5" title={`Consent: ${guardian.consentStatus}`}>
                {getConsentStatusIndicator()}
                <span className="text-xs text-muted-foreground hidden sm:inline">{guardian.consentStatus}</span>
            </div>
            {guardian.onlineStatus && (
                <div className="flex items-center gap-1.5" title={`Status: ${guardian.onlineStatus}${guardian.lastActive ? ` (${guardian.lastActive})` : ''}`}>
                    <span className={cn("h-2.5 w-2.5 rounded-full", getOnlineStatusColor())} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">{guardian.onlineStatus}</span>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="pb-3 text-xs space-y-1">
        {guardian.onlineStatus && guardian.lastActive && <p className="text-muted-foreground sm:hidden">Status: {guardian.onlineStatus} ({guardian.lastActive})</p>}
        {guardian.locationReceived !== undefined && (
            <p className={cn("text-muted-foreground", guardian.locationReceived ? "text-green-600" : "text-gray-500")}>
                Location Received: {guardian.locationReceived ? "Yes" : "No"} (Simulated)
            </p>
        )}
        {guardian.sosResponseAcknowledged !== undefined && (
            <p className={cn("text-muted-foreground", guardian.sosResponseAcknowledged ? "text-primary" : "text-gray-500")}>
                SOS Acknowledged: {guardian.sosResponseAcknowledged ? "Yes" : "No"} (Simulated)
            </p>
        )}

        {(guardian.consentStatus === 'Pending' || guardian.consentStatus === 'Declined' || guardian.consentStatus === 'Not Sent') && (
             <Button variant="link" size="sm" className="p-0 h-auto text-xs text-accent" onClick={() => onResendInvite(guardian)}>
                {guardian.consentStatus === 'Not Sent' ? 'Send Invite' : 'Resend Invite'}
            </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onCall(guardian)} title="Call Guardian">
                <Phone className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Call</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSms(guardian)} title="Send SMS">
                <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">SMS</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onShareLocation(guardian)} title="Share Location Now">
                <MapPin className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Share</span>
            </Button>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(guardian)} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit Guardian">
                <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(guardian.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Remove Guardian">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
