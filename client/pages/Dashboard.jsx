import PagePlaceholder from '@/components/PagePlaceholder';

export default function Dashboard() {
  return (
    <PagePlaceholder
      title="User Dashboard"
      description="Your personal DevHub command center"
      features={[
        'Stats cards: posts, AI calls, messages',
        'Recent activity widget',
        'AI Assistant quick access',
        'Profile progress tracking',
        'Achievement system',
        'Quick action buttons'
      ]}
    />
  );
}
