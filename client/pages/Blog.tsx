import PagePlaceholder from '@/components/PagePlaceholder';

export default function Blog() {
  return (
    <PagePlaceholder
      title="Developer Blog"
      description="Discover and share knowledge with the community"
      features={[
        'Post cards with title, snippet, tags, author',
        'Filter by tags, date, popularity',
        'Advanced search functionality',
        'Bookmark posts',
        'Reading time estimates',
        'Comment system'
      ]}
    />
  );
}
