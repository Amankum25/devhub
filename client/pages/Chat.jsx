import PagePlaceholder from '@/components/PagePlaceholder';

export default function Chat() {
  return (
    <PagePlaceholder
      title="Real-time Chat"
      description="Connect and collaborate with fellow developers"
      features={[
        'Real-time messaging (Socket.IO)',
        'Multiple chat rooms',
        'Online user indicators',
        'Emoji and file sharing',
        'Typing indicators',
        'Message history'
      ]}
    />
  );
}
