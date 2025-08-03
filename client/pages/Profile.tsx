import PagePlaceholder from '@/components/PagePlaceholder';

export default function Profile() {
  return (
    <PagePlaceholder
      title="My Profile"
      description="Manage your DevHub profile and showcase your work"
      features={[
        'Profile photo and personal info',
        'Bio and social links (GitHub, LinkedIn)',
        'Portfolio showcase',
        'List of authored posts/snippets',
        'Edit profile functionality',
        'Activity timeline'
      ]}
    />
  );
}
