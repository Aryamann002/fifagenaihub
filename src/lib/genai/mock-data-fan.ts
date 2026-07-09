/**
 * @module Mock GenAI Data
 * Response templates, keyword maps, and suggestion pools for the
 * MockGenAIProvider. Extracted as a data module to keep the provider
 * class focused on logic.
 */

import { QueryCategory } from './types';

/** Keyword-to-language mapping for language detection */
export const LANGUAGE_KEYWORDS: Record<string, string[]> = {
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
export const CATEGORY_KEYWORDS: Record<QueryCategory, string[]> = {
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
export const FAN_RESPONSES: Record<QueryCategory, string[]> = {
  navigation: [
    'Great question! 🗺️ At {stadium}, you can find your section by following the color-coded signs from your nearest gate. Look for the digital displays showing section numbers above each tunnel entrance. If you need in-person help, our volunteer guides wear bright green vests and are stationed at every major intersection.',
    "🧭 Here's how to navigate {stadium}: From the main entrance, the stadium is divided into quadrants (North, South, East, West). Your ticket section number tells you which quadrant — sections 100-130 are North, 131-160 East, 161-190 South, and 191-220 West. Follow the overhead signs!",
    'Looking for restrooms? 🚻 At {stadium}, restrooms are located at every gate entrance and at the midpoints between gates on each level. The ones near Gate D and Gate G usually have the shortest lines. Family restrooms are available near Guest Services on Level 1.',
    "Need to find your gate? 🏟️ {stadium} has clearly marked gates with large illuminated letters. Your ticket shows your recommended gate — it'll be the closest one to your seat. Pro tip: the FanHub app's AR wayfinding feature can guide you turn-by-turn!",
    '📍 Exits at {stadium} are located at all gate entrances. In case you need to step out, remember that re-entry is permitted with your ticket QR code. The nearest exits to most upper-level seats are the ramp exits at Gates A, D, G, and J.',
    "Feeling lost? Don't worry! 😊 {stadium} has information kiosks at every main concourse intersection. Just tap the interactive screen to find your way, or ask any of our 2,000+ volunteers for directions. You can also text HELP to the number on your ticket for instant navigation assistance.",
    '🎯 Your seat at {stadium} is easy to find! Enter through the gate on your ticket, then look for your section number on the overhead signs. Row letters start from A (closest to the field) going up. Seat numbers run left to right as you face the field.',
    'Want a shortcut? 🏃 The express corridors on Level 2 of {stadium} connect Gates A through E without going through the main concourse. Great for avoiding the crowd during halftime!',
  ],
  food: [
    "Great question! 🍔 {stadium} has over 30 food outlets across all levels. For quick bites, check out the Gridiron Grille near Gate B or the local diner on Level 2. If you're looking for something special, the premium concourse has gourmet options including halal and vegan choices. The shortest wait times are usually at concessions on the upper level. Would you like directions to a specific food area?",
    "🌮 Craving something specific at {stadium}? Here's what's available: American classics at the main concession stands, Latin American cuisine near Gate C, Asian fusion at the East food court, and Mediterranean options on Level 3. All stands clearly mark allergen information and dietary options!",
    'Vegetarian or vegan? 🥗 {stadium} has you covered! Look for the green leaf symbol at any concession stand — it marks plant-based options. The dedicated vegan stand near Gate F has amazing impossible burgers, falafel wraps, and fresh smoothies. Gluten-free options are also available at most stands — just ask the staff!',
    'Thirsty? 🥤 {stadium} has free water refill stations at every gate entrance (bring a reusable bottle or grab one at the merchandise stands). For other drinks, the beverage kiosks on each level offer craft beers, soft drinks, fresh juices, and hot beverages. Beer sales stop at the 65th minute.',
    '🍕 Pro tip for shorter food lines at {stadium}: Visit the concession stands on Level 3 or the far ends of each concourse (Gates A and J areas). The busiest spots are always near the main entrance gates. You can also pre-order through the FanHub app and pick up at the express window!',
    'Looking for halal food at {stadium}? 🥙 Absolutely! There are certified halal options at the international food court near Gate E and at the specialty stand on Level 2 near section 145. Kosher options are available at the stand near Guest Services. Ask any staff member for guidance!',
    '🍦 Bringing the kids? {stadium} has a family food zone near the Fan Festival area with kid-friendly options like chicken tenders, mac & cheese, fruit cups, and ice cream. Prices are more family-friendly there too! High chairs are available at the seated dining areas.',
    'Want to avoid the rush? ⏰ The quietest food service times at {stadium} are during the first 15 minutes of each half. Halftime is the busiest — consider grabbing your snacks at the 35th minute for a much shorter wait!',
  ],
  accessibility: [
    '♿ {stadium} is fully accessible! Wheelchair-accessible seating is available in every section with companion seats alongside. Elevators are located at Gates A, D, G, and J. If you need a wheelchair, free loaner chairs are available at Guest Services (Gate A, Level 1).',
    '🦻 Need hearing assistance at {stadium}? Assistive listening devices are available for free at Guest Services — just bring a photo ID as deposit. The stadium also has hearing loops installed in all concourse areas and at information desks. Captions are displayed on all video boards.',
    '🌟 {stadium} has a dedicated Sensory Room for fans who may feel overwhelmed by the match-day atmosphere. Located near Gate D on Level 1, it offers a quiet space with adjustable lighting, noise-canceling headphones, and calming activities. No reservation needed — just walk in!',
    'Service animals are welcome at {stadium}! 🐕‍🦺 Relief areas are located outside Gates B and H. Fresh water bowls are available at Guest Services. Our staff is trained to assist fans with service animals — just let us know if you need anything!',
    "Visual impairment? 📻 {stadium} offers audio-descriptive commentary of the match via a dedicated radio frequency. Pick up a free receiver at Guest Services (Gate A). Braille signage is available at all elevator lobbies and restrooms. Our volunteer guides can provide one-on-one assistance — request this at any information kiosk.",
    '🚗 Accessible parking at {stadium} is available in Lots A and B, closest to the main entrance. Display your accessible parking permit on arrival. Shuttle service runs from accessible parking to Gate A every 5 minutes. Curb cuts and smooth pathways connect all parking areas to gates.',
  ],
  transit: [
    "🚇 Getting to {stadium} is easy by public transit! The nearest train/metro station is a 10-minute walk from Gate A. On match days, services run extended hours with trains every 5 minutes starting 3 hours before kickoff. Follow the crowd — there'll be volunteer guides at the station exits to help you find your way!",
    '🚗 Driving to {stadium}? Parking lots open 4 hours before kickoff. General parking is $40-60 depending on proximity. We strongly recommend pre-booking through the FanHub app to guarantee a spot. Lots fill up fast on match days! Rideshare drop-off is at the designated zone near Gate C.',
    '🚌 Free shuttle buses run to {stadium} from the city center starting 4 hours before the match. Pick-up points are marked with FIFA World Cup 2026 banners. After the match, shuttles run for 2 hours — no need to rush! Check the FanHub app for real-time shuttle tracking.',
    "🚲 Biking to {stadium}? Bike parking is available near Gate H with over 500 secure spots — it's free and first-come, first-served. The nearest bike-share station is at the main intersection, 5 minutes from the stadium. Remember to bring your own lock for extra security!",
    "🚕 Rideshare tip for {stadium}: Set your drop-off to the designated rideshare zone (not the main entrance) to avoid traffic congestion. After the match, walk 2 blocks to the post-event pickup zone — surge pricing is usually lower there, and you'll get a car faster!",
    '📍 Traffic advisory for {stadium}: Road closures begin 2 hours before kickoff around the stadium perimeter. If driving, approach from the east side for the smoothest access to Lots C and D. GPS may not have the latest closure info — follow the FIFA directional signs instead.',
  ],
  sustainability: [
    '🌍 {stadium} is committed to making this the greenest World Cup ever! You can help by using the color-coded recycling bins throughout the stadium: Blue for recyclables, Green for compost, Black for landfill. Our goal is to divert 90% of waste from landfills!',
    "♻️ Brought a reusable water bottle? Great choice! {stadium} has free water refill stations at every gate entrance and at 20+ locations on the concourse. That's one less plastic bottle in the waste stream! If you need a reusable bottle, grab one at the FIFA sustainability stand near Gate A.",
    '☀️ Fun fact: {stadium} is powered by 30% renewable energy during the World Cup! Solar panels on the roof and surrounding areas generate clean electricity. The stadium also collects rainwater for landscape irrigation, saving millions of gallons each year.',
    '🌱 {stadium} uses compostable food containers and cutlery at all concession stands. When you\'re done eating, look for the green compost bins — your food waste and packaging will be turned into nutrient-rich soil for local community gardens!',
    "🚆 The most sustainable way to reach {stadium}? Public transit! Taking the train or bus reduces your carbon footprint by up to 80% compared to driving alone. Plus, you'll skip the traffic! Bike parking is also available if you prefer pedal power. 🚲",
  ],
  match_info: [
    '⚽ Looking for match information at {stadium}? Check the giant video boards at each end of the field for live scores, lineups, and stats. The FanHub app also has real-time match data, player profiles, and group standings — all at your fingertips!',
    "📋 Team lineups are typically announced 1 hour before kickoff. You'll see them on the stadium video boards, on the FanHub app, and printed lineup cards are available at the Fan Information desks near Gates A and G at {stadium}.",
    '🏆 Want to know about upcoming matches at {stadium}? Check the match schedule on the official FIFA World Cup 2026 app or the FanHub app. Group stage matches are played across all 16 host venues — {stadium} hosts several exciting matchups throughout the tournament!',
    "📊 For detailed match stats during the game at {stadium}, open the FanHub app's Match Center. You'll find possession stats, shot maps, heat maps, player ratings, and more — updated in real time! Wi-Fi is free and available throughout the stadium.",
    '⏰ Gates at {stadium} typically open 3 hours before kickoff. We recommend arriving at least 90 minutes early to enjoy the pre-match atmosphere, find your seats, and grab some food before the action starts!',
    "🎉 Looking for the pre-match Fan Festival? It's located in the plaza outside {stadium}, open 4 hours before kickoff! Enjoy live music, interactive games, food trucks, and official merchandise. Entry is free with your match ticket!",
  ],
  emergency: [
    '🚨 For emergencies at {stadium}, call the stadium emergency line at the number displayed on the back of your ticket, or alert any staff member in a yellow vest. First aid stations are located at Gates A, D, G, and J on Level 1. If someone is injured, stay with them and flag down the nearest staff member immediately.',
    '🏥 Need medical help at {stadium}? First aid stations are staffed with paramedics at Gates A, D, G, and J (Level 1). For minor issues, medical supply kits are also available at all Guest Services desks. AED defibrillators are wall-mounted at every gate entrance — they have voice-guided instructions for use.',
    '🔒 Feel unsafe? Security staff at {stadium} are positioned at every gate and throughout the concourse — look for the black "SECURITY" jackets. You can also text the anonymous tip line shown on the stadium displays. For immediate danger, call emergency services.',
    '🔥 In case of evacuation at {stadium}, follow the illuminated EXIT signs and the instructions from stadium staff. Move calmly to the nearest exit — do not use elevators. Assembly points are in the parking lots. Listen to PA announcements for specific guidance.',
    '💊 Lost your medication or need prescription assistance at {stadium}? Visit the First Aid station at Gate A (Level 1) where medical staff can help. For non-emergency medical needs, there\'s a pharmacy within walking distance — ask Guest Services for directions.',
  ],
  crowd_management: [
    "📊 For the best entry experience at {stadium}, arrive early and check the FanHub app's live gate wait times. Gates with the shortest waits are highlighted in green. Currently, entering through less popular gates (like Gate H or Gate J) saves an average of 8 minutes!",
    "🚶 Pro tip: After the final whistle at {stadium}, consider staying in your seat for 10-15 minutes. The concourse clears significantly, and you'll have a much smoother exit. Enjoy the post-match celebrations on the video boards while you wait!",
    "🎯 Halftime crowds at {stadium} can be intense! For a smoother experience, visit concessions or restrooms during the first 15 minutes of each half instead. The FanHub app shows real-time crowd density on a heat map so you can find the quietest spots.",
    '⏱️ Gate opening times at {stadium}: Gates open 3 hours before kickoff. The busiest entry period is 60-30 minutes before the match. For the fastest entry, arrive 2+ hours early or time your arrival for 45+ minutes before kickoff when initial crowds have cleared.',
    "🗺️ Navigating crowds at {stadium}: Use the outer ring concourse for faster movement between sections. The inner concourse near the seating bowl tends to be more congested, especially near the halfway line sections. The FanHub app's crowd map updates every 30 seconds!",
  ],
  general: [
    "Welcome to {stadium} for the FIFA World Cup 2026! 🎉 I'm here to help you have an amazing experience. You can ask me about navigation, food options, accessibility, getting here, match information, or anything else. What would you like to know?",
    'Hi there! 👋 Great to have you at {stadium} for the World Cup! I can help with finding your seat, food recommendations, transport info, accessibility services, and much more. What can I help you with today?',
    "⚽ Welcome to the FIFA World Cup 2026 at {stadium}! Whether you need directions, food recommendations, match info, or anything else — I'm your AI assistant and I'm here to help. Just ask away!",
    "Hello! 🌟 I'm your FanHub AI assistant at {stadium}. I can help you with just about anything you need during your World Cup experience — from finding your seat to recommending the best food spots. What's on your mind?",
    'Hey there, football fan! ⚽ Welcome to {stadium}! I know everything about this venue — ask me about seats, food, transit, accessibility, or just chat about the beautiful game. How can I make your match day even better?',
  ],
};
