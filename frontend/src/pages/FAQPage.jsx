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
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Frequently Asked Questions</h1>
        <p className="text-xl max-w-3xl mx-auto text-base-content/70">
          Find answers to common questions about Chat App.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="join join-vertical w-full">
          {faqs.map((faq, index) => (
            <div key={index} className="collapse collapse-arrow join-item border border-base-300">
              <input 
                type="radio" 
                name="faq-accordion" 
                checked={openIndex === index}
                onChange={() => toggleFAQ(index)}
              />
              <div className="collapse-title text-xl font-medium text-base-content">
                {faq.question}
              </div>
              <div className="collapse-content text-base-content/80">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="card bg-base-100 shadow-lg max-w-3xl mx-auto mb-16 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 text-base-content">Still have questions?</h2>
          <p className="text-base-content/80 mb-6">
            If you couldn't find the answer to your question, please feel free to reach out to our support team.
            We're here to help!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-base-content">Email Support</h3>
                <a href="mailto:support@chatapp.com" className="text-primary hover:underline">support@chatapp.com</a>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-base-content">Live Chat</h3>
                <p className="text-base-content/70">Available Monday-Friday, 9am-5pm EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4 text-base-content">Help us improve</h2>
        <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
          Your feedback helps us make Chat App better for everyone. Let us know what you think!
        </p>
        <a href="/feedback" className="btn btn-primary">
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