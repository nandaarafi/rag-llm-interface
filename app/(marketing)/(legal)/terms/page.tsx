import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Mindscribe',
  // canonicalUrlRelative: '/terms',
};

export default function TermsOfService() {
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
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acknowledgment</h2>
        <p>
          By accessing or using the Mindscribe service operated by us, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use our Service.
        </p>

        <h2>2. Definitions</h2>
        <p>For the purposes of these Terms:</p>
        <ul>
          <li><strong>"Company"</strong> (referred to as "we", "us", or "our") refers to the operator of Mindscribe</li>
          <li><strong>"Service"</strong> refers to the Mindscribe website and AI functionalities available at https://mindscribe.xyz</li>
          <li><strong>"Website"</strong> refers to https://mindscribe.xyz</li>
          <li><strong>"You"</strong> refers to the individual user accessing or using the Service</li>
        </ul>

        <h2>3. User Accounts</h2>
        <p>
          To use our Service, you must create an account by providing accurate and complete information, including your name and email address. You are responsible for all activities under your account and must keep your password confidential. You must notify us immediately of any unauthorized use of your account.
        </p>

        <h2>4. Refund Policy</h2>
        <p><strong>Eligibility:</strong> Refunds may be considered within 14 days of a credit package purchase, provided there has been minimal or no usage of the credits (less than 10% of purchased credits used). Refunds are also available for technical issues caused by the Company that cannot be resolved, or for accidental duplicate purchases.</p>
        <p><strong>Request Process:</strong> To request a refund, email <a href="mailto:support@mindscribe.xyz?subject=Refund Request" className="text-primary hover:underline">support@mindscribe.xyz</a> with the subject "Refund Request" and include your account details and reason for the request.</p>
        <p><strong>Non-Refundable Cases:</strong> Refunds are not available for partially used credit packages (more than 10% used), promotional offers, or if an account is terminated due to violation of these Terms.</p>

        <h2>5. User Data and Privacy</h2>
        <p>
          We collect personal data such as your name, email, and payment information to provide our Service. We also use non-personal data like web cookies for functionality and analytics. Your privacy is important to us, and our collection and use of personal information is governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is an integral part of these Terms.
        </p>

        <h2>6. Prohibited Activities</h2>
        <p>You agree not to use the Service for:</p>
        <ul>
          <li>Illegal activities or violations of applicable laws</li>
          <li>Attempting to reverse-engineer or compromise the Service</li>
          <li>Infringing on intellectual property rights of others</li>
          <li>Distributing harmful, abusive, or malicious content</li>
          <li>Generating spam or unsolicited communications</li>
          <li>Impersonating others or providing false information</li>
        </ul>

        <h2>7. Termination</h2>
        <p>
          The Company reserves the right to terminate or suspend your account immediately, without prior notice, for any reason, especially for breach of these Terms. Upon termination, your right to use the Service will cease immediately.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, or consequential damages. Our total liability to you shall not exceed the amount you paid to us in the last 12 months or $100, whichever is greater.
        </p>

        <h2>9. "AS IS" and "AS AVAILABLE" Disclaimer</h2>
        <p>
          The Service is provided "AS IS" and "AS AVAILABLE" without any warranties. The Company does not guarantee that the service will be error-free, uninterrupted, or that generated outputs will always be accurate or meet your specific needs.
        </p>

        <h2>10. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Users will be notified of material changes via the email address associated with their account. Continued use of the service after changes become effective constitutes acceptance of the new terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws applicable to our location. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in our location.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, you can contact us by email: <a href="mailto:support@mindscribe.xyz" className="text-primary hover:underline">support@mindscribe.xyz</a>
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          This document was last updated on {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}