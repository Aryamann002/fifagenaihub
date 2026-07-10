/**
 * @module Mock GenAI Provider
 * Sophisticated mock provider that generates realistic, context-aware
 * responses for the FanHub 26 chatbot. Supports multi-language detection,
 * query categorization, and role-based response generation.
 */

import { GenAIProvider } from './provider';
import { GenAIContext, GenAIResponse, QueryCategory } from './types';

/** Keyword-to-language mapping for language detection */
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  es: [
    'hola', 'dónde', 'donde', 'cómo', 'como', 'cuándo', 'cuando',
    'qué', 'que', 'por favor', 'gracias', 'estadio', 'comida',
    'ayuda', 'partido', 'entrada', 'salida', 'baño', 'agua',
  ],
  fr: [
    'bonjour', 'salut', 'où', 'comment', 'quand', 'quel', 'quelle',
    'merci', 'stade', 'nourriture', 'aide', 'match', 'sortie',
    'toilettes', 'eau', "s'il vous plaît",
  ],
  pt: [
    'olá', 'oi', 'onde', 'quando', 'obrigado', 'obrigada',
    'estádio', 'comida', 'ajuda', 'jogo', 'saída', 'banheiro',
  ],
  de: [
    'hallo', 'guten', 'danke', 'bitte', 'stadion', 'essen',
    'hilfe', 'spiel', 'ausgang', 'toilette', 'wasser',
  ],
  ar: [
    'مرحبا', 'أين', 'كيف', 'متى', 'شكرا', 'ملعب',
    'طعام', 'مساعدة', 'مباراة', 'مخرج',
  ],
  ja: [
    'こんにちは', 'どこ', 'いつ', 'ありがとう', 'スタジアム',
    '食べ物', '助けて', '試合', '出口',
  ],
  ko: [
    '안녕하세요', '어디', '언제', '감사합니다', '경기장',
    '음식', '도움', '경기', '출구',
  ],
};

/** Keyword-to-category mapping for query classification */
const CATEGORY_KEYWORDS: Record<QueryCategory, string[]> = {
  navigation: [
    'where', 'find', 'locate', 'directions', 'gate', 'section',
    'seat', 'entrance', 'exit', 'level', 'floor', 'map', 'way',
    'lost', 'restroom', 'bathroom', 'toilet', 'donde', 'où',
  ],
  food: [
    'food', 'eat', 'drink', 'restaurant', 'concession', 'snack',
    'beer', 'water', 'halal', 'vegan', 'vegetarian', 'kosher',
    'gluten', 'allergy', 'menu', 'comida', 'nourriture', 'hungry',
  ],
  accessibility: [
    'wheelchair', 'accessible', 'disability', 'elevator', 'ramp',
    'hearing', 'visual', 'impair', 'ada', 'assistance', 'companion',
    'sensory', 'quiet', 'service animal', 'mobility',
  ],
  transit: [
    'parking', 'bus', 'train', 'subway', 'metro', 'uber', 'lyft',
    'taxi', 'rideshare', 'shuttle', 'transit', 'transport', 'drive',
    'car', 'bike', 'walk', 'station', 'traffic',
  ],
  sustainability: [
    'recycle', 'recycling', 'compost', 'sustainable', 'green',
    'environment', 'carbon', 'eco', 'waste', 'reusable', 'solar',
    'water station', 'refill',
  ],
  match_info: [
    'score', 'lineup', 'kickoff', 'kick off', 'team', 'schedule',
    'match', 'game', 'play', 'roster', 'group', 'bracket', 'next',
    'time', 'start', 'who', 'versus', 'vs',
  ],
  emergency: [
    'emergency', 'medical', 'help', 'fire', 'first aid', 'doctor',
    'nurse', 'hurt', 'injured', 'ambulance', 'security', 'danger',
    'threat', 'evacuate', 'defibrillator', 'aed', 'police',
  ],
  crowd_management: [
    'crowd', 'capacity', 'congestion', 'queue', 'line', 'wait',
    'flow', 'density', 'overcrowd', 'gate load', 'throughput',
    'bottleneck', 'screening', 'entry rate',
  ],
  general: [],
};

/** Fan response templates organized by query category */
const FAN_RESPONSES: Record<QueryCategory, string[]> = {
  navigation: [
    `Great question! 🗺️ At {stadium}, you can find your section by following the color-coded signs ` +
    `from your nearest gate. Look for the digital displays showing section numbers above each tunnel entrance. ` +
    `If you need in-person help, our volunteer guides wear bright green vests and are stationed at every major intersection.`,

    `🧭 Here's how to navigate {stadium}: From the main entrance, the stadium is divided into quadrants ` +
    `(North, South, East, West). Your ticket section number tells you which quadrant — sections 100-130 are ` +
    `North, 131-160 East, 161-190 South, and 191-220 West. Follow the overhead signs!`,

    `Looking for restrooms? 🚻 At {stadium}, restrooms are located at every gate entrance and at the ` +
    `midpoints between gates on each level. The ones near Gate D and Gate G usually have the shortest lines. ` +
    `Family restrooms are available near Guest Services on Level 1.`,

    `Need to find your gate? 🏟️ {stadium} has clearly marked gates with large illuminated letters. ` +
    `Your ticket shows your recommended gate — it'll be the closest one to your seat. Pro tip: the FanHub ` +
    `app's AR wayfinding feature can guide you turn-by-turn!`,

    `📍 Exits at {stadium} are located at all gate entrances. In case you need to step out, remember ` +
    `that re-entry is permitted with your ticket QR code. The nearest exits to most upper-level seats are ` +
    `the ramp exits at Gates A, D, G, and J.`,

    `Feeling lost? Don't worry! 😊 {stadium} has information kiosks at every main concourse intersection. ` +
    `Just tap the interactive screen to find your way, or ask any of our 2,000+ volunteers for directions. ` +
    `You can also text HELP to the number on your ticket for instant navigation assistance.`,

    `🎯 Your seat at {stadium} is easy to find! Enter through the gate on your ticket, then look for ` +
    `your section number on the overhead signs. Row letters start from A (closest to the field) going up. ` +
    `Seat numbers run left to right as you face the field.`,

    `Want a shortcut? 🏃 The express corridors on Level 2 of {stadium} connect Gates A through E ` +
    `without going through the main concourse. Great for avoiding the crowd during halftime!`,
  ],

  food: [
    `Great question! 🍔 {stadium} has over 30 food outlets across all levels. For quick bites, check ` +
    `out the Gridiron Grille near Gate B or the local diner on Level 2. If you're looking for something ` +
    `special, the premium concourse has gourmet options including halal and vegan choices. The shortest ` +
    `wait times are usually at concessions on the upper level. Would you like directions to a specific food area?`,

    `🌮 Craving something specific at {stadium}? Here's what's available: American classics at the ` +
    `main concession stands, Latin American cuisine near Gate C, Asian fusion at the East food court, ` +
    `and Mediterranean options on Level 3. All stands clearly mark allergen information and dietary options!`,

    `Vegetarian or vegan? 🥗 {stadium} has you covered! Look for the green leaf symbol at any ` +
    `concession stand — it marks plant-based options. The dedicated vegan stand near Gate F has amazing ` +
    `impossible burgers, falafel wraps, and fresh smoothies. Gluten-free options are also available at ` +
    `most stands — just ask the staff!`,

    `Thirsty? 🥤 {stadium} has free water refill stations at every gate entrance (bring a reusable ` +
    `bottle or grab one at the merchandise stands). For other drinks, the beverage kiosks on each level ` +
    `offer craft beers, soft drinks, fresh juices, and hot beverages. Beer sales stop at the 65th minute.`,

    `🍕 Pro tip for shorter food lines at {stadium}: Visit the concession stands on Level 3 or the ` +
    `far ends of each concourse (Gates A and J areas). The busiest spots are always near the main ` +
    `entrance gates. You can also pre-order through the FanHub app and pick up at the express window!`,

    `Looking for halal food at {stadium}? 🥙 Absolutely! There are certified halal options at the ` +
    `international food court near Gate E and at the specialty stand on Level 2 near section 145. ` +
    `Kosher options are available at the stand near Guest Services. Ask any staff member for guidance!`,

    `🍦 Bringing the kids? {stadium} has a family food zone near the Fan Festival area with ` +
    `kid-friendly options like chicken tenders, mac & cheese, fruit cups, and ice cream. Prices are ` +
    `more family-friendly there too! High chairs are available at the seated dining areas.`,

    `Want to avoid the rush? ⏰ The quietest food service times at {stadium} are during the first ` +
    `15 minutes of each half. Halftime is the busiest — consider grabbing your snacks at the 35th ` +
    `minute for a much shorter wait!`,
  ],

  accessibility: [
    `♿ {stadium} is fully accessible! Wheelchair-accessible seating is available in every section ` +
    `with companion seats alongside. Elevators are located at Gates A, D, G, and J. If you need a ` +
    `wheelchair, free loaner chairs are available at Guest Services (Gate A, Level 1).`,

    `🦻 Need hearing assistance at {stadium}? Assistive listening devices are available for free ` +
    `at Guest Services — just bring a photo ID as deposit. The stadium also has hearing loops ` +
    `installed in all concourse areas and at information desks. Captions are displayed on all video boards.`,

    `🌟 {stadium} has a dedicated Sensory Room for fans who may feel overwhelmed by the match-day ` +
    `atmosphere. Located near Gate D on Level 1, it offers a quiet space with adjustable lighting, ` +
    `noise-canceling headphones, and calming activities. No reservation needed — just walk in!`,

    `Service animals are welcome at {stadium}! 🐕‍🦺 Relief areas are located outside Gates B and H. ` +
    `Fresh water bowls are available at Guest Services. Our staff is trained to assist fans with ` +
    `service animals — just let us know if you need anything!`,

    `Visual impairment? 📻 {stadium} offers audio-descriptive commentary of the match via a ` +
    `dedicated radio frequency. Pick up a free receiver at Guest Services (Gate A). Braille signage ` +
    `is available at all elevator lobbies and restrooms. Our volunteer guides can provide ` +
    `one-on-one assistance — request this at any information kiosk.`,

    `🚗 Accessible parking at {stadium} is available in Lots A and B, closest to the main entrance. ` +
    `Display your accessible parking permit on arrival. Shuttle service runs from accessible parking ` +
    `to Gate A every 5 minutes. Curb cuts and smooth pathways connect all parking areas to gates.`,
  ],

  transit: [
    `🚇 Getting to {stadium} is easy by public transit! The nearest train/metro station is a ` +
    `10-minute walk from Gate A. On match days, services run extended hours with trains every ` +
    `5 minutes starting 3 hours before kickoff. Follow the crowd — there'll be volunteer guides ` +
    `at the station exits to help you find your way!`,

    `🚗 Driving to {stadium}? Parking lots open 4 hours before kickoff. General parking is ` +
    `$40-60 depending on proximity. We strongly recommend pre-booking through the FanHub app ` +
    `to guarantee a spot. Lots fill up fast on match days! Rideshare drop-off is at the designated ` +
    `zone near Gate C.`,

    `🚌 Free shuttle buses run to {stadium} from the city center starting 4 hours before the ` +
    `match. Pick-up points are marked with FIFA World Cup 2026 banners. After the match, ` +
    `shuttles run for 2 hours — no need to rush! Check the FanHub app for real-time shuttle tracking.`,

    `🚲 Biking to {stadium}? Bike parking is available near Gate H with over 500 secure ` +
    `spots — it's free and first-come, first-served. The nearest bike-share station is at the ` +
    `main intersection, 5 minutes from the stadium. Remember to bring your own lock for ` +
    `extra security!`,

    `🚕 Rideshare tip for {stadium}: Set your drop-off to the designated rideshare zone (not ` +
    `the main entrance) to avoid traffic congestion. After the match, walk 2 blocks to the ` +
    `post-event pickup zone — surge pricing is usually lower there, and you'll get a car faster!`,

    `📍 Traffic advisory for {stadium}: Road closures begin 2 hours before kickoff around ` +
    `the stadium perimeter. If driving, approach from the east side for the smoothest access ` +
    `to Lots C and D. GPS may not have the latest closure info — follow the FIFA directional signs instead.`,
  ],

  sustainability: [
    `🌍 {stadium} is committed to making this the greenest World Cup ever! You can help by ` +
    `using the color-coded recycling bins throughout the stadium: Blue for recyclables, Green ` +
    `for compost, Black for landfill. Our goal is to divert 90% of waste from landfills!`,

    `♻️ Brought a reusable water bottle? Great choice! {stadium} has free water refill stations ` +
    `at every gate entrance and at 20+ locations on the concourse. That's one less plastic bottle ` +
    `in the waste stream! If you need a reusable bottle, grab one at the FIFA sustainability stand near Gate A.`,

    `☀️ Fun fact: {stadium} is powered by 30% renewable energy during the World Cup! Solar panels ` +
    `on the roof and surrounding areas generate clean electricity. The stadium also collects ` +
    `rainwater for landscape irrigation, saving millions of gallons each year.`,

    `🌱 {stadium} uses compostable food containers and cutlery at all concession stands. ` +
    `When you're done eating, look for the green compost bins — your food waste and packaging ` +
    `will be turned into nutrient-rich soil for local community gardens!`,

    `🚆 The most sustainable way to reach {stadium}? Public transit! Taking the train or bus ` +
    `reduces your carbon footprint by up to 80% compared to driving alone. Plus, you'll skip ` +
    `the traffic! Bike parking is also available if you prefer pedal power. 🚲`,
  ],

  match_info: [
    `⚽ Looking for match information at {stadium}? Check the giant video boards at each end ` +
    `of the field for live scores, lineups, and stats. The FanHub app also has real-time match ` +
    `data, player profiles, and group standings — all at your fingertips!`,

    `📋 Team lineups are typically announced 1 hour before kickoff. You'll see them on the ` +
    `stadium video boards, on the FanHub app, and printed lineup cards are available at the ` +
    `Fan Information desks near Gates A and G at {stadium}.`,

    `🏆 Want to know about upcoming matches at {stadium}? Check the match schedule on the ` +
    `official FIFA World Cup 2026 app or the FanHub app. Group stage matches are played across ` +
    `all 16 host venues — {stadium} hosts several exciting matchups throughout the tournament!`,

    `📊 For detailed match stats during the game at {stadium}, open the FanHub app's Match Center. ` +
    `You'll find possession stats, shot maps, heat maps, player ratings, and more — updated in ` +
    `real time! Wi-Fi is free and available throughout the stadium.`,

    `⏰ Gates at {stadium} typically open 3 hours before kickoff. We recommend arriving at least ` +
    `90 minutes early to enjoy the pre-match atmosphere, find your seats, and grab some food ` +
    `before the action starts!`,

    `🎉 Looking for the pre-match Fan Festival? It's located in the plaza outside {stadium}, ` +
    `open 4 hours before kickoff! Enjoy live music, interactive games, food trucks, and official ` +
    `merchandise. Entry is free with your match ticket!`,
  ],

  emergency: [
    `🚨 For emergencies at {stadium}, call the stadium emergency line at the number displayed ` +
    `on the back of your ticket, or alert any staff member in a yellow vest. First aid stations ` +
    `are located at Gates A, D, G, and J on Level 1. If someone is injured, stay with them and ` +
    `flag down the nearest staff member immediately.`,

    `🏥 Need medical help at {stadium}? First aid stations are staffed with paramedics at Gates ` +
    `A, D, G, and J (Level 1). For minor issues, medical supply kits are also available at all ` +
    `Guest Services desks. AED defibrillators are wall-mounted at every gate entrance — they have ` +
    `voice-guided instructions for use.`,

    `🔒 Feel unsafe? Security staff at {stadium} are positioned at every gate and throughout the ` +
    `concourse — look for the black "SECURITY" jackets. You can also text the anonymous tip line ` +
    `shown on the stadium displays. For immediate danger, call emergency services.`,

    `🔥 In case of evacuation at {stadium}, follow the illuminated EXIT signs and the instructions ` +
    `from stadium staff. Move calmly to the nearest exit — do not use elevators. Assembly points ` +
    `are in the parking lots. Listen to PA announcements for specific guidance.`,

    `💊 Lost your medication or need prescription assistance at {stadium}? Visit the First Aid ` +
    `station at Gate A (Level 1) where medical staff can help. For non-emergency medical needs, ` +
    `there's a pharmacy within walking distance — ask Guest Services for directions.`,
  ],

  crowd_management: [
    `📊 For the best entry experience at {stadium}, arrive early and check the FanHub app's ` +
    `live gate wait times. Gates with the shortest waits are highlighted in green. Currently, ` +
    `entering through less popular gates (like Gate H or Gate J) saves an average of 8 minutes!`,

    `🚶 Pro tip: After the final whistle at {stadium}, consider staying in your seat for ` +
    `10-15 minutes. The concourse clears significantly, and you'll have a much smoother exit. ` +
    `Enjoy the post-match celebrations on the video boards while you wait!`,

    `🎯 Halftime crowds at {stadium} can be intense! For a smoother experience, visit concessions ` +
    `or restrooms during the first 15 minutes of each half instead. The FanHub app shows real-time ` +
    `crowd density on a heat map so you can find the quietest spots.`,

    `⏱️ Gate opening times at {stadium}: Gates open 3 hours before kickoff. The busiest entry ` +
    `period is 60-30 minutes before the match. For the fastest entry, arrive 2+ hours early or ` +
    `time your arrival for 45+ minutes before kickoff when initial crowds have cleared.`,

    `🗺️ Navigating crowds at {stadium}: Use the outer ring concourse for faster movement between ` +
    `sections. The inner concourse near the seating bowl tends to be more congested, especially ` +
    `near the halfway line sections. The FanHub app's crowd map updates every 30 seconds!`,
  ],

  general: [
    `Welcome to {stadium} for the FIFA World Cup 2026! 🎉 I'm here to help you have an amazing ` +
    `experience. You can ask me about navigation, food options, accessibility, getting here, match ` +
    `information, or anything else. What would you like to know?`,

    `Hi there! 👋 Great to have you at {stadium} for the World Cup! I can help with finding your ` +
    `seat, food recommendations, transport info, accessibility services, and much more. ` +
    `What can I help you with today?`,

    `⚽ Welcome to the FIFA World Cup 2026 at {stadium}! Whether you need directions, food ` +
    `recommendations, match info, or anything else — I'm your AI assistant and I'm here to help. ` +
    `Just ask away!`,

    `Hello! 🌟 I'm your FanHub AI assistant at {stadium}. I can help you with just about anything ` +
    `you need during your World Cup experience — from finding your seat to recommending the best ` +
    `food spots. What's on your mind?`,

    `Hey there, football fan! ⚽ Welcome to {stadium}! I know everything about this venue — ` +
    `ask me about seats, food, transit, accessibility, or just chat about the beautiful game. ` +
    `How can I make your match day even better?`,
  ],
};

/** Staff response templates organized by query category */
const STAFF_RESPONSES: Record<QueryCategory, string[]> = {
  navigation: [
    `📋 Staff Navigation Brief: {stadium} layout — Main concourse (Level 1) connects all gates ` +
    `via the outer ring. Service corridors accessible with staff credentials at doors marked "SC" ` +
    `at each gate. Staff staging areas are at Gates A (primary) and G (secondary). Equipment ` +
    `storage rooms are behind sections 110, 155, and 195.`,

    `🔑 Staff-only routes at {stadium}: Use service corridor SC-2 (Level 2) for fastest ` +
    `cross-stadium movement. Freight elevators at Gates B and H for equipment. Staff restrooms ` +
    `and break areas behind Gate D, Level 1. Your staff badge grants access to all SC doors.`,

    `📍 Emergency exit routes for staff at {stadium}: Primary evacuation corridors are the SC ` +
    `passages leading to external assembly points. Secondary routes via main concourse. Rally ` +
    `point Alpha is in Lot A (east), Bravo is in Lot D (west). Report to your zone supervisor.`,
  ],

  food: [
    `📊 Concession Operations Status at {stadium}: All 32 outlets operational. Current top ` +
    `sellers: grilled items (28%), beverages (24%), snacks (19%). Supply status: protein stock ` +
    `at 72%, beverage stock at 85%. Recommend resupply run to outlets F-7 and F-12 within ` +
    `the next 30 minutes. Waste collection on schedule.`,

    `⚙️ Food service deployment at {stadium}: 247 concession staff on shift. Break rotation ` +
    `starts at T+45min. Halftime surge prep should begin at 35th minute — all express lanes ` +
    `activated, backup registers powered on. Allergen incident protocol: Contact F&B Supervisor ` +
    `on Channel 4.`,

    `🔄 Inventory alert for {stadium}: Halal station (Gate E) running low on chicken wraps — ` +
    `estimated 45 portions remaining. Request additional stock from commissary B. Vegan ` +
    `stand (Gate F) fully stocked. Water refill stations all operational, no maintenance issues.`,
  ],

  accessibility: [
    `📋 Accessibility Services Status at {stadium}: 12 loaner wheelchairs deployed (8 available). ` +
    `All 6 elevators operational — Elevator D3 running 2 minutes slow, maintenance notified. ` +
    `Assistive listening devices: 45 of 60 checked out. Sensory Room occupancy: 3 of 8 capacity. ` +
    `All ADA seating areas confirmed clear of obstructions.`,

    `🔧 Accessibility team deployment at {stadium}: 18 accessibility coordinators on shift. ` +
    `Positions: 4 at Guest Services, 2 per elevator bank (8 total), 2 at Sensory Room, ` +
    `4 roaming. Wheelchair escort requests via Channel 6. Average response time: 4.2 minutes.`,

    `⚠️ Accessibility incident log at {stadium}: Elevator G2 maintenance completed at 14:30, ` +
    `now operational. Ramp handrail at Gate C tightened. Accessible restroom at Gate J — door ` +
    `sensor recalibrated. No outstanding issues. Next inspection round: T+60min.`,
  ],

  transit: [
    `🚇 Transit Operations at {stadium}: Train service running on schedule, 5-min intervals. ` +
    `Station crowd level at 62% capacity. Parking Lots A-D at 78% capacity (Lot C filling fastest). ` +
    `Rideshare zone processing 42 vehicles/hour. Shuttle service on time, 12-minute loop. ` +
    `No traffic incidents reported on approach roads.`,

    `📊 Post-match egress plan for {stadium}: Phase 1 (T+0 to T+15): Pedestrian-priority zone ` +
    `active, vehicle hold in all lots. Phase 2 (T+15 to T+30): Lots A-B release, transit surge ` +
    `capacity activated. Phase 3 (T+30+): All lots release, normal traffic flow. Estimated ` +
    `full clearance: T+90 minutes.`,

    `⚠️ Transit alert at {stadium}: Lot B exit 2 experiencing slower throughput — traffic ` +
    `control officer requested. Recommend directing overflow to Lot C exit 1. Bus staging ` +
    `area at 85% capacity — activate overflow lane. Train platform crowd management team ` +
    `deployed, current wait time: 8 minutes.`,
  ],

  sustainability: [
    `♻️ Sustainability Metrics for {stadium}: Current waste diversion rate: 87% (target: 90%). ` +
    `Recycling bins at 64% capacity — schedule collection at Gates C and F. Compost bins at ` +
    `52% capacity. Water station usage up 15% from last match. Solar generation: 2.4 MWh today. ` +
    `Fan engagement with reusable cups: 34% adoption rate.`,

    `📊 Sustainability Operations at {stadium}: Zero single-use plastic policy compliance at ` +
    `98%. Two vendor citations issued (stands F-4 and F-19 — non-compliant straws). Compostable ` +
    `packaging stock sufficient for remainder of event. Carbon offset tracking: on target. ` +
    `Recommend increasing recycling signage near Gate H.`,

    `🌱 Environmental report for {stadium}: Energy consumption 8% below projection — HVAC ` +
    `optimization working well. Rainwater collection system at 45% capacity. LED lighting ` +
    `all zones operational. Post-event deep clean scheduled with eco-certified products. ` +
    `Food waste composting on track for 2.1 metric tons diversion.`,
  ],

  match_info: [
    `📋 Match Operations Status at {stadium}: Pre-match protocol on schedule. Pitch inspection ` +
    `completed — field rated excellent. VAR system tested and operational. Broadcast positions ` +
    `confirmed. Ball crew (12) deployed. Fourth official briefed. Dressing rooms prepared ` +
    `and inspected. Team arrivals on schedule.`,

    `⚽ Match day timeline at {stadium}: T-180min: Gates open. T-120min: Fan Festival peak. ` +
    `T-60min: Lineup announcement. T-30min: Team warm-ups. T-15min: Pre-match ceremony. ` +
    `T-0: Kickoff. All checkpoints green. Staff should be at assigned positions by T-90min.`,

    `📊 Match technical status at {stadium}: Stadium Wi-Fi load at 67% capacity (12,400 ` +
    `concurrent users). Video board systems operational. PA system tested at all zones — ` +
    `clear audio confirmed. Goal-line technology calibrated. Timing systems synchronized.`,
  ],

  emergency: [
    `🚨 Emergency Protocol Status at {stadium}: All systems GREEN. First aid stations fully ` +
    `staffed: 4 paramedics, 8 EMTs, 2 physicians on site. AED locations verified (24 units). ` +
    `Evacuation routes clear and marked. Emergency vehicles staged at positions Echo-1 through ` +
    `Echo-4. Communication channels tested. Fire suppression systems armed.`,

    `📋 Medical Operations at {stadium}: Current shift: 4 paramedics, 8 EMTs, 2 physicians. ` +
    `Incident count today: 7 minor (heat-related: 4, minor injuries: 3). No major incidents. ` +
    `Medical supply levels adequate. Ambulance response time: 2.1 minutes average. ` +
    `Hospital liaison confirmed with nearest 3 facilities.`,

    `⚠️ Emergency Response Protocol at {stadium} — REMINDER: Code Yellow (medical) = First ` +
    `aid team dispatch, no public announcement. Code Orange (security) = Security team + ` +
    `zone lockdown, standby announcement. Code Red (evacuation) = Full PA activation, ` +
    `all staff execute evacuation plan. Always radio Command Center on Channel 1 first.`,
  ],

  crowd_management: [
    `📊 Current Analysis at {stadium}: Gate A is experiencing above-average flow at ` +
    `approximately 78% capacity. Recommend opening overflow lanes at Gate C (currently at ` +
    `42% capacity). Average entry processing time is 3.2 minutes per person. Suggested ` +
    `action: Deploy 2 additional screening staff to Gate A and activate digital signage ` +
    `to redirect fans toward Gate C.`,

    `🔄 Crowd Flow Report at {stadium}: Total ingress: 34,200 of 62,000 (55%). Peak entry ` +
    `rate: 890 fans/min at T-45. Current rate: 620 fans/min. Gate distribution: A(78%), ` +
    `B(65%), C(42%), D(71%), E(58%), F(39%), G(67%), H(44%), J(52%). Recommendation: ` +
    `Activate dynamic signage to balance Gates C, F, and H.`,

    `📈 Concourse density at {stadium}: Level 1 main concourse at 72% comfort capacity ` +
    `(sections 140-160 hotspot). Level 2 at 45%. Level 3 at 31%. Recommend opening ` +
    `overflow concourse section 2B. Restroom queues averaging 4.5 minutes at peak ` +
    `locations. Suggest activating queue management staff at L1 midpoints.`,

    `⚡ Post-match egress prediction for {stadium}: Based on current attendance (58,400) ` +
    `and weather (clear), estimated clearance time: 42 minutes. Recommended staff deployment: ` +
    `8 at each gate exit, 4 at each stairwell, 6 at transit connection points. Activate ` +
    `phase-release protocol for upper levels to prevent stairwell congestion.`,

    `🎯 Real-time crowd intelligence for {stadium}: Sections 120-135 showing above-normal ` +
    `standing density (fan celebration zone). No safety concern at current levels. ` +
    `Monitor threshold: 4.2 persons/m² (current: 3.1). Aisles clear. Emergency ` +
    `egress paths unobstructed. Next density scan in 5 minutes.`,
  ],

  general: [
    `📋 Staff Hub at {stadium}: Current operational status — all systems nominal. Staff ` +
    `count: 2,847 on shift. Next shift change: 18:00. Weather update: clear conditions, ` +
    `temperature 24°C. No active incidents. All departments reporting green. What area ` +
    `do you need information on?`,

    `🔧 Operations Dashboard for {stadium}: Gate ops: green. Concessions: green. ` +
    `Medical: green. Security: green. Transit: green. Technical: green. Sustainability: ` +
    `green. Guest Services: green. How can I assist your operations today?`,

    `👋 Staff Assistant ready at {stadium}. I can provide real-time crowd analytics, ` +
    `operational status updates, emergency protocol references, transit coordination ` +
    `data, and resource deployment recommendations. What do you need?`,
  ],
};

/** Localized response templates for non-English languages */
const LOCALIZED_RESPONSES: Record<string, Record<string, string>> = {
  es: {
    navigation: `¡Hola! 🗺️ En {stadium}, puedes encontrar tu sección siguiendo las señales ` +
      `de colores desde la puerta más cercana. Los voluntarios con chalecos verdes están en cada ` +
      `intersección principal para ayudarte. Los baños están en cada entrada de puerta y en los ` +
      `puntos medios del pasillo. ¿Necesitas ayuda con algo específico?`,
    food: `🍔 ¡{stadium} tiene más de 30 opciones de comida! Encontrarás comida americana, ` +
      `latina, asiática y mediterránea. Hay opciones halal, veganas y sin gluten claramente ` +
      `marcadas. Las estaciones de agua gratuitas están en cada puerta. ¿Quieres que te ` +
      `indique dónde encontrar algo específico?`,
    general: `¡Bienvenido al {stadium} para la Copa Mundial FIFA 2026! ⚽ Estoy aquí para ` +
      `ayudarte. Puedes preguntarme sobre navegación, comida, accesibilidad, transporte o ` +
      `información del partido. ¿En qué puedo ayudarte hoy?`,
    emergency: `🚨 Para emergencias en {stadium}, avisa a cualquier miembro del personal con ` +
      `chaleco amarillo o llama al número de emergencia en tu entrada. Las estaciones de ` +
      `primeros auxilios están en las Puertas A, D, G y J. Si alguien está herido, quédate ` +
      `con esa persona y pide ayuda inmediatamente.`,
  },
  fr: {
    navigation: `Bonjour ! 🗺️ Au {stadium}, suivez les panneaux de couleur depuis votre ` +
      `porte la plus proche pour trouver votre section. Les bénévoles en gilets verts sont ` +
      `présents à chaque intersection principale. Les toilettes sont situées à chaque entrée ` +
      `de porte. Comment puis-je vous aider ?`,
    food: `🍔 Le {stadium} propose plus de 30 points de restauration ! Vous trouverez de la ` +
      `cuisine américaine, latino-américaine, asiatique et méditerranéenne. Des options halal, ` +
      `véganes et sans gluten sont clairement indiquées. Des fontaines à eau gratuites sont ` +
      `disponibles à chaque porte. Que souhaitez-vous trouver ?`,
    general: `Bienvenue au {stadium} pour la Coupe du Monde FIFA 2026 ! ⚽ Je suis là pour ` +
      `vous aider. N'hésitez pas à me poser des questions sur la navigation, la nourriture, ` +
      `l'accessibilité, les transports ou les informations sur les matchs. Comment puis-je ` +
      `vous aider aujourd'hui ?`,
    emergency: `🚨 En cas d'urgence au {stadium}, alertez un membre du personnel en gilet ` +
      `jaune ou appelez le numéro d'urgence sur votre billet. Les postes de premiers secours ` +
      `sont aux Portes A, D, G et J. Si quelqu'un est blessé, restez avec cette personne ` +
      `et demandez de l'aide immédiatement.`,
  },
};

/** Follow-up suggestions by category and role */
const FAN_SUGGESTIONS: Record<QueryCategory, string[]> = {
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

const STAFF_SUGGESTIONS: Record<QueryCategory, string[]> = {
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

/** System instructions for GenAI providers */
const SYSTEM_INSTRUCTIONS = {
  fan: (stadiumName: string, language: string) => `You are an expert FIFA World Cup 2026 fan assistant at ${stadiumName}.

Your role: Help fans have an amazing match-day experience by providing accurate, friendly, and actionable guidance.

Guidelines:
- Be enthusiastic and welcoming
- Provide specific, local details for ${stadiumName}
- Offer pro tips and insider knowledge
- Include relevant emojis for visual appeal
- Keep responses concise and scannable
- Respond in ${language || 'English'}
- Offer 2-3 contextual follow-up suggestions

Topics you can help with: Navigation, Food & Dining, Accessibility Services, Transit & Parking, Sustainability Initiatives, Match Information, Emergency Assistance.`,

  staff: (stadiumName: string, _language: string) => `You are an expert FIFA World Cup 2026 operations assistant for ${stadiumName} staff.

Your role: Provide real-time operational intelligence to optimize crowd flow, resource deployment, and event safety.

Guidelines:
- Deliver data-driven insights and metrics
- Format operational data clearly (capacity %, crowd flow, incident status)
- Provide actionable recommendations with specific steps
- Use professional terminology and KPIs
- Respond with urgency appropriate to the operational context
- Reference departments and communication channels (Gates, F&B, Medical, Security, Transit, etc.)

Topics you can help with: Staff Navigation, Concession Operations, Accessibility Services, Transit & Egress, Sustainability Metrics, Match Operations, Emergency Protocol, Crowd Management.`,
};

/**
 * Mock GenAI provider that generates realistic, context-aware responses
 * for FanHub 26. Supports language detection, query categorization, and
 * role-based response generation without requiring an actual AI backend.
 */
export class MockGenAIProvider implements GenAIProvider {
  /**
   * Get the display name of this provider.
   *
   * @returns The provider name string
   */
  getProviderName(): string {
    return 'MockGenAI';
  }

  /**
   * Generate a context-aware response to a user prompt.
   * Simulates real provider behavior with latency, language detection,
   * query categorization, and role-based responses with reasoning.
   *
   * @param prompt - The user's input text
   * @param context - Contextual information (stadium, role, language, history)
   * @returns A promise resolving to a GenAI response with reply, language, reasoning, and suggestions
   */
  async generateResponse(
    prompt: string,
    context: GenAIContext
  ): Promise<GenAIResponse> {
    await this.simulateLatency();

    const detectedLanguage = this.detectLanguage(prompt);
    const category = this.categorizeQuery(prompt);
    const systemInstructions = SYSTEM_INSTRUCTIONS[context.role](
      context.stadiumName,
      context.language || 'English'
    );
    const reply = this.buildResponse(prompt, context, category, detectedLanguage);
    const suggestions = this.generateSuggestions(context, category);
    const reasoning = this.generateReasoning(prompt, category, context.role);
    const structuredData = this.buildStructuredData(category, context);

    const confidence = category === 'general' ? 0.78 : 0.92;

    return {
      reply,
      detectedLanguage,
      confidence,
      suggestions,
      category,
      reasoning,
      structuredData,
    };
  }

  /**
   * Simulate realistic network latency between 200ms and 800ms.
   */
  private simulateLatency(): Promise<void> {
    const delay = 200 + Math.random() * 600;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Detect the language of the input text using keyword matching.
   *
   * @param text - The text to analyze
   * @returns ISO language code (defaults to 'en')
   */
  private detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();

    const scores: Record<string, number> = {};

    for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
      scores[lang] = keywords.filter((kw) => lowerText.includes(kw)).length;
    }

    const bestLang = Object.entries(scores).reduce(
      (best, [lang, score]) =>
        score > best.score ? { lang, score } : best,
      { lang: 'en', score: 0 }
    );

    return bestLang.score > 0 ? bestLang.lang : 'en';
  }

  /**
   * Categorize the user's query based on keyword matching.
   *
   * @param text - The query text to categorize
   * @returns The detected query category
   */
  private categorizeQuery(text: string): QueryCategory {
    const lowerText = text.toLowerCase();

    const scores: Partial<Record<QueryCategory, number>> = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.length === 0) continue;
      const matchCount = keywords.filter((kw) => lowerText.includes(kw)).length;
      if (matchCount > 0) {
        scores[category as QueryCategory] = matchCount;
      }
    }

    if (Object.keys(scores).length === 0) {
      return 'general';
    }

    return Object.entries(scores).reduce(
      (best, [cat, score]) =>
        (score ?? 0) > (best.score ?? 0)
          ? { category: cat as QueryCategory, score: score ?? 0 }
          : best,
      { category: 'general' as QueryCategory, score: 0 }
    ).category;
  }

  /**
   * Build a contextual response based on category, role, and language.
   *
   * @param prompt - The original user prompt
   * @param context - The GenAI context with stadium and role info
   * @param category - The detected query category
   * @param language - The detected language code
   * @returns The generated response text
   */
  private buildResponse(
    _prompt: string,
    context: GenAIContext,
    category: QueryCategory,
    language: string
  ): string {
    // Try localized response for non-English languages
    if (language !== 'en' && context.role === 'fan') {
      const localizedCategory = LOCALIZED_RESPONSES[language];
      if (localizedCategory) {
        const localizedTemplate =
          localizedCategory[category] ?? localizedCategory['general'];
        if (localizedTemplate) {
          return localizedTemplate.replace(/\{stadium\}/g, context.stadiumName);
        }
      }
    }

    // Select response templates based on role
    const templates =
      context.role === 'staff'
        ? STAFF_RESPONSES[category]
        : FAN_RESPONSES[category];

    // Pick a random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template.replace(/\{stadium\}/g, context.stadiumName);
  }

  /**
   * Generate follow-up question suggestions based on context and category.
   *
   * @param context - The GenAI context with role info
   * @param category - The current query category
   * @returns Array of 2-3 follow-up suggestion strings
   */
  private generateSuggestions(
    context: GenAIContext,
    category: QueryCategory
  ): string[] {
    const pool =
      context.role === 'staff'
        ? STAFF_SUGGESTIONS[category]
        : FAN_SUGGESTIONS[category];

    // Shuffle and pick 2-3 suggestions
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = 2 + Math.floor(Math.random() * 2); // 2 or 3

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Generate AI reasoning explaining why this response was chosen.
   *
   * @param prompt - The user's original prompt
   * @param category - The detected query category
   * @param role - The user's role (fan or staff)
   * @returns Reasoning string explaining the AI's logic
   */
  private generateReasoning(
    prompt: string,
    category: QueryCategory,
    role: 'fan' | 'staff'
  ): string {
    const keywords = prompt.toLowerCase().split(/\s+/).slice(0, 3).join(', ');
    const roleDesc = role === 'fan' ? 'fan visitor' : 'operations staff';

    return `Detected query category: "${category}" based on keywords (${keywords}). Generated ${roleDesc}-appropriate response with relevant details and actionable guidance.`;
  }

  /**
   * Build structured data for complex queries to enable programmatic usage.
   *
   * @param category - The query category
   * @param context - The GenAI context with stadium and role info
   * @returns Structured data object for the response
   */
  private buildStructuredData(
    category: QueryCategory,
    context: GenAIContext
  ): Record<string, unknown> {
    const baseData = {
      stadium: context.stadiumName,
      stadiumId: context.stadiumId,
      role: context.role,
      category,
      timestamp: new Date().toISOString(),
    };

    // Add category-specific structured data
    switch (category) {
      case 'navigation':
        return {
          ...baseData,
          data: {
            gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
            levels: [1, 2, 3],
            amenities: {
              restrooms: 'every gate entrance',
              elevators: ['Gate A', 'Gate D', 'Gate G', 'Gate J'],
              infokiosks: 'main concourse intersections',
            },
          },
        };

      case 'food':
        return {
          ...baseData,
          data: {
            outlets: 30,
            cuisines: [
              'American',
              'Latin American',
              'Asian Fusion',
              'Mediterranean',
            ],
            dietary: ['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Kosher'],
            waterStations: 'Every gate entrance + 20+ concourse locations',
            avgWaitMinutes: {
              beforeKickoff: 5,
              halftime: 15,
              lateMatch: 3,
            },
          },
        };

      case 'transit':
        return {
          ...baseData,
          data: {
            parking: {
              lots: ['A', 'B', 'C', 'D'],
              costRange: '$40-60',
              capacity: '65%',
            },
            publicTransit: {
              nearestStation: '10-minute walk',
              serviceFrequency: '5 minutes',
              extended: true,
            },
            rideshare: 'Designated zone near Gate C',
            shuttles: 'Free from city center, 4 hours pre-match',
          },
        };

      case 'crowd_management':
        return {
          ...baseData,
          data: {
            currentCapacity: '55-75%',
            gateDistribution: {
              A: '78%',
              B: '65%',
              C: '42%',
              recommended: ['C', 'F', 'H'],
            },
            bestArrivalTime: '2+ hours before kickoff',
            peakTimes: ['30-60 min before kickoff', 'halftime'],
          },
        };

      case 'match_info':
        return {
          ...baseData,
          data: {
            gateOpenTime: '3 hours before kickoff',
            lineupAnnouncement: '1 hour before kickoff',
            fanFestival: '4 hours before kickoff',
            fanFestivalLocation: 'Plaza outside stadium',
          },
        };

      case 'accessibility':
        return {
          ...baseData,
          data: {
            wheelchairSeating: 'Every section with companion seats',
            elevators: ['Gate A', 'Gate D', 'Gate G', 'Gate J'],
            accessibleParking: 'Lots A & B',
            services: [
              'Free loaner wheelchairs',
              'Hearing assistance devices',
              'Sensory room',
              'Braille signage',
            ],
          },
        };

      default:
        return baseData;
    }
  }
}
