import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import './CubeCanvas.css';

extend({ BoxGeometry: THREE.BoxGeometry });

const Cube = ({ imgUrls, isDarkMode }) => {
  const meshRef = useRef();
  const rotationSpeedRef = useRef({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  });
  const nextChangeRef = useRef(Date.now() + Math.random() * 5000);
  const textures = useTexture(imgUrls);

  useFrame(() => {
    if (!meshRef.current) return;

    // Check if it's time to change rotation direction
    if (Date.now() > nextChangeRef.current) {
      rotationSpeedRef.current = {
        x: Math.random() * 0.01 - 0.005,
        y: Math.random() * 0.01 - 0.005,
        z: Math.random() * 0.01 - 0.005
      };
      // Set next change time to 2-7 seconds from now
      nextChangeRef.current = Date.now() + 2000 + Math.random() * 5000;
    }

    // Apply rotation
    meshRef.current.rotation.x += rotationSpeedRef.current.x;
    meshRef.current.rotation.y += rotationSpeedRef.current.y;
    meshRef.current.rotation.z += rotationSpeedRef.current.z;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 4, Math.PI / 4, Math.PI / 4]}>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          map={texture}
        />
      ))}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(2.5, 2.5, 2.5)]} />
        <lineBasicMaterial attach="material" color={isDarkMode ? 'white' : 'black'} />
      </lineSegments>
    </mesh>
  );
};

const CubeCanvas = ({ icons, isDarkMode }) => {
  return (
    <div className="cube-container">
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 0, 5]} />
        <Cube imgUrls={icons} isDarkMode={isDarkMode} />
        <OrbitControls enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default CubeCanvas;