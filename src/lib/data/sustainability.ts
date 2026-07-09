/**
 * @module sustainability
 * Green score calculation and sustainability utilities.
 * Provides transit carbon comparisons, eco-scores, and contextual tips.
 */

import type { GreenScoreData, TransitMode, TransitOption } from '@/types';
import { getStadiumById } from '@/lib/data/stadiums';

/**
 * Base green scores assigned to each transit mode.
 * Higher is better (walking = 100, driving = 15).
 */
const BASE_GREEN_SCORES: Record<TransitMode, number> = {
  walk: 100,
  metro: 85,
  bus: 70,
  rideshare: 35,
  drive: 15,
};

/**
 * Fallback carbon emissions (kg per trip) when a stadium does not list
 * a particular transit mode. Based on North American urban averages.
 */
const FALLBACK_CARBON_KG: Record<TransitMode, number> = {
  walk: 0,
  metro: 0.6,
  bus: 1.1,
  rideshare: 4.0,
  drive: 7.5,
};

/**
 * Calculate a green score for a fan's transit choice to a given stadium.
 *
 * The score combines:
 * - A base score per transit mode
 * - A bonus/penalty based on how the mode's carbon output compares to the
 *   average across all modes available at the stadium
 * - A small boost from the stadium's own renewable energy percentage
 *
 * @param transitMode - The transit mode chosen by the user
 * @param stadiumId   - The stadium the user is traveling to
 * @returns A {@link GreenScoreData} object with score, savings, tips, and comparison
 */
export function calculateGreenScore(
  transitMode: TransitMode,
  stadiumId: string,
): GreenScoreData {
  const stadium = getStadiumById(stadiumId);

  // Resolve the user's carbon for the chosen mode
  const matchedOption = stadium?.transitOptions.find(
    (option) => option.mode === transitMode,
  );
  const userCarbonKg = matchedOption?.carbonKgPerTrip ?? FALLBACK_CARBON_KG[transitMode];

  // Resolve driving carbon for savings calculation
  const drivingOption = stadium?.transitOptions.find(
    (option) => option.mode === 'drive',
  );
  const drivingCarbonKg = drivingOption?.carbonKgPerTrip ?? FALLBACK_CARBON_KG.drive;

  // Average carbon across all available modes at this stadium
  const allOptions = stadium?.transitOptions ?? [];
  const averageCarbonKg =
    allOptions.length > 0
      ? allOptions.reduce((sum, option) => sum + option.carbonKgPerTrip, 0) / allOptions.length
      : FALLBACK_CARBON_KG.bus; // sensible fallback

  // --- Compute composite score ---
  const baseScore = BASE_GREEN_SCORES[transitMode];
  const carbonDelta = averageCarbonKg - userCarbonKg; // positive = better than avg
  const carbonBonus = Math.round(carbonDelta * 3); // scale factor
  const renewableBoost = stadium
    ? Math.round(stadium.sustainabilityMetrics.renewableEnergyPercent * 0.05)
    : 0;

  const rawScore = baseScore + carbonBonus + renewableBoost;
  const score = Math.max(0, Math.min(100, rawScore));

  const carbonSavedKg = Math.max(0, parseFloat((drivingCarbonKg - userCarbonKg).toFixed(2)));

  const tips = getSustainabilityTips(stadiumId, transitMode);

  return {
    score,
    transitMode,
    carbonSavedKg,
    tips,
    comparison: {
      averageCarbonKg: parseFloat(averageCarbonKg.toFixed(2)),
      userCarbonKg: parseFloat(userCarbonKg.toFixed(2)),
    },
  };
}

/**
 * Get all transit options for a stadium sorted by carbon footprint (ascending).
 *
 * @param stadiumId - The stadium to look up
 * @returns Array of {@link TransitOption} sorted from lowest to highest carbon, or an empty array if the stadium is not found
 */
export function getTransitComparison(stadiumId: string): TransitOption[] {
  const stadium = getStadiumById(stadiumId);
  if (!stadium) {
    return [];
  }

  return [...stadium.transitOptions].sort(
    (a, b) => a.carbonKgPerTrip - b.carbonKgPerTrip,
  );
}

/**
 * Return contextual sustainability tips based on the transit mode and
 * the stadium's sustainability profile.
 *
 * Tips are selected from a curated pool and filtered to be relevant to
 * the user's current choice.
 *
 * @param stadiumId   - The stadium the user is visiting
 * @param transitMode - The transit mode chosen by the user
 * @returns Array of tip strings (3–5 tips)
 */
export function getSustainabilityTips(
  stadiumId: string,
  transitMode: TransitMode,
): string[] {
  const stadium = getStadiumById(stadiumId);
  const tips: string[] = [];

  // --- Mode-specific tips ---
  switch (transitMode) {
    case 'walk':
      tips.push('Walking is the most eco-friendly option — zero emissions!');
      tips.push('Stay hydrated and wear sunscreen for your walk to the stadium.');
      break;
    case 'metro':
      tips.push('Great choice! Public rail produces up to 90% fewer emissions than driving alone.');
      tips.push('Buy a day pass to explore the city before and after the match.');
      break;
    case 'bus':
      tips.push('Buses carry many passengers at once, significantly reducing per-person emissions.');
      tips.push('Check the match-day schedule for express routes with fewer stops.');
      break;
    case 'rideshare':
      tips.push('Consider sharing your ride with other fans to split the carbon footprint.');
      tips.push('Switching to public transit could cut your trip emissions by over 60%.');
      break;
    case 'drive':
      tips.push('Carpooling with other fans can cut your per-person carbon footprint in half.');
      tips.push('If driving is your only option, consider an electric or hybrid vehicle.');
      tips.push('Taking public transit instead could save over 6 kg of CO₂ per trip.');
      break;
  }

  // --- Stadium-specific tips ---
  if (stadium) {
    const metrics = stadium.sustainabilityMetrics;

    if (metrics.renewableEnergyPercent >= 70) {
      tips.push(
        `${stadium.name} runs on ${metrics.renewableEnergyPercent}% renewable energy — one of the greenest venues!`,
      );
    }

    if (metrics.wasteDiversionPercent >= 60) {
      tips.push(
        `Use the clearly marked recycling bins — ${stadium.name} diverts ${metrics.wasteDiversionPercent}% of waste from landfills.`,
      );
    }

    if (metrics.waterRecyclingPercent >= 40) {
      tips.push(
        `${stadium.name} recycles ${metrics.waterRecyclingPercent}% of its water. Bring a reusable bottle to refill at free water stations.`,
      );
    }

    if (metrics.carbonNeutralGoalYear <= 2028) {
      tips.push(
        `${stadium.name} aims to be carbon neutral by ${metrics.carbonNeutralGoalYear} — your green transit choice supports that goal!`,
      );
    }
  }

  // --- General tips (always useful) ---
  tips.push('Bring a reusable water bottle to reduce single-use plastic waste.');

  // Return a reasonable number of tips (cap at 5)
  return tips.slice(0, 5);
}
