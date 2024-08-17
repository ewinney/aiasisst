import React from 'react';
import { motion } from 'framer-motion';

const Connector = ({ start, end }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: start.x,
        top: start.y,
        width: length,
        height: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

export default Connector;
