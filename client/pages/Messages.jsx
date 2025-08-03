import PagePlaceholder from '@/components/PagePlaceholder';

export default function Messages() {
  return (
    <PagePlaceholder
      title="Private Messages"
      description="Manage your direct messages and conversations"
      features={[
        'Recent 1-on-1 chat list',
        'Direct message interface',
        'Message search functionality',
        'Notification badges',
        'File sharing capabilities',
        'Message archiving'
      ]}
    />
  );
}
