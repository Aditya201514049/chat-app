import React from "react";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">About Chat App</h1>
        <p className="text-xl max-w-3xl mx-auto text-base-content/70">
          A modern messaging platform designed to keep you connected with the people who matter most.
        </p>
      </div>

      {/* Mission Section */}
      <div className="card bg-base-100 shadow-lg mb-16 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 text-base-content">Our Mission</h2>
          <p className="text-base-content/80 mb-4">
            At Chat App, we believe communication should be seamless, secure, and enjoyable. 
            Our mission is to build technology that brings people closer together, regardless of distance or time zones.
          </p>
          <p className="text-base-content/80">
            We're committed to providing a platform that respects your privacy while offering the features you need 
            to stay connected with friends, family, and colleagues.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <h2 className="text-2xl font-bold mb-8 text-center text-base-content">Why Choose Chat App?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="card-title text-base-content">Secure Messaging</h3>
            <p className="text-base-content/70">
              End-to-end encryption ensures your conversations remain private and secure.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="text-secondary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="card-title text-base-content">Real-time Conversations</h3>
            <p className="text-base-content/70">
              Chat in real-time with instant message delivery and typing indicators.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="text-accent mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="card-title text-base-content">Cross-platform Support</h3>
            <p className="text-base-content/70">
              Use Chat App on any device with a consistent experience across web and mobile.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-base-content">Our Team</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="card w-80 bg-base-100 shadow-md">
            <figure className="px-10 pt-10">
              <div className="avatar">
                <div className="w-32 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-4xl font-bold">
                  AS
                </div>
              </div>
            </figure>
            <div className="card-body items-center text-center">
              <h3 className="card-title text-base-content">Aditya Singha</h3>
              <p className="text-primary font-medium">Founder & Lead Developer</p>
              <p className="text-base-content/70">
                Full-stack developer with a passion for building intuitive user experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card bg-base-100 shadow-lg mb-16">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Our Technology Stack</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
                  <path d="M12 21.985c-.275 0-.532-.074-.772-.202l-2.439-1.448c-.365-.203-.182-.277-.072-.314.496-.165.588-.201 1.101-.493.056-.037.129-.02.185.017l1.87 1.12c.074.036.166.036.221 0l7.319-4.237c.074-.036.11-.11.11-.202V7.768c0-.091-.036-.165-.11-.201l-7.319-4.219c-.073-.037-.165-.037-.221 0L4.552 7.566c-.073.036-.11.129-.11.201v8.457c0 .073.037.166.11.202l2 1.157c1.082.548 1.762-.095 1.762-.735V8.502c0-.11.091-.221.22-.221h.936c.108 0 .22.092.22.221v8.347c0 1.449-.788 2.294-2.164 2.294-.422 0-.752 0-1.688-.46l-1.925-1.099a1.55 1.55 0 0 1-.771-1.34V7.786c0-.55.293-1.064.771-1.339l7.316-4.237a1.637 1.637 0 0 1 1.544 0l7.317 4.237c.479.274.771.789.771 1.339v8.458c0 .549-.293 1.063-.771 1.34l-7.317 4.236c-.241.11-.516.165-.773.165zm2.256-5.816c-3.21 0-3.87-1.468-3.87-2.714 0-.11.092-.221.22-.221h.954c.11 0 .201.073.201.184.147.971.568 1.449 2.514 1.449 1.54 0 2.202-.35 2.202-1.175 0-.477-.183-.824-2.587-1.063-2.006-.183-3.246-.643-3.246-2.238 0-1.485 1.247-2.366 3.339-2.366 2.347 0 3.503.809 3.649 2.568a.214.214 0 0 1-.055.164.233.233 0 0 1-.147.055h-.964a.22.22 0 0 1-.201-.165c-.22-1.01-.789-1.321-2.281-1.321-1.688 0-1.872.587-1.872 1.027 0 .531.237.696 2.514.99 2.256.292 3.32.715 3.32 2.294-.018 1.615-1.339 2.531-3.69 2.531z" />
                </svg>
              </div>
              <span className="text-base-content font-medium">Node.js</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
                  <path d="M24 18.588a1.529 1.529 0 0 1-1.543 1.5c-.473 0-.935-.162-1.299-.483l-8.324-7.226a.48.48 0 0 1-.126-.429.48.48 0 0 1 .272-.34l5.03-2.446.19.183-.009-.009c.16.16.45.246.687.247h.006a1.084 1.084 0 0 0 .371-.073l.058.06-.06-.053a1.113 1.113 0 0 0 .647-1.164.903.903 0 0 0-.116-.323c-.103-.19-.232-.37-.38-.54l-1.143-1.319a1.596 1.596 0 0 0-.487-.412 1.481 1.481 0 0 0-.377-.128c-.026-.006-.052-.01-.079-.014a1.498 1.498 0 0 0-.535.064l-5.397 2.61c-.326.159-.57.48-.57.886 0 .465.284.848.682.995l8.17 7.089c.336.29.504.733.493 1.192" />
                  <path d="M23.43 11.279a1.113 1.113 0 0 0-.288-.434l-8.299-8.29a1.565 1.565 0 0 0-2.217 0L8.389 6.799a1.56 1.56 0 0 0 0 2.207l8.298 8.29c.315.316.8.37 1.165.134l.093-.08a1.084 1.084 0 0 0 .513-.615c.064-.232.055-.485-.036-.719l-5.894-9.003c-.219-.32-.227-.771 0-1.096a.794.794 0 0 1 1.112 0l5.454 8.442c.274.418.738.591 1.17.485.314-.075.567-.316.662-.625.096-.309.022-.63-.204-.864l-5.562-8.556c-.301-.466-.316-1.088 0-1.558.317-.47.918-.463 1.215 0l5.69 8.747c.384.58 1.055.772 1.61.456.401-.228.662-.666.662-1.131 0-.119-.013-.235-.039-.353" />
                </svg>
              </div>
              <span className="text-base-content font-medium">Express</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
                  <path d="M12 9.861a2.139 2.139 0 1 0 0 4.278 2.139 2.139 0 1 0 0-4.278zm-5.992 6.394l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zm12.675 7.305l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zm9.589 20.362c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zm5.984.628c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z" />
                </svg>
              </div>
              <span className="text-base-content font-medium">React</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
                  <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" />
                </svg>
              </div>
              <span className="text-base-content font-medium">MongoDB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4 text-base-content">Ready to get started?</h2>
        <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
          Join thousands of users who are already enjoying the benefits of our secure messaging platform.
        </p>
        <button className="btn btn-primary btn-lg">Sign Up Now</button>
      </div>
    </div>
  );
};

export default AboutPage; 