const Footer = () => {
    return (
      <footer className="bg-gray-300 text-base-content p-4 text-center border-t border-gray-300">
        <div className="container mx-auto">
          <p className="text-sm">&copy; {new Date().getFullYear()} Chat App. All rights reserved.</p>
          <p className="text-xs mt-1">
            Built with <span className="text-primary">MERN</span> & styled using <span className="text-primary">DaisyUI</span>
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  