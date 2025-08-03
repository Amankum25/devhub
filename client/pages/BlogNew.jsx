import PagePlaceholder from "@/components/PagePlaceholder";

export default function BlogNew() {
  return (
    <PagePlaceholder
      title="Create New Post"
      description="Share your knowledge with the community"
      features={[
        "Rich text editor with Markdown support",
        "Code syntax highlighting (ACE editor)",
        "Title, tags, and cover image upload",
        "Save as draft functionality",
        "Live preview mode",
        "SEO optimization tools",
      ]}
    />
  );
}
