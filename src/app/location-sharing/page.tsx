import { StandaloneAddContactForm } from '@/components/features/contacts/standalone-add-contact-form';
import { PageHeaderTitle } from '@/components/common/page-header-title';

export default function AddContactsPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeaderTitle 
        title="Add Emergency Contact"
        description="Enter the name and phone number of your trusted contact."
      />
      <StandaloneAddContactForm />
    </div>
  );
}
