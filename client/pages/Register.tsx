import PagePlaceholder from '@/components/PagePlaceholder';

export default function Register() {
  return (
    <PagePlaceholder
      title="Register"
      description="Join the DevHub community today"
      features={[
        'Full name, email, password registration',
        'GitHub/LinkedIn profile integration',
        'Avatar upload functionality',
        'Google OAuth registration',
        'Email verification system'
      ]}
    />
  );
}
