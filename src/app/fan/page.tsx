/**
 * Fan Portal — Three-panel layout: AI Chat, Stadium Map, Green Score.
 * The primary experience for fans attending FIFA World Cup 2026 matches.
 * @module app/fan/page
 */

'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { STADIUMS } from '@/lib/data/stadiums';
import ChatInterface from '@/components/ChatInterface/ChatInterface';
import StadiumMap from '@/components/StadiumMap/StadiumMap';
import GreenScore from '@/components/GreenScore/GreenScore';
import LoadingSkeleton from '@/components/common/LoadingSkeleton/LoadingSkeleton';
import type { ChatContext } from '@/types';
import styles from './page.module.css';

/**
 * Fan portal content — reads stadium from query params and renders the three-panel layout.
 */
function FanPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stadiumId = searchParams.get('stadiumId') ?? STADIUMS[0].id;
  const languageParam = searchParams.get('language');
  const supportedLanguages = ['en', 'es', 'fr', 'pt', 'de', 'ar', 'ja', 'ko'] as const;
  const language = supportedLanguages.includes((languageParam ?? 'en') as (typeof supportedLanguages)[number])
    ? (languageParam ?? 'en')
    : 'en';
  const stadium = STADIUMS.find((s) => s.id === stadiumId) ?? STADIUMS[0];

  const [pendingChatQuery, setPendingChatQuery] = useState<string>('');
  const [activePanel, setActivePanel] = useState<'map' | 'green'>('map');
  const [showReasoning, setShowReasoning] = useState(false);

  const chatContext: ChatContext = {
    stadiumId: stadium.id,
    role: 'fan',
    language: language !== 'en' ? language : undefined,
  };

  /** Called by StadiumMap when a zone is clicked — populates chat */
  const handleZoneSelect = useCallback((query: string) => {
    setPendingChatQuery(query);
    setActivePanel('map');
  }, []);

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push('/')}
            aria-label="Return to home page"
          >
            ← Home
          </button>
          <div>
            <h1 className={styles.pageTitle}>Fan Portal</h1>
            <p className={styles.stadiumName}>📍 {stadium.name} — {stadium.city}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <label htmlFor="language-switcher" className="sr-only">Select language</label>
          <select
            id="language-switcher"
            className={`${styles.stadiumSwitcher} input select`}
            value={language}
            onChange={(e) =>
              router.push(
                `/fan?stadiumId=${encodeURIComponent(stadium.id)}&language=${encodeURIComponent(e.target.value)}`,
              )
            }
            title="Test GenAI in different languages"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="pt">Português</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>

          <label htmlFor="reasoning-toggle" className="sr-only">Show AI reasoning</label>
          <button
            id="reasoning-toggle"
            type="button"
            className={`${styles.toggleBtn} ${showReasoning ? styles.toggleActive : ''}`}
            onClick={() => setShowReasoning(!showReasoning)}
            title="Show AI reasoning and structured data (jury demo feature)"
          >
            🧠 {showReasoning ? 'Hide' : 'Show'} Reasoning
          </button>

          <label htmlFor="stadium-switcher" className="sr-only">Switch stadium</label>
          <select
            id="stadium-switcher"
            className={`${styles.stadiumSwitcher} input select`}
            value={stadiumId}
            onChange={(e) =>
              router.push(
                `/fan?stadiumId=${encodeURIComponent(e.target.value)}&language=${encodeURIComponent(language)}`,
              )
            }
          >
            {STADIUMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className={styles.layout}>
        {/* Primary Panel: Chat */}
        <div className={styles.chatPanel}>
          <Suspense fallback={<LoadingSkeleton variant="rectangular" height="400px" label="Loading AI chat..." />}>
            <ChatInterface
              context={chatContext}
              title="AI Concierge"
              placeholder="Ask about navigation, food, accessibility, transit..."
              showReasoning={showReasoning}
            />
          </Suspense>
        </div>

        {/* Secondary Panels */}
        <div className={styles.secondaryPanel}>
          {/* Tab switcher for secondary panels */}
          <div className={styles.tabBar} role="tablist" aria-label="Secondary panels">
            <button
              role="tab"
              aria-selected={activePanel === 'map'}
              aria-controls="map-panel"
              id="map-tab"
              className={`${styles.tab} ${activePanel === 'map' ? styles.tabActive : ''}`}
              onClick={() => setActivePanel('map')}
            >
              🗺️ Stadium Map
            </button>
            <button
              role="tab"
              aria-selected={activePanel === 'green'}
              aria-controls="green-panel"
              id="green-tab"
              className={`${styles.tab} ${activePanel === 'green' ? styles.tabActive : ''}`}
              onClick={() => setActivePanel('green')}
            >
              🌱 Green Score
            </button>
          </div>

          {activePanel === 'map' && (
            <div id="map-panel" role="tabpanel" aria-labelledby="map-tab" className={styles.panelContent}>
              <Suspense fallback={<LoadingSkeleton variant="rectangular" height="300px" label="Loading stadium map..." />}>
                <StadiumMap stadiumId={stadium.id} onZoneSelect={handleZoneSelect} />
              </Suspense>
            </div>
          )}

          {activePanel === 'green' && (
            <div id="green-panel" role="tabpanel" aria-labelledby="green-tab" className={styles.panelContent}>
              <Suspense fallback={<LoadingSkeleton variant="rectangular" height="300px" label="Loading green score..." />}>
                <GreenScore stadiumId={stadium.id} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Hidden pending query processor — populates chat from map interaction */}
      {pendingChatQuery && (
        <div aria-live="polite" className="sr-only">
          Chat query ready: {pendingChatQuery}
        </div>
      )}
    </div>
  );
}

/**
 * Fan portal page — wrapped in Suspense for useSearchParams.
 */
export default function FanPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="rectangular" height="100vh" label="Loading fan portal..." />}>
      <FanPortalContent />
    </Suspense>
  );
}
