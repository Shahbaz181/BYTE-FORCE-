// src/types/guardian.ts
export type ConsentStatus = 'Pending' | 'Accepted' | 'Declined' | 'Not Sent';
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;
export type GuardianOnlineStatus = 'Online' | 'Offline' | 'Unknown';

export const MAX_GUARDIANS = 5;

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: PriorityLevel;
  photoUrl?: string; // URL to the photo
  consentStatus: ConsentStatus;
  // Mocked fields for live status - these would typically come from a backend
  onlineStatus?: GuardianOnlineStatus;
  lastActive?: string; // e.g., "5m ago", "Today 2:30 PM"
  locationReceived?: boolean;
  sosResponseAcknowledged?: boolean; // Guardian has seen/acknowledged an SOS
}

export const PRIORITY_LEVELS: PriorityLevel[] = [1, 2, 3, 4, 5];
export const RELATION_SUGGESTIONS = [
  "Mother", "Father", "Sibling", "Spouse", "Partner", "Friend", "Relative", "Neighbor", "Colleague", "Other"
];
