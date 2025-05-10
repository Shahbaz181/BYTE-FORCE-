import { DangerAlertsDisplay } from '@/components/features/danger-alerts/danger-alerts-display';
import { PageHeaderTitle } from '@/components/common/page-header-title';

export default function DangerAlertsPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeaderTitle 
        title="AI-Powered Danger Alerts"
        description="Stay informed about potential risks. Enter a location name to see AI-analyzed community incident reports."
      />
      <DangerAlertsDisplay />
    </div>
  );
}
