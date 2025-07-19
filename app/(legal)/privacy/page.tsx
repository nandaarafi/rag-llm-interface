import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for AI Chatbot',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy describes how we collect, use, and protect your personal information when you use our AI chatbot service ("Service"). 
          We are committed to protecting your privacy and ensuring the security of your personal data.
        </p>

        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Account Information</h3>
        <p>When you create an account, we collect:</p>
        <ul>
          <li>Email address</li>
          <li>Password (encrypted)</li>
          <li>Profile image (optional)</li>
          <li>Account preferences and settings</li>
        </ul>

        <h3>2.2 Usage Data</h3>
        <p>We automatically collect information about how you use our Service:</p>
        <ul>
          <li>Chat messages and conversations</li>
          <li>Documents and artifacts you create</li>
          <li>Usage patterns and feature interactions</li>
          <li>Device information and IP address</li>
          <li>Browser type and version</li>
          <li>Access times and duration</li>
        </ul>

        <h3>2.3 Payment Information</h3>
        <p>
          Payment processing is handled by LemonSqueezy. We store:
        </p>
        <ul>
          <li>Customer ID and subscription status</li>
          <li>Plan type and credit allocation</li>
          <li>Payment history and transaction records</li>
        </ul>
        <p>
          We do not store credit card numbers or sensitive payment information on our servers.
        </p>

        <h3>2.4 Authentication Data</h3>
        <p>When using third-party authentication (Google OAuth), we may receive:</p>
        <ul>
          <li>Basic profile information</li>
          <li>Email address</li>
          <li>Profile picture</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and maintain the Service</li>
          <li>Process your requests and generate AI responses</li>
          <li>Manage your account and subscriptions</li>
          <li>Send important updates and security notifications</li>
          <li>Improve our Service through analytics and usage patterns</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and ensure security</li>
        </ul>

        <h2>4. Information Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share your information in these situations:</p>
        
        <h3>4.1 Service Providers</h3>
        <ul>
          <li><strong>AI Model Providers:</strong> Google AI for generating responses</li>
          <li><strong>Payment Processing:</strong> LemonSqueezy for subscription management</li>
          <li><strong>Email Services:</strong> Resend for transactional emails</li>
          <li><strong>Database Hosting:</strong> Vercel Postgres for data storage</li>
          <li><strong>File Storage:</strong> UploadThing for file uploads</li>
        </ul>

        <h3>4.2 Legal Requirements</h3>
        <p>We may disclose your information if required by law or to:</p>
        <ul>
          <li>Comply with legal processes</li>
          <li>Protect our rights and property</li>
          <li>Ensure user safety</li>
          <li>Investigate potential violations</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We implement appropriate security measures to protect your information:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication systems</li>
          <li>Regular security assessments</li>
          <li>Access controls and monitoring</li>
          <li>Password hashing using industry standards</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>We retain your information for as long as necessary to:</p>
        <ul>
          <li>Provide the Service to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
          <li>Enforce our agreements</li>
        </ul>
        <p>
          You may request deletion of your account and associated data at any time, 
          subject to legal retention requirements.
        </p>

        <h2>7. Your Rights and Choices</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Objection:</strong> Object to certain processing activities</li>
          <li><strong>Restriction:</strong> Request limitation of processing</li>
        </ul>

        <h2>8. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain your session and preferences</li>
          <li>Provide authentication</li>
          <li>Analyze usage patterns</li>
          <li>Improve user experience</li>
        </ul>
        <p>You can control cookie settings through your browser preferences.</p>

        <h2>9. Third-Party Services</h2>
        <p>Our Service integrates with third-party services that have their own privacy policies:</p>
        <ul>
          <li><strong>Google AI:</strong> For AI model processing</li>
          <li><strong>Google OAuth:</strong> For authentication</li>
          <li><strong>LemonSqueezy:</strong> For payment processing</li>
          <li><strong>Resend:</strong> For email delivery</li>
          <li><strong>Vercel:</strong> For hosting and analytics</li>
        </ul>

        <h2>10. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. 
          We ensure appropriate safeguards are in place to protect your data during international transfers.
        </p>

        <h2>11. Children's Privacy</h2>
        <p>
          Our Service is not intended for children under 13 years of age. We do not knowingly collect 
          personal information from children under 13. If we become aware of such collection, 
          we will take steps to delete the information promptly.
        </p>

        <h2>12. California Privacy Rights</h2>
        <p>
          California residents have additional rights under the California Consumer Privacy Act (CCPA), 
          including the right to know, delete, and opt-out of the sale of personal information.
        </p>

        <h2>13. European Privacy Rights</h2>
        <p>
          If you are in the European Economic Area, you have rights under the General Data Protection Regulation (GDPR), 
          including the rights mentioned in Section 7 above.
        </p>

        <h2>14. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes 
          by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>15. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p>
          Email: [Your Privacy Contact Email]<br />
          Address: [Your Business Address]<br />
          Data Protection Officer: [If applicable]
        </p>

        <h2>16. Data Processing Lawful Basis</h2>
        <p>We process your personal data based on:</p>
        <ul>
          <li><strong>Contract:</strong> To provide the Service you've subscribed to</li>
          <li><strong>Legitimate Interest:</strong> To improve our Service and prevent fraud</li>
          <li><strong>Consent:</strong> For marketing communications (when applicable)</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
        </ul>

        <p className="text-sm text-muted-foreground mt-8">
          This document was last updated on {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}