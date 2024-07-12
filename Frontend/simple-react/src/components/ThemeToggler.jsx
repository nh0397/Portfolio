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
    />
  );
};

export default ThemeToggler;
