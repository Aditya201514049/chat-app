import React, { useState } from 'react';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    rating: 3,
    message: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        feedbackType: 'general',
        rating: 3,
        message: ''
      });
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Share Your Feedback</h1>
        <p className="text-xl max-w-3xl mx-auto text-base-content/70">
          Your feedback helps us improve Chat App for everyone. Let us know what you think!
        </p>
      </div>
      
      <div className="card bg-base-100 shadow-lg max-w-3xl mx-auto mb-16 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-base-content">Thank You for Your Feedback!</h2>
              <p className="text-base-content/80 mb-6">
                We appreciate your input and will use it to make Chat App better for you and all users.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => setSubmitted(false)}
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-base-content">How was your experience?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Your Name</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered w-full" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Your Email</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full" 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Feedback Type</span>
                </label>
                <select 
                  name="feedbackType" 
                  value={formData.feedbackType}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="performance">Performance Issue</option>
                  <option value="ui">User Interface</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rate Your Experience (1-5)</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button 
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      className={`btn btn-circle ${formData.rating === rating ? 'btn-primary' : 'btn-outline btn-primary'}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Feedback</span>
                </label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32" 
                  placeholder="Tell us what you think or suggest improvements..."
                  required
                ></textarea>
              </div>
              
              <div className="flex items-center mt-8">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary mr-3" 
                  required
                />
                <span className="text-base-content/80 text-sm">
                  I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </span>
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card bg-base-100 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="card-body">
            <h3 className="card-title text-lg text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              How We Use Your Feedback
            </h3>
            <p className="text-base-content/80">
              Your feedback is crucial in helping us prioritize new features, fix bugs, and improve the overall user experience. We review all submissions and use them to guide our development roadmap.
            </p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="card-body">
            <h3 className="card-title text-lg text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Report Urgent Issues
            </h3>
            <p className="text-base-content/80">
              For urgent issues or security concerns, please contact our support team directly at <a href="mailto:support@chatapp.com" className="text-primary hover:underline">support@chatapp.com</a> instead of using this form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage; 