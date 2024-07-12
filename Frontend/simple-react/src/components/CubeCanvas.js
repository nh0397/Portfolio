import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

extend({ BoxGeometry: THREE.BoxGeometry });

const Cube = ({ imgUrls, isDarkMode }) => {
  const textures = useTexture(imgUrls);
  const meshRef = useRef();

  useEffect(() => {
    const initialRotation = { x: Math.PI / 4, y: Math.PI / 4, z: Math.PI / 4 };
    let frameId;
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.z += 0.01;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    setTimeout(() => cancelAnimationFrame(frameId), 3000);

    return () => cancelAnimationFrame(frameId);
  }, []);

  useFrame(({ mouse }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = mouse.y * 0.5;
      meshRef.current.rotation.y = mouse.x * 0.5;
    }
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
    <div className="cube-container" style={{ position: 'relative', height: '200px', width: '200px' }}>
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 0, 5]} />
        <Cube imgUrls={icons} isDarkMode={isDarkMode} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default CubeCanvas;
