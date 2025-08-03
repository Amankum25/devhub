import PagePlaceholder from '@/components/PagePlaceholder';

export default function BlogPost() {
  return (
    <PagePlaceholder
      title="Blog Post View"
      description="Read and interact with blog posts"
      features={[
        'Full blog post display (Markdown support)',
        'Author information section',
        'Interactive comment system',
        'Social sharing buttons',
        'Like/bookmark functionality',
        'Related posts suggestions'
      ]}
    />
  );
}
