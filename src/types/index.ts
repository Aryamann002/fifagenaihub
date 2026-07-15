/**
 * @module types
 * Shared TypeScript interfaces and types for FanHub 26.
 * All domain models used across the application are defined here.
 */

// ---------------------------------------------------------------------------
// Stadium & Venue Types
// ---------------------------------------------------------------------------

/** Host country for FIFA World Cup 2026 venues */
export type HostCountry = 'USA' | 'Mexico' | 'Canada';

/** Represents a FIFA World Cup 2026 stadium venue */
export interface Stadium {
  /** Unique identifier for the stadium */
  id: string;
  /** Official stadium name */
  name: string;
  /** Host city */
  city: string;
  /** Host country */
  country: HostCountry;
  /** Seating capacity */
  capacity: number;
  /** Geographic coordinates */
  coordinates: { lat: number; lng: number };
  /** Available facilities inside the stadium */
  facilities: StadiumFacility[];
  /** Transit options to reach the stadium */
  transitOptions: TransitOption[];
  /** Environmental sustainability metrics */
  sustainabilityMetrics: SustainabilityMetrics;
}

/** A specific facility inside a stadium (gate, concession, etc.) */
export interface StadiumFacility {
  /** Unique facility identifier */
  id: string;
  /** Human-readable facility name */
  name: string;
  /** Category of the facility */
  type: FacilityType;
  /** Stadium zone where the facility is located */
  zone: string;
  /** Whether the facility is wheelchair/accessibility-friendly */
  accessible: boolean;
  /** Short description of the facility */
  description: string;
}

/** Categories of stadium facilities */
export type FacilityType =
  | 'gate'
  | 'concession'
  | 'restroom'
  | 'medical'
  | 'accessibility'
  | 'merchandise'
  | 'information'
  | 'sensory_room';

/** A transit option for traveling to a stadium */
export interface TransitOption {
  /** Mode of transportation */
  mode: TransitMode;
  /** Name or label for this transit option */
  name: string;
  /** Estimated travel time in minutes */
  estimatedTimeMinutes: number;
  /** Estimated carbon emissions per trip in kilograms */
  carbonKgPerTrip: number;
  /** Whether this option is accessibility-friendly */
  accessible: boolean;
  /** Additional details about this transit option */
  details: string;
}

/** Supported modes of transportation */
export type TransitMode = 'walk' | 'metro' | 'bus' | 'rideshare' | 'drive';

/** Environmental sustainability metrics for a stadium */
export interface SustainabilityMetrics {
  /** Percentage of energy from renewable sources */
  renewableEnergyPercent: number;
  /** Percentage of waste diverted from landfills */
  wasteDiversionPercent: number;
  /** Percentage of water that is recycled on-site */
  waterRecyclingPercent: number;
  /** Target year for achieving carbon neutrality */
  carbonNeutralGoalYear: number;
}

// ---------------------------------------------------------------------------
// Match Types
// ---------------------------------------------------------------------------

/** Represents a single FIFA World Cup 2026 match */
export interface Match {
  /** Unique match identifier */
  id: string;
  /** Group letter (A–L) */
  group: string;
  /** Home team country name */
  homeTeam: string;
  /** Away team country name */
  awayTeam: string;
  /** Stadium identifier (foreign key to Stadium.id) */
  stadiumId: string;
  /** Match date and time as an ISO 8601 string */
  dateTime: string;
  /** Current match status */
  status: MatchStatus;
  /** Score, present only when the match is live, at halftime, or completed */
  score?: { home: number; away: number };
}

/** Possible states of a match */
export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'completed';

// ---------------------------------------------------------------------------
// Chat / GenAI Types
// ---------------------------------------------------------------------------

/** A single chat message in the GenAI assistant interface */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Who sent the message */
  role: 'user' | 'assistant' | 'system';
  /** Message body text */
  content: string;
  /** Unix timestamp (ms) when the message was created */
  timestamp: number;
  /** ISO 639-1 language code detected by the AI, if applicable */
  detectedLanguage?: string;
  /** Category of the detected query (assistant only) */
  category?: string;
}

/** Contextual information sent alongside every chat request */
export interface ChatContext {
  /** The stadium the user is currently viewing or located at */
  stadiumId: string;
  /** The user's role (fan or staff) */
  role: UserRole;
  /** Preferred language (ISO 639-1 code) */
  language?: string;
}

/** Roles a user can assume in the app */
export type UserRole = 'fan' | 'staff';

/** Payload sent to the GenAI chat API */
export interface ChatRequest {
  /** The user's message text */
  message: string;
  /** Contextual metadata */
  context: ChatContext;
  /** Prior conversation turns for multi-turn context (most recent last) */
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** Response returned by the GenAI chat API */
export interface ChatResponse {
  /** The assistant's reply text */
  reply: string;
  /** ISO 639-1 code of the detected input language */
  detectedLanguage: string;
  /** Confidence score (0–1) of the response */
  confidence: number;
  /** Optional follow-up suggestions */
  suggestions?: string[];
  /** Category of the detected query */
  category?: string;
}

// ---------------------------------------------------------------------------
// Crowd Intelligence Types
// ---------------------------------------------------------------------------

/** A named zone within a stadium for crowd density tracking */
export interface CrowdZone {
  /** Unique zone identifier */
  id: string;
  /** Human-readable zone name */
  name: string;
  /** Current number of people in this zone */
  currentOccupancy: number;
  /** Maximum safe capacity for this zone */
  maxCapacity: number;
  /** Qualitative density level */
  densityLevel: DensityLevel;
  /** Whether occupancy is trending up, stable, or down */
  trend: 'increasing' | 'stable' | 'decreasing';
  /** Unix timestamp (ms) of the last data update */
  lastUpdated: number;
}

/** Qualitative crowd density levels */
export type DensityLevel = 'low' | 'moderate' | 'high' | 'critical';

/** Aggregate crowd data for an entire stadium at a point in time */
export interface CrowdData {
  /** Stadium identifier */
  stadiumId: string;
  /** Unix timestamp (ms) of the snapshot */
  timestamp: number;
  /** Per-zone crowd data */
  zones: CrowdZone[];
  /** Overall stadium occupancy as a percentage */
  overallOccupancyPercent: number;
  /** AI-generated summary of current crowd conditions */
  aiSummary: string;
}

// ---------------------------------------------------------------------------
// Accessibility Types
// ---------------------------------------------------------------------------

/** User preferences for accessibility features */
export interface AccessibilityPreferences {
  /** Enable high-contrast color mode */
  highContrast: boolean;
  /** Preferred font size */
  fontSize: 'normal' | 'large' | 'extra-large';
}

// ---------------------------------------------------------------------------
// Sustainability / Green Score Types
// ---------------------------------------------------------------------------

/** Calculated green score data for a user's transit choice */
export interface GreenScoreData {
  /** Overall green score from 0 (worst) to 100 (best) */
  score: number;
  /** Transit mode the score was calculated for */
  transitMode: TransitMode;
  /** Kilograms of carbon saved compared to driving */
  carbonSavedKg: number;
  /** Contextual sustainability tips */
  tips: string[];
  /** Comparison of user's carbon footprint vs. average */
  comparison: {
    /** Average carbon footprint in kg for all transit modes */
    averageCarbonKg: number;
    /** User's carbon footprint in kg for the chosen mode */
    userCarbonKg: number;
  };
}
