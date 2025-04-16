import React, { useRef, useState, useEffect } from 'react';
import './CubeCanvas.css';

const Cube = ({ isDarkMode, icons = [], names = [] }) => {
  const cubeRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 45, y: 45, z: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredFace, setHoveredFace] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef(null);
  const speedRef = useRef({ x: 0.2, y: 0.3, z: 0.1 });
  const nextChangeRef = useRef(Date.now() + Math.random() * 5000);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Colors for the cube faces
  const colors = isDarkMode
    ? ['#1e1e1e', '#2a2a2a', '#353535', '#404040', '#454545', '#505050']
    : ['#f2f2f2', '#e6e6e6', '#d9d9d9', '#cccccc', '#bfbfbf', '#b3b3b3'];

  // Handle mouse movement to rotate the cube
  const handleMouseMove = (e) => {
    if (!autoRotate && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const deltaX = x - lastMousePos.current.x;
      const deltaY = y - lastMousePos.current.y;
      
      setRotation(prev => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
        z: prev.z
      }));
      
      lastMousePos.current = { x, y };
    }
  };

  // Handle mouse enter - stop auto rotation and save current mouse position
  const handleMouseEnter = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      lastMousePos.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    }
    setAutoRotate(false);
  };

  // Handle mouse leave - resume auto rotation
  const handleMouseLeave = () => {
    setAutoRotate(true);
    setHoveredFace(null);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    if (containerRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      lastMousePos.current = { 
        x: touch.clientX - rect.left, 
        y: touch.clientY - rect.top 
      };
      setAutoRotate(false);
    }
  };

  const handleTouchMove = (e) => {
    if (!autoRotate && containerRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const deltaX = x - lastMousePos.current.x;
      const deltaY = y - lastMousePos.current.y;
      
      setRotation(prev => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
        z: prev.z
      }));
      
      lastMousePos.current = { x, y };
      
      // Prevent page scrolling when manipulating the cube
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setAutoRotate(true);
    setHoveredFace(null);
  };

  useEffect(() => {
    const updateRotation = () => {
      if (autoRotate) {
        // Check if it's time to change rotation direction
        if (Date.now() > nextChangeRef.current) {
          speedRef.current = {
            x: (Math.random() * 0.4 - 0.2),
            y: (Math.random() * 0.4 - 0.2),
            z: (Math.random() * 0.2 - 0.1) // Reduced Z rotation for better visibility
          };
          nextChangeRef.current = Date.now() + 2000 + Math.random() * 5000;
        }

        setRotation(prev => ({
          x: (prev.x + speedRef.current.x) % 360,
          y: (prev.y + speedRef.current.y) % 360,
          z: (prev.z + speedRef.current.z) % 360
        }));
      }
      
      animationRef.current = requestAnimationFrame(updateRotation);
    };

    animationRef.current = requestAnimationFrame(updateRotation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate]);

  // Calculate face dimensions based on device size
  const getBaseSize = () => {
    if (window.innerWidth <= 480) return 45;
    if (window.innerWidth <= 768) return 60;
    return 75;
  };

  const baseSize = getBaseSize();
  const translateZ = baseSize / 2;

  // Create a placeholder array of 6 items for the faces
  const facesData = Array(6).fill(null).map((_, index) => {
    return {
      color: colors[index],
      icon: icons[index] || null,
      name: names[index] || `Face ${index + 1}`
    };
  });

  return (
    <div 
      ref={containerRef}
      className="cube-container-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={cubeRef} 
        className="cube-wrapper"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
        }}
      >
        {/* Front face */}
        <div 
          className={`cube-face ${hoveredFace === 0 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[0].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateY(0deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(0)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[0].icon && (
            <>
              <img 
                src={facesData[0].icon} 
                alt={facesData[0].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 0 && (
                <div className="skill-name-tooltip">{facesData[0].name}</div>
              )}
            </>
          )}
        </div>

        {/* Back face */}
        <div 
          className={`cube-face ${hoveredFace === 1 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[1].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateY(180deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(1)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[1].icon && (
            <>
              <img 
                src={facesData[1].icon} 
                alt={facesData[1].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 1 && (
                <div className="skill-name-tooltip">{facesData[1].name}</div>
              )}
            </>
          )}
        </div>

        {/* Right face */}
        <div 
          className={`cube-face ${hoveredFace === 2 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[2].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateY(90deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(2)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[2].icon && (
            <>
              <img 
                src={facesData[2].icon} 
                alt={facesData[2].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 2 && (
                <div className="skill-name-tooltip">{facesData[2].name}</div>
              )}
            </>
          )}
        </div>

        {/* Left face */}
        <div 
          className={`cube-face ${hoveredFace === 3 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[3].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateY(-90deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(3)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[3].icon && (
            <>
              <img 
                src={facesData[3].icon} 
                alt={facesData[3].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 3 && (
                <div className="skill-name-tooltip">{facesData[3].name}</div>
              )}
            </>
          )}
        </div>

        {/* Top face */}
        <div 
          className={`cube-face ${hoveredFace === 4 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[4].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateX(90deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(4)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[4].icon && (
            <>
              <img 
                src={facesData[4].icon} 
                alt={facesData[4].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 4 && (
                <div className="skill-name-tooltip">{facesData[4].name}</div>
              )}
            </>
          )}
        </div>

        {/* Bottom face */}
        <div 
          className={`cube-face ${hoveredFace === 5 ? 'hovered' : ''}`}
          style={{
            backgroundColor: facesData[5].color,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            transform: `rotateX(-90deg) translateZ(${translateZ}px)`
          }}
          onMouseEnter={() => setHoveredFace(5)}
          onMouseLeave={() => setHoveredFace(null)}
        >
          {facesData[5].icon && (
            <>
              <img 
                src={facesData[5].icon} 
                alt={facesData[5].name}
                className="face-icon"
              />
              {!isMobile && hoveredFace === 5 && (
                <div className="skill-name-tooltip">{facesData[5].name}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CubeCanvas = ({ icons, isDarkMode, skills = [] }) => {
  // Extract names from skills if available
  const names = Array.isArray(skills) ? skills.map(skill => skill?.name || null) : [];
  
  // Make sure icons is an array
  const iconArray = Array.isArray(icons) ? icons : [];
  
  return (
    <div className="cube-container">
      <div className="scene">
        <Cube isDarkMode={isDarkMode} icons={iconArray} names={names} />
      </div>
    </div>
  );
};

export default CubeCanvas;