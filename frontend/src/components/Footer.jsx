const Footer = () => {
    return (
      <footer className="bg-gray-300 text-base-content p-4 text-center border-t border-gray-300">
        <div className="container mx-auto">
          <p className="text-sm">&copy; {new Date().getFullYear()} Chat App. All rights reserved.</p>
          <p className="text-xs mt-1">
            Built By <span className="text-primary">Aditya Singha</span> Using <span className="text-primary">MERN Stack</span>
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  