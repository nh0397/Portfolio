import React from 'react';
import './Home.css';
import { motion } from 'framer-motion';
import photo from '../assets/MyPhoto.webp'

const Home = ({ data }) => {
  return (
    <section id="home" className="home-section">
      <div className="home-content">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0 }}
        >
          <h1 className="home-title">
            <p className='intro'>HI, I'M</p>
            <p className='name'>{data.name}</p>
            </h1>
          <h2>
            {data.bio}
          </h2>
        </motion.div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
           transition={{ duration: 1, delay: 1 }}
        >
          <img src={photo} alt={`Naisarg Halvadiya - ${data.name}`} className="home-photo"/>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
