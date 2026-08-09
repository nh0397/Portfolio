import React, { useContext } from 'react';
import DarkModeToggle from 'react-dark-mode-toggle';
import { ThemeContext } from './ThemeContext';

const ThemeToggler = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <DarkModeToggle
      onChange={setDarkMode}
      checked={darkMode}
      size={50}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
};

export default ThemeToggler;
