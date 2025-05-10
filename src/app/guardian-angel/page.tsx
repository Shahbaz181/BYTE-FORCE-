import { GuardianAngelPanel } from '@/components/features/guardian-angel/guardian-angel-panel';
import { PageHeaderTitle } from '@/components/common/page-header-title';

export default function GuardianAngelPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeaderTitle 
        title="Guardian Angel Mode"
        description="Feeling uneasy? Describe your situation, and our AI will provide an assessment and safety tips."
      />
      <GuardianAngelPanel />
    </div>
  );
}
