import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'account', name: 'Account Management' },
    { id: 'messaging', name: 'Messaging' },
    { id: 'privacy', name: 'Privacy & Security' },
    { id: 'troubleshooting', name: 'Troubleshooting' }
  ];
  
  const helpArticles = {
    'getting-started': [
      {
        id: 'gs-1',
        title: 'How to Create an Account',
        content: 'To create a new Chat App account, visit the registration page and enter your email, name, and a secure password. Follow the verification steps sent to your email to complete the process.'
      },
      {
        id: 'gs-2',
        title: 'Setting Up Your Profile',
        content: 'After creating your account, complete your profile by adding a profile picture, updating your display name, and setting your status message. This helps friends recognize you easily.'
      },
      {
        id: 'gs-3',
        title: 'Finding and Adding Friends',
        content: 'To find friends, use the search feature in the Friends page. Once you locate someone, click "Create Chat" to start a conversation with them.'
      }
    ],
    'account': [
      {
        id: 'ac-1',
        title: 'Updating Your Account Information',
        content: 'You can update your account information anytime from the Profile page. Click on the edit icons next to your name, email, or other details to make changes.'
      },
      {
        id: 'ac-2',
        title: 'Changing Your Password',
        content: 'To change your password, go to the Profile page, select Security, and click "Change Password." You\'ll need to enter your current password before setting a new one.'
      },
      {
        id: 'ac-3',
        title: 'Deleting Your Account',
        content: 'If you wish to delete your account, go to Profile > Settings > Delete Account. Please note this action is permanent and will remove all your conversations and data.'
      }
    ],
    'messaging': [
      {
        id: 'msg-1',
        title: 'Sending Messages',
        content: 'To send a message, open a conversation and type in the message field at the bottom. Press Enter or click the send button to deliver your message.'
      },
      {
        id: 'msg-2',
        title: 'Message Status Indicators',
        content: 'Chat App uses indicators to show message status: One check mark means sent, two check marks mean delivered, and blue check marks indicate the message has been read.'
      },
      {
        id: 'msg-3',
        title: 'Deleting Messages',
        content: 'To delete a message, hover over it and click the three dots icon, then select "Delete." You can choose to delete just for yourself or for everyone in the conversation.'
      }
    ],
    'privacy': [
      {
        id: 'prv-1',
        title: 'Understanding End-to-End Encryption',
        content: 'Chat App uses end-to-end encryption, meaning only you and the recipient can read your messages. Not even our team can access the content of your conversations.'
      },
      {
        id: 'prv-2',
        title: 'Managing Privacy Settings',
        content: 'Control who can see your profile information and contact you by adjusting your privacy settings in Profile > Privacy. Options include "Everyone," "Contacts Only," or "Nobody."'
      },
      {
        id: 'prv-3',
        title: 'Blocking Users',
        content: 'If you need to block someone, open your conversation with them, click the menu icon in the top right, and select "Block User." They won\'t be able to contact you afterward.'
      }
    ],
    'troubleshooting': [
      {
        id: 'tr-1',
        title: 'Connection Issues',
        content: 'If you\'re experiencing connection problems, try refreshing the page, checking your internet connection, clearing your browser cache, or trying a different browser.'
      },
      {
        id: 'tr-2',
        title: 'Messages Not Sending',
        content: 'If messages aren\'t sending, check your internet connection, refresh the app, or try logging out and back in to resolve the issue.'
      },
      {
        id: 'tr-3',
        title: 'Notifications Not Working',
        content: 'To fix notification issues, check your browser permissions, ensure notifications are enabled in your profile settings, and verify that your device is not in Do Not Disturb mode.'
      }
    ]
  };
  
  const filteredArticles = searchQuery ? 
    Object.values(helpArticles).flat().filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    helpArticles[activeCategory];
  
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Help Center</h1>
        <p className="text-xl max-w-3xl mx-auto text-base-content/70 mb-8">
          Find guides and answers to help you make the most of Chat App.
        </p>
        
        {/* Search Bar */}
        <div className="form-control max-w-md mx-auto">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Categories Sidebar */}
        {!searchQuery && (
          <div className="lg:w-1/4">
            <div className="card bg-base-100 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="card-body p-4">
                <h2 className="font-bold text-xl mb-4 text-base-content">Categories</h2>
                <ul className="menu bg-base-100 w-full p-0">
                  {categories.map(category => (
                    <li key={category.id} className={activeCategory === category.id ? "bordered" : ""}>
                      <a 
                        onClick={() => setActiveCategory(category.id)}
                        className={activeCategory === category.id ? "bg-primary/10 text-primary font-semibold" : ""}
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-lg mt-6 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="card-body p-4">
                <h2 className="font-bold text-xl mb-4 text-base-content">Need More Help?</h2>
                <p className="text-base-content/80 mb-4">
                  Can't find what you're looking for? Contact our support team directly.
                </p>
                <Link to="/contact" className="btn btn-primary btn-block">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Help Articles */}
        <div className={`${searchQuery ? "w-full" : "lg:w-3/4"}`}>
          <div className="card bg-base-100 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="card-body">
              {searchQuery ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-base-content">
                    Search Results for "{searchQuery}"
                  </h2>
                  {filteredArticles.length === 0 ? (
                    <div className="alert">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>No articles match your search. Try different keywords or <Link to="/contact" className="text-primary font-medium">contact support</Link>.</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredArticles.map(article => (
                        <div key={article.id} className="card bg-base-200">
                          <div className="card-body p-5">
                            <h3 className="card-title text-base-content">{article.title}</h3>
                            <p className="text-base-content/80">{article.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-base-content">
                    {categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <div className="space-y-6">
                    {helpArticles[activeCategory].map(article => (
                      <div key={article.id} className="card bg-base-200">
                        <div className="card-body p-5">
                          <h3 className="card-title text-base-content">{article.title}</h3>
                          <p className="text-base-content/80">{article.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* FAQ Link */}
          <div className="text-center mt-8">
            <p className="text-base-content/70 mb-4">
              Looking for quick answers to common questions?
            </p>
            <Link to="/faq" className="btn btn-outline btn-primary">
              Visit Our FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 