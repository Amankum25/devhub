import PagePlaceholder from '@/components/PagePlaceholder';

export default function UserProfile() {
  return (
    <PagePlaceholder
      title="User Profile"
      description="View other developers' profiles and their contributions"
      features={[
        'Read-only profile view',
        'Follow/unfollow functionality',
        'List of public posts/snippets',
        'Contact/message user',
        'View shared projects',
        'Activity timeline'
      ]}
    />
  );
}
