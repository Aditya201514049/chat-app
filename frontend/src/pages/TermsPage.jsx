import React from 'react';

const TermsPage = () => {
  const termsLastUpdated = "January 1, 2023";
  
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Terms of Service</h1>
        <p className="text-base-content/70">
          Last Updated: {termsLastUpdated}
        </p>
      </div>
      
      <div className="card bg-base-100 shadow-lg max-w-4xl mx-auto mb-16 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body prose max-w-none text-base-content/90">
          <p>
            Please read these Terms of Service ("Terms") carefully before using the Chat App ("Service") operated by Chat App Inc. ("us", "we", or "our").
          </p>
          
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>
          
          <p className="font-bold">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>
          
          <h2 className="text-xl font-bold mt-8">1. Communications</h2>
          <p>
            By creating an account on our service, you agree to receive communications from us, including but not limited to service-related emails, security alerts, and product updates. You can opt out of non-essential communications at any time.
          </p>
          
          <h2 className="text-xl font-bold mt-6">2. Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, images, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </p>
          
          <p>
            By posting Content on or through the Service, you represent and warrant that:
          </p>
          
          <ul>
            <li>The Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and</li>
            <li>That the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.</li>
          </ul>
          
          <p>
            We reserve the right to terminate the account of any user found to be infringing on a copyright or other intellectual property rights of others.
          </p>
          
          <h2 className="text-xl font-bold mt-6">3. Security</h2>
          <p>
            While we strive to protect your information through encryption and security measures, we cannot guarantee that unauthorized third parties will never be able to defeat our security measures. You acknowledge that you provide your personal information at your own risk.
          </p>
          
          <h2 className="text-xl font-bold mt-6">4. Account Requirements</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and up-to-date information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>
          
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-bold mt-6">5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Chat App Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Chat App Inc.
          </p>
          
          <h2 className="text-xl font-bold mt-6">6. Links To Other Websites</h2>
          <p>
            Our Service may contain links to third-party websites or services that are not owned or controlled by Chat App Inc.
          </p>
          
          <p>
            Chat App Inc. has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that Chat App Inc. shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
          </p>
          
          <h2 className="text-xl font-bold mt-6">7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          
          <p>
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or delete your account through the account settings.
          </p>
          
          <h2 className="text-xl font-bold mt-6">8. Limitation Of Liability</h2>
          <p>
            In no event shall Chat App Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          
          <ul>
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6">9. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>
          
          <h2 className="text-xl font-bold mt-6">10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
          
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
          
          <h2 className="text-xl font-bold mt-6">11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 