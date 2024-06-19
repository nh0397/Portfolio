import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const fetchPortfolioData = async () => {
  try {
    const response = await fetch('./assets/data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return null;
  }
};

fetchPortfolioData().then(portfolioData => {
  ReactDOM.render(
    <React.StrictMode>
      <App portfolioData={portfolioData} />
    </React.StrictMode>,
    document.getElementById('root')
  );
});

reportWebVitals();
