import { GuardianAngelPanel } from '@/components/features/guardian-angel/guardian-angel-panel';
import { PageHeaderTitle } from '@/components/common/page-header-title';

export default function GuardianAngelPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeaderTitle 
        title="Guardian Angel Mode"
        description="Activate enhanced monitoring when you feel uneasy. This feature uses AI to analyze your audio and location for signs of distress."
      />
      <GuardianAngelPanel />
    </div>
  );
}
