import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface ViewDetailsButtonProps {
  onClick?: () => void;
}

export default function ViewDetailsButton({ onClick }: ViewDetailsButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Scroll to score breakdown if available
      const scoreElement = document.querySelector('[data-score-breakdown]');
      if (scoreElement) {
        scoreElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="btn-primary w-full mt-4 flex items-center justify-center space-x-2"
      aria-label="View detailed analysis"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>View Detailed Analysis</span>
      <ChevronRight className="w-4 h-4" />
    </motion.button>
  );
}
