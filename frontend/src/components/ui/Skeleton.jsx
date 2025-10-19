import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-muted/50',
    card: 'bg-card/80',
    text: 'bg-muted/30 h-4 w-full rounded',
    circle: 'bg-muted/50 rounded-full',
    button: 'bg-muted/50 h-10 w-24 rounded-md'
  };

  return (
    <motion.div
      className={`animate-pulse ${variants[variant]} ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    />
  );
};

export const SkeletonCard = ({ children, loading = false, className = '' }) => {
  if (!loading) return children;

  return (
    <div className={`galaxy-card p-4 ${className}`}>
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-2/3" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
        <Skeleton variant="text" className="h-4 w-4/6" />
      </div>
    </div>
  );
};

export const SkeletonDriverCard = () => {
  return (
    <div className="galaxy-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-5 w-24" />
        <Skeleton variant="circle" className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-32" />
        <Skeleton variant="text" className="h-3 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton variant="text" className="h-3" />
        <Skeleton variant="text" className="h-3" />
      </div>
    </div>
  );
};

export const SkeletonStat = () => {
  return (
    <div className="galaxy-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="h-8 w-16" />
    </div>
  );
};
