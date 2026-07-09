/**
 * LoadingSkeleton — Animated placeholder for loading states.
 * Provides visual feedback during async operations and improves perceived performance.
 * @module components/common/LoadingSkeleton
 */

import styles from './LoadingSkeleton.module.css';

/** Props for the LoadingSkeleton component */
interface LoadingSkeletonProps {
  /** Width of the skeleton element (CSS value) */
  width?: string;
  /** Height of the skeleton element (CSS value) */
  height?: string;
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Number of skeleton lines to render (for text variant) */
  lines?: number;
  /** Accessible label describing what is loading */
  label?: string;
}

/**
 * Renders animated placeholder shapes that indicate content is loading.
 * Uses CSS shimmer animation for smooth, performant loading indication.
 */
export default function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  variant = 'text',
  lines = 1,
  label = 'Loading content...',
}: LoadingSkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return styles.circular;
      case 'rectangular':
        return styles.rectangular;
      default:
        return styles.text;
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={styles.container}
        role="status"
        aria-label={label}
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${styles.skeleton} ${styles.text}`}
            style={{
              width: index === lines - 1 ? '60%' : width,
              height,
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${getVariantClass()}`}
      style={{ width, height }}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
