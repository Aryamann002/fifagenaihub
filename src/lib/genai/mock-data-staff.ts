/**
 * @module Mock GenAI Staff Data
 * Staff response templates, localized responses, and suggestion pools
 * for the MockGenAIProvider. Separated from fan data for maintainability.
 */

import { QueryCategory } from './types';

/** Staff response templates organized by query category */
export const STAFF_RESPONSES: Record<QueryCategory, string[]> = {
  navigation: [
    '📋 Staff Navigation Brief: {stadium} layout — Main concourse (Level 1) connects all gates via the outer ring. Service corridors accessible with staff credentials at doors marked "SC" at each gate. Staff staging areas are at Gates A (primary) and G (secondary). Equipment storage rooms are behind sections 110, 155, and 195.',
    '🔑 Staff-only routes at {stadium}: Use service corridor SC-2 (Level 2) for fastest cross-stadium movement. Freight elevators at Gates B and H for equipment. Staff restrooms and break areas behind Gate D, Level 1. Your staff badge grants access to all SC doors.',
    '📍 Emergency exit routes for staff at {stadium}: Primary evacuation corridors are the SC passages leading to external assembly points. Secondary routes via main concourse. Rally point Alpha is in Lot A (east), Bravo is in Lot D (west). Report to your zone supervisor.',
  ],
  food: [
    '📊 Concession Operations Status at {stadium}: All 32 outlets operational. Current top sellers: grilled items (28%), beverages (24%), snacks (19%). Supply status: protein stock at 72%, beverage stock at 85%. Recommend resupply run to outlets F-7 and F-12 within the next 30 minutes. Waste collection on schedule.',
    '⚙️ Food service deployment at {stadium}: 247 concession staff on shift. Break rotation starts at T+45min. Halftime surge prep should begin at 35th minute — all express lanes activated, backup registers powered on. Allergen incident protocol: Contact F&B Supervisor on Channel 4.',
    '🔄 Inventory alert for {stadium}: Halal station (Gate E) running low on chicken wraps — estimated 45 portions remaining. Request additional stock from commissary B. Vegan stand (Gate F) fully stocked. Water refill stations all operational, no maintenance issues.',
  ],
  accessibility: [
    '📋 Accessibility Services Status at {stadium}: 12 loaner wheelchairs deployed (8 available). All 6 elevators operational — Elevator D3 running 2 minutes slow, maintenance notified. Assistive listening devices: 45 of 60 checked out. Sensory Room occupancy: 3 of 8 capacity. All ADA seating areas confirmed clear of obstructions.',
    '🔧 Accessibility team deployment at {stadium}: 18 accessibility coordinators on shift. Positions: 4 at Guest Services, 2 per elevator bank (8 total), 2 at Sensory Room, 4 roaming. Wheelchair escort requests via Channel 6. Average response time: 4.2 minutes.',
    '⚠️ Accessibility incident log at {stadium}: Elevator G2 maintenance completed at 14:30, now operational. Ramp handrail at Gate C tightened. Accessible restroom at Gate J — door sensor recalibrated. No outstanding issues. Next inspection round: T+60min.',
  ],
  transit: [
    '🚇 Transit Operations at {stadium}: Train service running on schedule, 5-min intervals. Station crowd level at 62% capacity. Parking Lots A-D at 78% capacity (Lot C filling fastest). Rideshare zone processing 42 vehicles/hour. Shuttle service on time, 12-minute loop. No traffic incidents reported on approach roads.',
    '📊 Post-match egress plan for {stadium}: Phase 1 (T+0 to T+15): Pedestrian-priority zone active, vehicle hold in all lots. Phase 2 (T+15 to T+30): Lots A-B release, transit surge capacity activated. Phase 3 (T+30+): All lots release, normal traffic flow. Estimated full clearance: T+90 minutes.',
    '⚠️ Transit alert at {stadium}: Lot B exit 2 experiencing slower throughput — traffic control officer requested. Recommend directing overflow to Lot C exit 1. Bus staging area at 85% capacity — activate overflow lane. Train platform crowd management team deployed, current wait time: 8 minutes.',
  ],
  sustainability: [
    '♻️ Sustainability Metrics for {stadium}: Current waste diversion rate: 87% (target: 90%). Recycling bins at 64% capacity — schedule collection at Gates C and F. Compost bins at 52% capacity. Water station usage up 15% from last match. Solar generation: 2.4 MWh today. Fan engagement with reusable cups: 34% adoption rate.',
    '📊 Sustainability Operations at {stadium}: Zero single-use plastic policy compliance at 98%. Two vendor citations issued (stands F-4 and F-19 — non-compliant straws). Compostable packaging stock sufficient for remainder of event. Carbon offset tracking: on target. Recommend increasing recycling signage near Gate H.',
    '🌱 Environmental report for {stadium}: Energy consumption 8% below projection — HVAC optimization working well. Rainwater collection system at 45% capacity. LED lighting all zones operational. Post-event deep clean scheduled with eco-certified products. Food waste composting on track for 2.1 metric tons diversion.',
  ],
  match_info: [
    '📋 Match Operations Status at {stadium}: Pre-match protocol on schedule. Pitch inspection completed — field rated excellent. VAR system tested and operational. Broadcast positions confirmed. Ball crew (12) deployed. Fourth official briefed. Dressing rooms prepared and inspected. Team arrivals on schedule.',
    '⚽ Match day timeline at {stadium}: T-180min: Gates open. T-120min: Fan Festival peak. T-60min: Lineup announcement. T-30min: Team warm-ups. T-15min: Pre-match ceremony. T-0: Kickoff. All checkpoints green. Staff should be at assigned positions by T-90min.',
    '📊 Match technical status at {stadium}: Stadium Wi-Fi load at 67% capacity (12,400 concurrent users). Video board systems operational. PA system tested at all zones — clear audio confirmed. Goal-line technology calibrated. Timing systems synchronized.',
  ],
  emergency: [
    '🚨 Emergency Protocol Status at {stadium}: All systems GREEN. First aid stations fully staffed: 4 paramedics, 8 EMTs, 2 physicians on site. AED locations verified (24 units). Evacuation routes clear and marked. Emergency vehicles staged at positions Echo-1 through Echo-4. Communication channels tested. Fire suppression systems armed.',
    '📋 Medical Operations at {stadium}: Current shift: 4 paramedics, 8 EMTs, 2 physicians. Incident count today: 7 minor (heat-related: 4, minor injuries: 3). No major incidents. Medical supply levels adequate. Ambulance response time: 2.1 minutes average. Hospital liaison confirmed with nearest 3 facilities.',
    '⚠️ Emergency Response Protocol at {stadium} — REMINDER: Code Yellow (medical) = First aid team dispatch, no public announcement. Code Orange (security) = Security team + zone lockdown, standby announcement. Code Red (evacuation) = Full PA activation, all staff execute evacuation plan. Always radio Command Center on Channel 1 first.',
  ],
  crowd_management: [
    '📊 Current Analysis at {stadium}: Gate A is experiencing above-average flow at approximately 78% capacity. Recommend opening overflow lanes at Gate C (currently at 42% capacity). Average entry processing time is 3.2 minutes per person. Suggested action: Deploy 2 additional screening staff to Gate A and activate digital signage to redirect fans toward Gate C.',
    '🔄 Crowd Flow Report at {stadium}: Total ingress: 34,200 of 62,000 (55%). Peak entry rate: 890 fans/min at T-45. Current rate: 620 fans/min. Gate distribution: A(78%), B(65%), C(42%), D(71%), E(58%), F(39%), G(67%), H(44%), J(52%). Recommendation: Activate dynamic signage to balance Gates C, F, and H.',
    '📈 Concourse density at {stadium}: Level 1 main concourse at 72% comfort capacity (sections 140-160 hotspot). Level 2 at 45%. Level 3 at 31%. Recommend opening overflow concourse section 2B. Restroom queues averaging 4.5 minutes at peak locations. Suggest activating queue management staff at L1 midpoints.',
    '⚡ Post-match egress prediction for {stadium}: Based on current attendance (58,400) and weather (clear), estimated clearance time: 42 minutes. Recommended staff deployment: 8 at each gate exit, 4 at each stairwell, 6 at transit connection points. Activate phase-release protocol for upper levels to prevent stairwell congestion.',
    '🎯 Real-time crowd intelligence for {stadium}: Sections 120-135 showing above-normal standing density (fan celebration zone). No safety concern at current levels. Monitor threshold: 4.2 persons/m² (current: 3.1). Aisles clear. Emergency egress paths unobstructed. Next density scan in 5 minutes.',
  ],
  general: [
    '📋 Staff Hub at {stadium}: Current operational status — all systems nominal. Staff count: 2,847 on shift. Next shift change: 18:00. Weather update: clear conditions, temperature 24°C. No active incidents. All departments reporting green. What area do you need information on?',
    '🔧 Operations Dashboard for {stadium}: Gate ops: green. Concessions: green. Medical: green. Security: green. Transit: green. Technical: green. Sustainability: green. Guest Services: green. How can I assist your operations today?',
    '👋 Staff Assistant ready at {stadium}. I can provide real-time crowd analytics, operational status updates, emergency protocol references, transit coordination data, and resource deployment recommendations. What do you need?',
  ],
};

/** Localized response templates for non-English fan queries */
export const LOCALIZED_RESPONSES: Record<string, Record<string, string>> = {
  es: {
    navigation: '¡Hola! 🗺️ En {stadium}, puedes encontrar tu sección siguiendo las señales de colores desde la puerta más cercana. Los voluntarios con chalecos verdes están en cada intersección principal para ayudarte. Los baños están en cada entrada de puerta y en los puntos medios del pasillo. ¿Necesitas ayuda con algo específico?',
    food: '🍔 ¡{stadium} tiene más de 30 opciones de comida! Encontrarás comida americana, latina, asiática y mediterránea. Hay opciones halal, veganas y sin gluten claramente marcadas. Las estaciones de agua gratuitas están en cada puerta. ¿Quieres que te indique dónde encontrar algo específico?',
    general: '¡Bienvenido al {stadium} para la Copa Mundial FIFA 2026! ⚽ Estoy aquí para ayudarte. Puedes preguntarme sobre navegación, comida, accesibilidad, transporte o información del partido. ¿En qué puedo ayudarte hoy?',
    emergency: '🚨 Para emergencias en {stadium}, avisa a cualquier miembro del personal con chaleco amarillo o llama al número de emergencia en tu entrada. Las estaciones de primeros auxilios están en las Puertas A, D, G y J. Si alguien está herido, quédate con esa persona y pide ayuda inmediatamente.',
  },
  fr: {
    navigation: 'Bonjour ! 🗺️ Au {stadium}, suivez les panneaux de couleur depuis votre porte la plus proche pour trouver votre section. Les bénévoles en gilets verts sont présents à chaque intersection principale. Les toilettes sont situées à chaque entrée de porte. Comment puis-je vous aider ?',
    food: '🍔 Le {stadium} propose plus de 30 points de restauration ! Vous trouverez de la cuisine américaine, latino-américaine, asiatique et méditerranéenne. Des options halal, véganes et sans gluten sont clairement indiquées. Des fontaines à eau gratuites sont disponibles à chaque porte. Que souhaitez-vous trouver ?',
    general: "Bienvenue au {stadium} pour la Coupe du Monde FIFA 2026 ! ⚽ Je suis là pour vous aider. N'hésitez pas à me poser des questions sur la navigation, la nourriture, l'accessibilité, les transports ou les informations sur les matchs. Comment puis-je vous aider aujourd'hui ?",
    emergency: "🚨 En cas d'urgence au {stadium}, alertez un membre du personnel en gilet jaune ou appelez le numéro d'urgence sur votre billet. Les postes de premiers secours sont aux Portes A, D, G et J. Si quelqu'un est blessé, restez avec cette personne et demandez de l'aide immédiatement.",
  },
};

/** Follow-up suggestions for fan users by category */
export const FAN_SUGGESTIONS: Record<QueryCategory, string[]> = {
  navigation: [
    'How do I find my seat?',
    'Where are the nearest restrooms?',
    'Which gate should I use?',
    'Is there a map of the stadium?',
    'Where is Guest Services?',
  ],
  food: [
    'What halal options are available?',
    'Where are the water refill stations?',
    'What are the best vegan options?',
    'When do food stands close?',
    'Can I pre-order food?',
  ],
  accessibility: [
    'Where are the elevators?',
    'Is there a sensory room?',
    'Can I get a wheelchair?',
    'Are service animals allowed?',
    'Where is accessible parking?',
  ],
  transit: [
    'What time does the last train leave?',
    'Where is the rideshare drop-off?',
    'Is there bike parking?',
    'How do I get to parking Lot A?',
    'Are there shuttle buses?',
  ],
  sustainability: [
    'Where can I recycle?',
    'Are there water refill stations?',
    'What green initiatives does the stadium have?',
    'Are the food containers compostable?',
    'How is the stadium powered?',
  ],
  match_info: [
    'When does the next match start?',
    'Where can I see the lineup?',
    'What are the group standings?',
    'When do gates open?',
    'Is there a Fan Festival?',
  ],
  emergency: [
    'Where is the nearest first aid?',
    'How do I report a concern?',
    'Where are the AED locations?',
    'What is the evacuation plan?',
    'Is there a pharmacy nearby?',
  ],
  crowd_management: [
    'Which gate has the shortest wait?',
    'When is the best time to arrive?',
    'How do I avoid halftime crowds?',
    'When should I head to my seat?',
    'Are there express entry lanes?',
  ],
  general: [
    'What food options are there?',
    'How do I get to my seat?',
    'What time does the match start?',
    'Where is the Fan Festival?',
    'Is there free Wi-Fi?',
  ],
};

/** Follow-up suggestions for staff users by category */
export const STAFF_SUGGESTIONS: Record<QueryCategory, string[]> = {
  navigation: [
    'Show staff-only routes',
    'Where are equipment storage rooms?',
    'Emergency exit routes for my zone?',
  ],
  food: [
    'Concession inventory status?',
    'Which outlets need restocking?',
    'Halftime surge prep checklist?',
  ],
  accessibility: [
    'Wheelchair inventory status?',
    'Elevator operational report?',
    'Accessibility incident log?',
  ],
  transit: [
    'Parking lot capacity report?',
    'Post-match egress plan?',
    'Transit incident alerts?',
  ],
  sustainability: [
    'Waste diversion metrics?',
    'Recycling bin fill levels?',
    'Vendor compliance status?',
  ],
  match_info: [
    'Technical systems status?',
    'Match day timeline?',
    'Broadcast setup confirmed?',
  ],
  emergency: [
    'Emergency protocol reference?',
    'Medical team deployment?',
    'AED location verification?',
  ],
  crowd_management: [
    'Gate throughput analytics?',
    'Concourse density report?',
    'Egress plan prediction?',
  ],
  general: [
    'Overall operations status?',
    'Staff deployment summary?',
    'Active incident report?',
  ],
};
