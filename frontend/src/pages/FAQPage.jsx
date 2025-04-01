import React, { useState } from "react";

const FAQPage = () => {
  const faqs = [
    {
      question: "What is Chat App?",
      answer: "Chat App is a secure messaging platform that allows you to stay connected with friends, family, and colleagues through real-time conversations. Our platform offers end-to-end encryption, cross-platform support, and a user-friendly interface."
    },
    {
      question: "Is Chat App free to use?",
      answer: "Yes, Chat App is completely free for personal use. You can chat with an unlimited number of contacts and create as many conversations as you need without any fees or subscriptions."
    },
    {
      question: "How secure is Chat App?",
      answer: "Chat App employs industry-standard end-to-end encryption to ensure your messages stay private. This means that only you and the recipient can read the contents of your conversations. Even we cannot access your message content."
    },
    {
      question: "Can I use Chat App on multiple devices?",
      answer: "Yes, Chat App is designed to work seamlessly across multiple devices. Sign in with your account on any device, and your conversations will synchronize automatically. Currently, we support web browsers on desktop and mobile devices."
    },
    {
      question: "How do I add new contacts?",
      answer: "You can add new contacts by visiting the Friends page, where you can search for users by name. Once you find someone, simply click 'Create Chat' to start a conversation with them."
    },
    {
      question: "Are there group chat features?",
      answer: "Currently, Chat App focuses on one-on-one conversations. We're working on adding group chat functionality in a future update, which will allow you to create conversations with multiple participants."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account at any time from your profile settings. Please note that deleting your account will permanently remove all your conversations and personal data from our servers."
    },
    {
      question: "How do I report inappropriate behavior?",
      answer: "If you encounter inappropriate behavior, please contact our support team at support@chatapp.com with details about the incident. We take all reports seriously and will investigate promptly."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6" style={{ 
          background: 'linear-gradient(to right, var(--color-button-primary), var(--color-button-primary-hover))', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Frequently Asked Questions</h1>
        <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Find answers to common questions about Chat App.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="space-y-4 w-full">
          {faqs.map((faq, index) => (
            <div key={index} 
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: 'var(--color-border-light)' }}
            >
              <button 
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 py-3 flex justify-between items-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span className="text-xl font-medium">{faq.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-6 h-6 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              <div 
                className={`px-4 overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === index ? 'max-h-96 py-4' : 'max-h-0 py-0'
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="card shadow-lg max-w-3xl mx-auto mb-16 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Still have questions?</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            If you couldn't find the answer to your question, please feel free to reach out to our support team.
            We're here to help!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="mr-3" style={{ color: 'var(--color-button-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Email Support</h3>
                <a href="mailto:support@chatapp.com" style={{ color: 'var(--color-button-primary)' }} className="hover:underline">support@chatapp.com</a>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3" style={{ color: 'var(--color-button-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Live Chat</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Available Monday-Friday, 9am-5pm EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Help us improve</h2>
        <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Your feedback helps us make Chat App better for everyone. Let us know what you think!
        </p>
        <a href="/feedback" className="btn btn-primary" style={{ color: 'white' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Give Feedback
        </a>
      </div>
    </div>
  );
};

export default FAQPage; 