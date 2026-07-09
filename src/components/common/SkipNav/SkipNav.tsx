/**
 * SkipNav — Accessible skip navigation link.
 * Allows keyboard users to bypass repetitive navigation and jump to main content.
 * Follows WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks).
 * @module components/common/SkipNav
 */

import styles from './SkipNav.module.css';

/** Props for the SkipNav component */
interface SkipNavProps {
  /** The ID of the target content element to skip to */
  targetId?: string;
  /** Custom label text for the skip link */
  label?: string;
}

/**
 * Renders an accessible skip-to-content link that is visually hidden
 * until focused via keyboard navigation (Tab key).
 */
export default function SkipNav({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipNavProps) {
  return (
    <a href={`#${targetId}`} className={styles.skipNav} id="skip-nav-link">
      {label}
    </a>
  );
}
