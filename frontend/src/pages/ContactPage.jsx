import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset success message after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
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
        }}>
          Contact Us
        </h1>
        <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card shadow-lg" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4" style={{ color: 'var(--color-button-primary)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Email Us</h3>
                    <a href="mailto:support@chatapp.com" style={{ color: 'var(--color-button-primary)' }} className="hover:underline">support@chatapp.com</a>
                    <p style={{ color: 'var(--color-text-secondary)' }}>We'll respond as soon as possible</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4" style={{ color: 'var(--color-button-primary)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Call Us</h3>
                    <a href="tel:+18001234567" style={{ color: 'var(--color-button-primary)' }} className="hover:underline">+1 (800) 123-4567</a>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4" style={{ color: 'var(--color-button-primary)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Live Chat</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Available during business hours</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mt-8 mb-4" style={{ color: 'var(--color-text-primary)' }}>Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="btn btn-circle btn-sm btn-ghost" style={{ color: 'var(--color-text-primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                </a>
                <a href="#" className="btn btn-circle btn-sm btn-ghost" style={{ color: 'var(--color-text-primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
                </a>
                <a href="#" className="btn btn-circle btn-sm btn-ghost" style={{ color: 'var(--color-text-primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                </a>
                <a href="#" className="btn btn-circle btn-sm btn-ghost" style={{ color: 'var(--color-text-primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* FAQs Preview */}
          <div className="card shadow-lg" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Frequently Asked Questions</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Check out our FAQ page for quick answers to common questions.
              </p>
              <a href="/faq" className="btn btn-outline" style={{ color: 'var(--color-button-primary)', borderColor: 'var(--color-button-primary)' }}>View FAQs</a>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="card shadow-lg" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Send Us a Message</h2>
              
              {submitSuccess ? (
                <div className="alert alert-success shadow-lg mb-6">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Your message has been sent successfully!</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text" style={{ color: 'var(--color-text-primary)' }}>Name</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-light)' }}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text" style={{ color: 'var(--color-text-primary)' }}>Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="input input-bordered w-full"
                        style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-light)' }}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text" style={{ color: 'var(--color-text-primary)' }}>Subject</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="input input-bordered w-full"
                      style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-light)' }}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text" style={{ color: 'var(--color-text-primary)' }}>Message</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="textarea textarea-bordered h-40"
                      style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-light)' }}
                      required
                    ></textarea>
                  </div>
                  <div className="form-control mt-6">
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting}
                      style={{ color: 'white' }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 