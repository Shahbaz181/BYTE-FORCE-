import { LocationShareCard } from '@/components/features/location-sharing/location-share-card';
import { PageHeaderTitle } from '@/components/common/page-header-title';

export default function LocationSharingPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeaderTitle 
        title="Real-Time Location Sharing"
        description="Share your live location with trusted contacts for enhanced safety during your commute or outings."
      />
      <LocationShareCard />
    </div>
  );
}
