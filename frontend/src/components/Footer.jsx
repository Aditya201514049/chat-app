import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer style={{ 
      backgroundColor: 'var(--color-bg-footer)', 
      color: 'var(--color-text-secondary)',
      borderColor: 'var(--color-border-light)'
    }} className="p-4 text-center border-t">
      <div className="container mx-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} Chat App. All rights reserved.</p>
        <p className="text-xs mt-1">
          Built By <span style={{ color: 'var(--color-button-primary)' }}>Aditya Singha</span> Using <span style={{ color: 'var(--color-button-primary)' }}>MERN Stack</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
  