import React from 'react';
import './Home.css';

const Home = ({ data }) => {
  return (
    <section id="home" className="home-section">
      <div className="home-content">
        <h1 className="home-title">{data.name}</h1>
        <p className="home-subtitle">{data.bio}</p>
        <a href="#about" className="home-button">Learn More</a>
      </div>
    </section>
  );
};

export default Home;
