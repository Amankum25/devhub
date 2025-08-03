import PagePlaceholder from "@/components/PagePlaceholder";

export default function BlogEdit() {
  return (
    <PagePlaceholder
      title="Edit Post"
      description="Update and manage your blog posts"
      features={[
        "Pre-filled editor with existing content",
        "Update, save as draft, or delete options",
        "Version history tracking",
        "Preview changes",
        "SEO settings management",
        "Publish/unpublish controls",
      ]}
    />
  );
}
