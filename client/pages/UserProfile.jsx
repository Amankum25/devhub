import PagePlaceholder from "@/components/PagePlaceholder";

export default function UserProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <PagePlaceholder
          title="User Profile"
          description="View other developers' profiles and their contributions"
          features={[
            "Read-only profile view",
            "Follow/unfollow functionality",
            "List of public posts/snippets",
            "Contact/message user",
            "View shared projects",
            "Activity timeline",
          ]}
        />
      </div>
    </div>
  );
}
