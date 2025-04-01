import React from 'react';

const PrivacyPage = () => {
  const privacyLastUpdated = "January 1, 2023";
  
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Privacy Policy</h1>
        <p className="text-base-content/70">
          Last Updated: {privacyLastUpdated}
        </p>
      </div>
      
      <div className="card bg-base-100 shadow-lg max-w-4xl mx-auto mb-16 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body prose max-w-none text-base-content/90">
          <p>
            Chat App Inc. ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chat App service ("Service").
          </p>
          
          <p>
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
          </p>
          
          <h2 className="text-xl font-bold mt-8">1. Information We Collect</h2>
          
          <h3 className="text-lg font-bold mt-4">Personal Data</h3>
          <p>
            We collect information such as your name, email address, profile picture, and optional details you choose to provide.
          </p>
          
          <h3 className="text-lg font-bold mt-4">Usage Data</h3>
          <p>
            We collect data on how you use our service, including IP address, browser information, pages visited, and time spent.
          </p>
          
          <h3 className="text-lg font-bold mt-4">Message Content</h3>
          <p>
            Your messages are encrypted end-to-end. We cannot read message content, but we store metadata such as sender/recipient information and timestamps.
          </p>
          
          <h2 className="text-xl font-bold mt-6">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve our service, send notifications, offer support, detect issues, and send relevant offers and updates.
          </p>
          
          <h2 className="text-xl font-bold mt-6">3. Data Security</h2>
          <p>
            We implement strong security measures including end-to-end encryption, secure password storage, and regular security audits, but no internet-based service can guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-bold mt-6">4. Data Retention</h2>
          <p>
            We retain your data as long as necessary to provide the service or comply with legal obligations. You can request deletion of your account and associated data at any time.
          </p>
          
          <h2 className="text-xl font-bold mt-6">5. Sharing Your Information</h2>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li>Service providers who help us operate our platform</li>
            <li>Legal authorities when required by law</li>
            <li>Other parties with your explicit consent</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6">6. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to:
          </p>
          <ul>
            <li>Access and receive a copy of your data</li>
            <li>Correct or delete your personal information</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6">7. Children's Privacy</h2>
          <p>
            Our service is not intended for anyone under 13 years of age. We do not knowingly collect data from children under 13.
          </p>
          
          <h2 className="text-xl font-bold mt-6">8. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy periodically. We will notify you of any significant changes via email or prominently on our service.
          </p>
          
          <h2 className="text-xl font-bold mt-6">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 