import PagePlaceholder from '@/components/PagePlaceholder';

export default function Settings() {
  return (
    <PagePlaceholder
      title="User Settings"
      description="Customize your DevHub experience"
      features={[
        'Password change functionality',
        'Theme toggle (light/dark mode)',
        'Notification preferences',
        'Privacy settings',
        'Account deletion option',
        'Data export tools'
      ]}
    />
  );
}
