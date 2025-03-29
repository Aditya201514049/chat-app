import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

// Custom hook for using theme
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check for saved theme preference or default to system preference
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };
  
  const [theme, setTheme] = useState(getSavedTheme);
  
  // Apply theme to html element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes first
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add the current theme class
    root.classList.add(`${theme}-theme`);
    
    // Store the theme preference
    localStorage.setItem('theme', theme);
    
    // Debug output
    console.log(`Theme set to: ${theme}`, root.classList);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only change if user hasn't set a manual preference
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Add event listener
    try {
      // Try the modern approach first
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log(`Toggle theme from ${prevTheme} to ${newTheme}`);
      return newTheme;
    });
  };
  
  // Set theme explicitly
  const setThemeExplicitly = (newTheme) => {
    console.log(`Explicitly setting theme to: ${newTheme}`);
    setTheme(newTheme);
  };
  
  const clearThemePreference = () => {
    localStorage.removeItem('theme');
    // Reset to system preference
    const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    console.log(`Clearing theme preference, resetting to system theme: ${systemTheme}`);
    setTheme(systemTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeExplicitly, clearThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}; 