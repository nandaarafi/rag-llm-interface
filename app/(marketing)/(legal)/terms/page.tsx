import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Mindscribe',
  // canonicalUrlRelative: '/terms',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       <Link 
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
        </Link>
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this AI chatbot service ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to abide by the above, please do not use this Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Our Service provides an AI-powered chatbot platform that allows users to interact with artificial intelligence models for various purposes including:
        </p>
        <ul>
          <li>General conversation and assistance</li>
          <li>Code generation and programming help</li>
          <li>Document creation and editing</li>
          <li>Data analysis and visualization</li>
          <li>Creative content generation including presentations</li>
        </ul>

        <h2>3. User Accounts</h2>
        <p>
          To access certain features of the Service, you may be required to create an account. You are responsible for:
        </p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and complete information</li>
          <li>Promptly updating your account information</li>
        </ul>

        <h2>4. Payment Terms</h2>
        <p>
          Our Service operates on a credit-based system with the following plans:
        </p>
        <ul>
          <li><strong>Free Plan:</strong> 3 credits with daily reset</li>
          <li><strong>Pro Plan:</strong> Enhanced credit allocation via subscription</li>
          <li><strong>Ultra Plan:</strong> Premium credit allocation via subscription</li>
        </ul>
        <p>
          Payments are processed through LemonSqueezy. All fees are non-refundable except as required by law. 
          Subscription plans will automatically renew unless cancelled before the renewal date.
        </p>

        <h2>5. Acceptable Use Policy</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Generate harmful, abusive, or illegal content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Attempt to reverse engineer or compromise the Service</li>
          <li>Use the Service for commercial purposes beyond your subscription limits</li>
          <li>Generate spam or unsolicited content</li>
          <li>Impersonate others or provide false information</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          You retain ownership of content you create using the Service. However, you grant us a limited license to:
        </p>
        <ul>
          <li>Process and store your content to provide the Service</li>
          <li>Use anonymized and aggregated data to improve our Service</li>
        </ul>
        <p>
          The Service itself, including all software, algorithms, and proprietary technology, remains our property.
        </p>

        <h2>7. Privacy and Data Protection</h2>
        <p>
          Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
          which is incorporated into these Terms by reference.
        </p>

        <h2>8. Service Availability</h2>
        <p>
          We strive to maintain high availability but do not guarantee uninterrupted access to the Service. 
          We may modify, suspend, or discontinue the Service at any time with reasonable notice.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, 
          DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
          FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>

        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from 
          your use of the Service or violation of these Terms.
        </p>

        <h2>12. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice, for conduct that we believe 
          violates these Terms or is harmful to other users, us, or third parties.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
          without regard to its conflict of law provisions.
        </p>

        <h2>14. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of significant changes 
          via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
        </p>

        <h2>15. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          Email: [Your Contact Email]<br />
          Address: [Your Business Address]
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          This document was last updated on {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}