import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Sphere } from '@react-three/drei';

const Ball = ({ imgUrl }) => {
  const texture = useTexture(imgUrl);
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial map={texture} />
    </Sphere>
  );
};

const BallCanvas = ({ icon }) => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 0, 5]} />
      <Ball imgUrl={icon} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default BallCanvas;
