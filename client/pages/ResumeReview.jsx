import PagePlaceholder from '@/components/PagePlaceholder';

export default function ResumeReview() {
  return (
    <PagePlaceholder
      title="AI Resume Reviewer"
      description="Get intelligent feedback on your resume"
      features={[
        'PDF resume upload functionality',
        'AI analysis of structure and content',
        'Skills gap identification',
        'Industry-specific recommendations',
        'Download improved suggestions',
        'Track review history'
      ]}
    />
  );
}
