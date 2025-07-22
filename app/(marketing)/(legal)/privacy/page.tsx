import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mindscribe',
  // description: 'Privacy Policy for AI Chatbot',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       {/* <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link> */}
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>Introduction</h2>
        <p>
          At <strong>Mindscribe</strong>, we are committed to protecting your privacy and being transparent about how we collect and use your information. This Privacy Policy explains our practices regarding your personal data when you use our AI agent platform that generates PPTs, reports, documents, and other intelligent content.
        </p>

        <h2>Information We Collect</h2>
        
        <h3>Personal Data</h3>
        <p>We collect the following personal information:</p>
        <ul>
          <li><strong>Name:</strong> To personalize your experience</li>
          <li><strong>Email address:</strong> For account management and communication</li>
          <li><strong>Payment information:</strong> Credit card details and billing address (processed securely by our payment processor)</li>
        </ul>

        <h3>Usage Data</h3>
        <p>We automatically collect non-personal data including:</p>
        <ul>
          <li><strong>Web cookies:</strong> For website functionality and analytics</li>
          <li>Usage patterns and interactions with our service</li>
          <li>Device information and browser type</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use your information for the following specific purposes:</p>
        <ul>
          <li><strong>Process orders and payments:</strong> To complete transactions and manage subscriptions</li>
          <li><strong>Manage user accounts:</strong> To provide account access and personalized features</li>
          <li><strong>Improve our service:</strong> To enhance functionality and user experience</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Send important service updates and notifications</li>
        </ul>

        <h2>Data Sharing and Third Parties</h2>
        <p>
          We do <strong>not</strong> sell or share your data with third parties for marketing purposes. However, we do share your information with trusted service providers who help us operate our service:
        </p>
        <ul>
          <li><strong>Payment processors:</strong> To securely process your payments and manage transactions</li>
          <li><strong>AI service providers:</strong> To generate responses and create documents</li>
          <li><strong>Email service providers:</strong> To send you important account and service notifications</li>
          <li><strong>Cloud hosting providers:</strong> To store and secure your data</li>
        </ul>
        <p>
          These service providers are contractually required to protect your information and use it only for the specific services they provide to us.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information, including encryption, secure authentication, and regular security assessments. While no method of transmission over the internet is 100% secure, we strive to use commercially acceptable means to protect your data.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. When we make material changes, we will notify you via email at the address associated with your account and update the "Last updated" date above.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@mindscribe.xyz" className="text-primary hover:underline">support@mindscribe.xyz</a>
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          This Privacy Policy is effective as of the date listed above and governs your use of our service.
        </p>
      </div>
    </div>
  );
}