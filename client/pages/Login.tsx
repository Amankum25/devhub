import PagePlaceholder from '@/components/PagePlaceholder';

export default function Login() {
  return (
    <PagePlaceholder
      title="Login"
      description="Secure authentication for DevHub users"
      features={[
        'Email/password authentication',
        'Google OAuth integration',
        'Forgot password functionality',
        'Remember me option',
        'Redirect to dashboard on success'
      ]}
    />
  );
}
