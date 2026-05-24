import { HOSTS, TRAINERS } from '../constants';

// Define the database state format in LocalStorage
export interface DbState {
  users: any[];
  pets: any[];
  pet_profiles: any[];
  services: any[];
  service_providers: any[];
  bookings: any[];
  orders: any[];
  reviews: any[];
  payments: any[];
  recommendations: any[];
  analytics_events: any[];
  user_segments: any[];
  demand_forecasts: any[];
  locations: any[];
  notifications: any[];
}

export const INITIAL_LOCATIONS = [
  { id: 1, city: 'Bengaluru', area: 'Indiranagar', latitude: 12.9716, longitude: 77.5946 },
  { id: 2, city: 'Bengaluru', area: 'Koramangala', latitude: 12.9352, longitude: 77.6245 },
  { id: 3, city: 'Mumbai', area: 'Bandra', latitude: 19.0596, longitude: 72.8295 },
  { id: 4, city: 'Delhi', area: 'Saket', latitude: 28.5244, longitude: 77.2163 },
  { id: 5, city: 'Delhi', area: 'C P', latitude: 28.6304, longitude: 77.2177 },
  { id: 6, city: 'Chennai', area: 'Adyar', latitude: 13.0033, longitude: 80.2550 },
  { id: 7, city: 'Pune', area: 'Koregaon Park', latitude: 18.5362, longitude: 73.8930 },
];

export const INITIAL_SERVICES = [
  { id: 1, name: 'Temporary Pet Hosting', category: 'boarding', description: 'Safe and loving homes for your pet while you are away.' },
  { id: 2, name: 'Custom Pet Food', category: 'food', description: 'Subscription-based, tailor-made meals for your pet s diet.' },
  { id: 3, name: 'Elite Pet Training', category: 'training', description: 'Certified professional instructors for personalized agility, obedience, and socialization.' },
  { id: 4, name: 'Professional Pet Walking', category: 'walking', description: 'Daily, energetic walks and health tracking with premium sitters.' },
  { id: 5, name: 'Nearby Vet Care', category: 'vet', description: 'Verified state-of-the-art emergency hospitals and multi-specialty clinics.' },
  { id: 6, name: 'Community Events', category: 'events', description: 'Vibrant local meetups, custom pet festivals, and educational workshops.' },
  { id: 7, name: 'Playdate Matching', category: 'playdates', description: 'Finding active and fully compatible pet pals for safe social interaction.' },
  { id: 8, name: 'Pet Adoption Portal', category: 'adoption', description: 'Compassionate connections to local animal shelters and medical rehabs.' },
];

export const INITIAL_PROVIDERS = [
  // Boarding / Hosts (Mapped from constants and extended)
  {
    id: 1,
    name: 'Paws & Stay by the Sea',
    service_id: 1,
    city: 'Mumbai',
    area: 'Bandra',
    rating: 4.9,
    review_count: 128,
    price_per_unit: 800,
    image_url: 'https://picsum.photos/seed/host1/600/400',
    description: 'A loving apartment with a sea-view balcony, perfect for medium and small dogs. Daily grooming and home-cooked meals included.',
    location: 'Bandra, Mumbai',
    compatibility_tags: ['Friendly', 'Calm', 'Small dogs', 'Cats']
  },
  {
    id: 2,
    name: 'The Pet Haven Garden Home',
    service_id: 1,
    city: 'Bengaluru',
    area: 'Indiranagar',
    rating: 5.0,
    review_count: 92,
    price_per_unit: 1000,
    image_url: 'https://picsum.photos/seed/host2/600/400',
    description: 'A spacious independent home with a large, double-fenced garden. Ideal for energetic breeds who love fetching outdoor toys.',
    location: 'Indiranagar, Bangalore',
    compatibility_tags: ['Energetic', 'Playful', 'Large dogs', 'High activity']
  },
  {
    id: 3,
    name: 'Happy Homes for Pets',
    service_id: 1,
    city: 'Delhi',
    area: 'Saket',
    rating: 4.8,
    review_count: 210,
    price_per_unit: 700,
    image_url: 'https://picsum.photos/seed/host3/600/400',
    description: 'We are a loving veteran pet-owner family of four. Fresh meals, frequent walks around the green parks, and continuous indoor security.',
    location: 'Saket, Delhi',
    compatibility_tags: ['Friendly', 'Low activity', 'Medium dogs', 'Anxious pets']
  },

  // Trainers (id 4 - 6)
  {
    id: 4,
    name: 'Koramangala Canine Academy',
    service_id: 3,
    city: 'Bengaluru',
    area: 'Koramangala',
    rating: 5.0,
    review_count: 154,
    price_per_unit: 700, // per session
    image_url: 'https://picsum.photos/seed/trainer1/300/300',
    description: 'Specializes in Positive Reinforcement puppy training, advanced leash control, and structured obedience conditioning.',
    location: 'Koramangala, Bengaluru',
    compatibility_tags: ['Puppies', 'Playful', 'Energetic', 'Obedience']
  },
  {
    id: 5,
    name: 'Simran Kaur Pet Walking & Socials',
    service_id: 4,
    city: 'Delhi',
    area: 'Saket',
    rating: 4.9,
    review_count: 87,
    price_per_unit: 300, // per walk
    image_url: 'https://picsum.photos/seed/trainer2/300/300',
    description: 'Engaging physical routine and essential outdoor socialization training. Walk parameters tracked systematically via GPS.',
    location: 'Saket, Delhi',
    compatibility_tags: ['Anxious pets', 'Small dogs', 'Calm', 'Cats']
  },
  {
    id: 6,
    name: 'Arjun Behavioral Therapies',
    service_id: 3,
    city: 'Mumbai',
    area: 'Bandra',
    rating: 4.8,
    review_count: 112,
    price_per_unit: 850,
    image_url: 'https://picsum.photos/seed/trainer3/300/300',
    description: 'Corrective training for dog behavioral issues, reactivity modifiers, and competitive agility coaching.',
    location: 'Bandra, Mumbai',
    compatibility_tags: ['High activity', 'Large dogs', 'Behavioral Issues']
  },

  // Vets (id 7 - 9)
  {
    id: 7,
    name: 'CureVets Veterinary Hospital',
    service_id: 5,
    city: 'Bengaluru',
    area: 'Indiranagar',
    rating: 4.9,
    review_count: 450,
    price_per_unit: 600, // consulting fee
    image_url: 'https://picsum.photos/seed/vet1/300/300',
    description: '24/7 emergency unit, general medical wellness, diagnostics, orthopedic surgeries, and detailed vaccine logs.',
    location: 'Indiranagar, Bengaluru',
    compatibility_tags: ['Allergies', 'Anxious pets', 'Emergencies', 'Dogs', 'Cats']
  },
  {
    id: 8,
    name: 'Tailwaggers Multi-Specialty Vet Clinic',
    service_id: 5,
    city: 'Mumbai',
    area: 'Bandra',
    rating: 4.7,
    review_count: 310,
    price_per_unit: 750,
    image_url: 'https://picsum.photos/seed/vet2/300/300',
    description: 'State of the art veterinary diagnostic lab and critical surgical suite. Comprehensive allergy mapping and dietary counseling.',
    location: 'Bandra, Mumbai',
    compatibility_tags: ['Allergies', 'Special diets', 'Dogs', 'Cats']
  },
  {
    id: 9,
    name: 'Apex Animal Care & Trauma Centre',
    service_id: 5,
    city: 'Delhi',
    area: 'Saket',
    rating: 4.9,
    review_count: 180,
    price_per_unit: 500,
    image_url: 'https://picsum.photos/seed/vet3/300/300',
    description: 'Compassionate, specialized veterinary treatments led by Delhi s top consultants. Laser-guided surgical diagnostics.',
    location: 'Saket, Delhi',
    compatibility_tags: ['Emergencies', 'Low activity', 'Dogs', 'Cats', 'Other']
  },

  // Pet Food Subscription Brands (id 10 - 12)
  {
    id: 10,
    name: 'Royal Canin Personalized Diet',
    service_id: 2,
    city: 'Bengaluru',
    area: 'Indiranagar',
    rating: 4.8,
    review_count: 1980,
    price_per_unit: 3500, // monthly subscription
    image_url: 'https://picsum.photos/seed/food1/300/300',
    description: 'Tailored premium dry food designed carefully for specific breeds, optimal energy, stomach sensitivity, and healthy coats.',
    location: 'Delivery All Cities',
    compatibility_tags: ['Allergies', 'Special diets', 'Small dogs', 'Large dogs', 'Premium', 'Budgets']
  },
  {
    id: 11,
    name: 'Drools Feed-Organic Superfood',
    service_id: 2,
    city: 'Delhi',
    area: 'Saket',
    rating: 4.6,
    review_count: 1420,
    price_per_unit: 1800,
    image_url: 'https://picsum.photos/seed/food2/300/300',
    description: 'Grain-free, fully organic formulation enriched with Omega 3 fatty acids, prebiotics, and essential minerals for dogs and cats.',
    location: 'Delivery All Cities',
    compatibility_tags: ['Low activity', 'Small dogs', 'Cats', 'Budget']
  },
  {
    id: 12,
    name: 'Pedigree Pro Active Vitality',
    service_id: 2,
    city: 'Mumbai',
    area: 'Bandra',
    rating: 4.7,
    review_count: 2310,
    price_per_unit: 2500,
    image_url: 'https://picsum.photos/seed/food3/300/300',
    description: 'Professional high-protein diets designed for active guard dogs, high stamina recovery, and robust bone strength.',
    location: 'Delivery All Cities',
    compatibility_tags: ['Energetic', 'High activity', 'Large dogs', 'Moderate']
  }
];

// Seed initial database state if it doesn't exist
export function initDatabase() {
  const isSeeded = localStorage.getItem('petpal_db_seeded');
  if (isSeeded) return;

  // Let's seed users (retaining the default user "akul@example.com" first)
  const users = [
    { id: 1, name: 'Akul Sajith', email: 'akul@example.com', password: '12345', city: 'Bengaluru', petType: 'Dog', created_at: '2026-03-10 10:00:00' },
    { id: 2, name: 'Sheeta Sharma', email: 'sheeta@example.com', password: '12345', city: 'Mumbai', petType: 'Cat', created_at: '2026-04-12 11:30:00' },
    { id: 3, name: 'Rahul Varma', email: 'rahul@example.com', password: '12345', city: 'Delhi', petType: 'Other', created_at: '2026-05-01 14:15:00' },
    { id: 4, name: 'Priya Iyer', email: 'priya@example.com', password: '12345', city: 'Bengaluru', petType: 'Dog', created_at: '2026-05-15 09:20:00' },
  ];

  const pets = [
    { id: 1, owner_id: 1, name: 'Rocky', type: 'Dog', breed: 'Golden Retriever', age: 3, weight: 28, size: 'Large', temperament: 'Playful', allergies: 'Gluten', activity_level: 'High', budget: 'Premium', image_url: 'https://picsum.photos/seed/buddy/400/300' },
    { id: 2, owner_id: 1, name: 'Bruno', type: 'Dog', breed: 'Beagle', age: 2, weight: 14, size: 'Medium', temperament: 'Friendly', allergies: 'None', activity_level: 'High', budget: 'Moderate', image_url: 'https://picsum.photos/seed/max/400/300' },
    { id: 3, owner_id: 2, name: 'Luna', type: 'Cat', breed: 'Persian Cat', age: 1, weight: 4, size: 'Small', temperament: 'Calm', allergies: 'Chicken', activity_level: 'Low', budget: 'Premium', image_url: 'https://picsum.photos/seed/bella/400/300' },
    { id: 4, owner_id: 3, name: 'Snowy', type: 'Other', breed: 'Rabbit', age: 1, weight: 2, size: 'Small', temperament: 'Friendly', allergies: 'None', activity_level: 'Moderate', budget: 'Budget', image_url: 'https://picsum.photos/seed/charlie/400/300' },
    { id: 5, owner_id: 4, name: 'Sheru', type: 'Dog', breed: 'Indie', age: 4, weight: 22, size: 'Large', temperament: 'Friendly', allergies: 'None', activity_level: 'Moderate', budget: 'Moderate', image_url: 'https://picsum.photos/seed/misty/400/300' },
  ];

  const pet_profiles = [
    { id: 1, pet_id: 1, dietary_pref: 'High Protein Dry', medical_history: 'Up to date with vaccine shots. Dewormed.' },
    { id: 2, pet_id: 2, dietary_pref: 'Organic Wet & Dry Mix', medical_history: 'Mild ear flush required occasionally.' },
    { id: 3, pet_id: 3, dietary_pref: 'Grain Free Fish Dry', medical_history: 'Lactose intolerant. Undergone regular hairball treatments.' },
    { id: 4, pet_id: 4, dietary_pref: 'Leafy Veggies & Hay Pellets', medical_history: 'Teeth scaling done in Jan 2026.' },
    { id: 5, pet_id: 5, dietary_pref: 'Indie Puppy Chow', medical_history: 'Sterilized. Vaccinated.' },
  ];

  const bookings = [
    { id: 1, user_id: 1, pet_id: 1, provider_id: 2, service_type: 'boarding', booking_date: '2026-05-10', status: 'completed', amount: 3000 },
    { id: 2, user_id: 1, pet_id: 2, provider_id: 4, service_type: 'training', booking_date: '2026-05-14', status: 'completed', amount: 1400 },
    { id: 3, user_id: 2, pet_id: 3, provider_id: 1, service_type: 'boarding', booking_date: '2026-05-15', status: 'completed', amount: 1600 },
    { id: 4, user_id: 4, pet_id: 5, provider_id: 7, service_type: 'vet', booking_date: '2026-05-18', status: 'completed', amount: 600 },
    { id: 5, user_id: 1, pet_id: 1, provider_id: 2, service_type: 'boarding', booking_date: '2026-05-22', status: 'confirmed', amount: 2000 },
    { id: 6, user_id: 2, pet_id: 3, provider_id: 8, service_type: 'vet', booking_date: '2026-05-24', status: 'pending', amount: 750 },
    { id: 7, user_id: 3, pet_id: 4, provider_id: 5, service_type: 'walking', booking_date: '2026-05-26', status: 'confirmed', amount: 900 },
    { id: 8, user_id: 4, pet_id: 5, provider_id: 4, service_type: 'training', booking_date: '2026-05-02', status: 'cancelled', amount: 700 }, // cancellation analysis
  ];

  const orders = [
    { id: 1, user_id: 1, pet_id: 1, product_type: 'food', product_name: 'Royal Canin Max Selection', order_date: '2026-05-05', amount: 3500, status: 'completed' },
    { id: 2, user_id: 2, pet_id: 3, product_type: 'food', product_name: 'Drools Organic Feline', order_date: '2026-05-12', amount: 1800, status: 'completed' },
    { id: 3, user_id: 1, pet_id: 2, product_type: 'food', product_name: 'Drools Grain-Free Organic', order_date: '2026-05-16', amount: 1800, status: 'completed' },
    { id: 4, user_id: 4, pet_id: 5, product_type: 'food', product_name: 'Pedigree Pro Active', order_date: '2026-05-19', amount: 2500, status: 'shipped' },
  ];

  const reviews = [
    { id: 1, provider_id: 2, user_id: 1, rating: 5, comment: 'Exceptional hosting! Rocky returned healthy and happier than ever. Beautiful lawn!', review_date: '2026-05-11' },
    { id: 2, provider_id: 4, user_id: 1, rating: 5, comment: 'Great behavioral session. Leash pulling is reduced by 90% in just two weeks!', review_date: '2026-05-15' },
    { id: 3, provider_id: 1, user_id: 2, rating: 4, comment: 'Very careful and thorough sitter. Beautiful balcony and high security.', review_date: '2026-05-16' },
    { id: 4, provider_id: 7, user_id: 4, rating: 5, comment: 'Super emergency consultation! Calm and experienced veterinary staff.', review_date: '2026-05-19' },
  ];

  const payments = [
    { id: 1, booking_id: 1, order_id: null, amount: 3000, payment_method: 'UPI', status: 'success', payment_date: '2026-05-09 18:22:04' },
    { id: 2, booking_id: 2, order_id: null, amount: 1400, payment_method: 'Card', status: 'success', payment_date: '2026-05-13 10:14:15' },
    { id: 3, booking_id: 3, order_id: null, amount: 1600, payment_method: 'UPI', status: 'success', payment_date: '2026-05-14 16:45:00' },
    { id: 4, booking_id: 4, order_id: null, amount: 600, payment_method: 'Netbanking', status: 'success', payment_date: '2026-05-17 11:23:44' },
    { id: 5, booking_id: 5, order_id: null, amount: 2000, payment_method: 'UPI', status: 'success', payment_date: '2026-05-21 09:12:00' },
    { id: 6, booking_id: 7, order_id: null, amount: 900, payment_method: 'Card', status: 'success', payment_date: '2026-05-23 21:05:00' },
    { id: 7, booking_id: 8, order_id: null, amount: 700, payment_method: 'UPI', status: 'failed', payment_date: '2026-05-01 12:40:11' },
    { id: 8, booking_id: null, order_id: 1, amount: 3500, payment_method: 'Card', status: 'success', payment_date: '2026-05-05 08:33:10' },
    { id: 9, booking_id: null, order_id: 2, amount: 1800, payment_method: 'UPI', status: 'success', payment_date: '2026-05-12 17:02:19' },
    { id: 10, booking_id: null, order_id: 3, amount: 1800, payment_method: 'UPI', status: 'success', payment_date: '2026-05-16 19:40:02' },
    { id: 11, booking_id: null, order_id: 4, amount: 2500, payment_method: 'Netbanking', status: 'success', payment_date: '2026-05-19 14:15:20' }
  ];

  const recommendations = [
    { id: 1, user_id: 1, pet_id: 1, recommendation_type: 'Food', recommended_item: 'Royal Canin Personalized Diet', reason: 'High-protein diet customized for active Large Golden Retriever with Gluten allergy.', score: 96, created_at: '2026-05-23 19:00:00' },
    { id: 2, user_id: 1, pet_id: 1, recommendation_type: 'Service', recommended_item: 'The Pet Haven Garden Home', reason: 'Excellent outdoor garden matching active Golden Retriever lifestyle.', score: 98, created_at: '2026-05-23 19:00:00' },
    { id: 3, user_id: 1, pet_id: 2, recommendation_type: 'Food', recommended_item: 'Drools Grain-Free Organic', reason: 'Organic medium formula suited for healthy Beagle growth.', score: 91, created_at: '2026-05-23 19:00:00' },
    { id: 4, user_id: 2, pet_id: 3, recommendation_type: 'Food', recommended_item: 'Royal Canin Personalized Diet', reason: 'Tailor-made flat-face feline diet matching Persian breed hairball logs.', score: 94, created_at: '2026-05-23 19:00:00' }
  ];

  const analytics_events = [
    { id: 1, user_id: 1, event_type: 'page_view', metadata: 'Home Page', created_at: '2026-05-23 12:00:00' },
    { id: 2, user_id: 1, event_type: 'search', metadata: 'Boarding in Indiranagar', created_at: '2026-05-23 12:01:05' },
    { id: 3, user_id: 2, event_type: 'booking_attempt', metadata: 'Paws & Stay by the Sea', created_at: '2026-05-23 14:20:00' },
    { id: 4, user_id: 4, event_type: 'click', metadata: 'Support Contact Us', created_at: '2026-05-23 15:40:12' }
  ];

  const user_segments = [
    { id: 1, user_id: 1, segment_name: 'Premium Users', total_bookings: 3, total_spent: 9900, last_active: '2026-05-23' },
    { id: 2, user_id: 2, segment_name: 'Seasonal Users', total_bookings: 2, total_spent: 4150, last_active: '2026-05-22' },
    { id: 3, user_id: 3, segment_name: 'Occasional Users', total_bookings: 1, total_spent: 900, last_active: '2026-05-20' },
    { id: 4, user_id: 4, segment_name: 'Frequent Users', total_bookings: 2, total_spent: 3800, last_active: '2026-05-23' }
  ];

  // Seeding 4 weeks of future predicted demands
  const demand_forecasts = [
    { id: 1, service_type: 'boarding', forecast_date: '2026-05-25', predicted_bookings: 15, confidence_score: 94, season: 'Summer Vacation' },
    { id: 2, service_type: 'boarding', forecast_date: '2026-05-26', predicted_bookings: 11, confidence_score: 92, season: 'Weekday Stable' },
    { id: 3, service_type: 'boarding', forecast_date: '2026-05-30', predicted_bookings: 24, confidence_score: 95, season: 'Weekend Wave' },
    { id: 4, service_type: 'walking', forecast_date: '2026-05-25', predicted_bookings: 42, confidence_score: 96, season: 'Monsoon Kickoff' },
    { id: 5, service_type: 'walking', forecast_date: '2026-05-30', predicted_bookings: 31, confidence_score: 91, season: 'Weekend Moderate' },
    { id: 6, service_type: 'vet', forecast_date: '2026-05-25', predicted_bookings: 18, confidence_score: 89, season: 'Stable Routine' },
    { id: 7, service_type: 'vet', forecast_date: '2026-05-30', predicted_bookings: 22, confidence_score: 92, season: 'Weekend Incident' },
  ];

  const notifications = [
    { id: 1, user_id: 1, message: '🎉 Your booking at Paws & Stay by the Sea is confirmed for Luna!', is_read: false, created_at: '2026-05-23 10:00:00' },
    { id: 2, user_id: 1, message: '🥣 Weekly Custom Vet-approved meal schedule of Royal Canin is dispatched!', is_read: true, created_at: '2026-05-21 08:30:00' },
  ];

  // Save everything to localStorage
  const dbState: DbState = {
    users,
    pets,
    pet_profiles,
    services: INITIAL_SERVICES,
    service_providers: INITIAL_PROVIDERS,
    bookings,
    orders,
    reviews,
    payments,
    recommendations,
    analytics_events,
    user_segments,
    demand_forecasts,
    locations: INITIAL_LOCATIONS,
    notifications
  };

  localStorage.setItem('petpal_db_state', JSON.stringify(dbState));
  localStorage.setItem('petpal_db_seeded', 'true');
}

export function getDbState(): DbState {
  initDatabase();
  const raw = localStorage.getItem('petpal_db_state');
  if (!raw) {
    // If somehow missing after init, re-trigger
    localStorage.removeItem('petpal_db_seeded');
    initDatabase();
    return JSON.parse(localStorage.getItem('petpal_db_state') || '{}');
  }
  return JSON.parse(raw);
}

export function saveDbState(state: DbState) {
  localStorage.setItem('petpal_db_state', JSON.stringify(state));
}

// Helper query function representing customized parser
// Matches SQL syntax SELECT ... FROM table ...
export function executeSql(sql: string): { success: boolean; data?: any[]; columns?: string[]; error?: string } {
  try {
    const db = getDbState();
    let normalized = sql.replace(/\s+/g, ' ').trim();
    
    // Check for comment rows or multi-commands - take only first statement
    normalized = normalized.split(';')[0].trim();
    
    // 1. Basic parser matching
    const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_\.]+)\s*=\s*([a-zA-Z0-9_\.]+))?(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;
    const match = normalized.match(selectRegex);

    if (!match) {
      // Return beautiful errors
      return {
        success: false,
        error: `Syntax Error: Supported SQL syntax contains SELECT [fields] FROM [table] (JOIN [tbl] ON a.id = b.id) (WHERE filtered_expr) (GROUP BY col) (ORDER BY col [ASC|DESC]) (LIMIT n)`
      };
    }

    const selectColsRaw = match[1];
    const primaryTable = match[2].toLowerCase().trim();
    const joinTable = match[3] ? match[3].toLowerCase().trim() : null;
    const joinCol1 = match[4] ? match[4].trim() : null;
    const joinCol2 = match[5] ? match[5].trim() : null;
    const whereClause = match[6] ? match[6].trim() : null;
    const groupByCol = match[7] ? match[7].trim() : null;
    const orderByCol = match[8] ? match[8].trim() : null;
    const limitVal = match[9] ? parseInt(match[9].trim(), 10) : null;

    if (!(primaryTable in db)) {
      return { success: false, error: `Table '${primaryTable}' not found in relational schema.` };
    }

    let sourceRows = [...db[primaryTable as keyof DbState]];

    // 2. Process joins (supports single join)
    if (joinTable) {
      if (!(joinTable in db)) {
        return { success: false, error: `Joined Table '${joinTable}' not found in database.` };
      }
      const joinRows = db[joinTable as keyof DbState];
      const joinedResult: any[] = [];

      sourceRows.forEach((row1) => {
        joinRows.forEach((row2) => {
          // evaluate physical join expression, e.g. bookings.pet_id = pets.id
          const getVal = (objRow: any, tblName: string, fieldExpr: string) => {
            const parts = fieldExpr.split('.');
            if (parts.length > 1) {
              if (parts[0].toLowerCase() === tblName) return objRow[parts[1]];
            } else {
              if (fieldExpr in objRow) return objRow[fieldExpr];
            }
            return undefined;
          };

          const v1 = getVal(row1, primaryTable, joinCol1!);
          const v2 = getVal(row2, joinTable, joinCol2!);

          if (v1 !== undefined && v2 !== undefined && String(v1) === String(v2)) {
            // merge row attributes
            const merged: Record<string, any> = {};
            // prefix properties with table name to bypass key collisions
            Object.entries(row1).forEach(([k, v]) => {
              merged[k] = v;
              merged[`${primaryTable}.${k}`] = v;
            });
            Object.entries(row2).forEach(([k, v]) => {
              merged[k] = v;
              merged[`${joinTable}.${k}`] = v;
            });
            joinedResult.push(merged);
          }
        });
      });
      sourceRows = joinedResult;
    } else {
      // standard field mapping prefixes
      sourceRows = sourceRows.map(row => {
        const mapped: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => {
          mapped[k] = v;
          mapped[`${primaryTable}.${k}`] = v;
        });
        return mapped;
      });
    }

    // 3. Filter WHERE clause
    if (whereClause) {
      sourceRows = sourceRows.filter(row => {
        // supports: col = val, col > val, col < val, col LIKE val, col != val
        const parseCondition = (cond: string) => {
          const ops = ['!=', '>=', '<=', '=', '>', '<', 'LIKE'];
          for (const op of ops) {
            if (cond.includes(op)) {
              const parts = cond.split(op);
              return {
                left: parts[0].trim(),
                op,
                right: parts[1].trim().replace(/^['"]|['"]$/g, '') // remove quotes
              };
            }
          }
          return null;
        };

        // Support optional AND grouping in WHERE
        const conditions = whereClause.split(/\s+AND\s+/i);
        return conditions.every(cStr => {
          const parsed = parseCondition(cStr);
          if (!parsed) return true;
          
          let leftVal = row[parsed.left];
          if (leftVal === undefined) {
            // check dot expr, booking.status
            const cleanLeft = parsed.left.replace(/\s+/g, '');
            leftVal = row[cleanLeft];
          }
          const rightVal = parsed.right;

          if (leftVal === undefined) return false;

          switch (parsed.op) {
            case '=': return String(leftVal).toLowerCase() === String(rightVal).toLowerCase();
            case '!=': return String(leftVal).toLowerCase() !== String(rightVal).toLowerCase();
            case '>': return Number(leftVal) > Number(rightVal);
            case '<': return Number(leftVal) < Number(rightVal);
            case '>=': return Number(leftVal) >= Number(rightVal);
            case '<=': return Number(leftVal) <= Number(rightVal);
            case 'LIKE': {
              const regexStr = rightVal.replace(/%/g, '.*');
              return new RegExp(`^${regexStr}$`, 'i').test(String(leftVal));
            }
            default: return false;
          }
        });
      });
    }

    // 4. GROUP BY / Aggregations
    let finalRows: any[] = [];
    const isAggregating = selectColsRaw.includes('COUNT(') || selectColsRaw.includes('SUM(') || selectColsRaw.includes('AVG(');

    if (groupByCol || isAggregating) {
      const groups: Record<string, any[]> = {};
      
      const cleanGroupKey = groupByCol ? groupByCol.replace(/\s+/g, '') : 'all';

      sourceRows.forEach(row => {
        const val = cleanGroupKey === 'all' ? 'all' : (row[cleanGroupKey] !== undefined ? row[cleanGroupKey] : 'Unknown');
        const gKey = String(val);
        if (!groups[gKey]) groups[gKey] = [];
        groups[gKey].push(row);
      });

      // Map grouped items to output rows
      Object.entries(groups).forEach(([groupVal, rowsInGroup]) => {
        const outputRow: Record<string, any> = {};
        if (groupByCol) {
          outputRow[cleanGroupKey] = groupVal;
          // supporting table-prefixed grouping columns
          const lastField = cleanGroupKey.split('.').pop()!;
          outputRow[lastField] = groupVal;
        }

        // support aggregating columns: COUNT(*), SUM(amount), AVG(rating), COUNT(id)
        const cols = selectColsRaw.split(',');
        cols.forEach(colExpr => {
          const colClean = colExpr.trim();
          const colLower = colClean.toLowerCase();

          // alias AS mapping
          let alias = colClean;
          let expression = colClean;
          const asMatch = colClean.match(/(.+?)\s+as\s+(.+)/i);
          if (asMatch) {
            expression = asMatch[1].trim();
            alias = asMatch[2].trim().replace(/^['"]|['"]$/g, '');
          }

          const exprLower = expression.toLowerCase();

          if (exprLower === 'count(*)' || exprLower.startsWith('count(')) {
            outputRow[alias] = rowsInGroup.length;
          } else if (exprLower.startsWith('sum(')) {
            const field = expression.substring(4, expression.length - 1).trim();
            const sumVal = rowsInGroup.reduce((acc, curr) => {
              const v = Number(curr[field] !== undefined ? curr[field] : curr[field.split('.').pop()!]);
              return acc + (isNaN(v) ? 0 : v);
            }, 0);
            outputRow[alias] = sumVal;
          } else if (exprLower.startsWith('avg(')) {
            const field = expression.substring(4, expression.length - 1).trim();
            const count = rowsInGroup.length;
            const sumVal = rowsInGroup.reduce((acc, curr) => {
              const v = Number(curr[field] !== undefined ? curr[field] : curr[field.split('.').pop()!]);
              return acc + (isNaN(v) ? 0 : v);
            }, 0);
            outputRow[alias] = count > 0 ? Number((sumVal / count).toFixed(2)) : 0;
          } else {
            // standard grouping indicator column
            if (expression === groupByCol) {
              outputRow[alias] = groupVal;
            } else {
              // take it from the first row of group as placeholder
              const firstRow = rowsInGroup[0] || {};
              outputRow[alias] = firstRow[expression] !== undefined ? firstRow[expression] : firstRow[expression.split('.').pop()!];
            }
          }
        });

        finalRows.push(outputRow);
      });
    } else {
      // 5. Standard mapping of non-grouped columns
      const selectParts = selectColsRaw.split(',');
      if (selectColsRaw.trim() === '*') {
        finalRows = sourceRows.map(row => {
          // Flatten to avoid prefix clutter for standard views
          const flatRow: Record<string, any> = {};
          Object.entries(row).forEach(([k, v]) => {
            if (!k.includes('.')) flatRow[k] = v;
          });
          return flatRow;
        });
      } else {
        finalRows = sourceRows.map(row => {
          const flatRow: Record<string, any> = {};
          selectParts.forEach(colPart => {
            let colExpr = colPart.trim();
            let alias = colExpr;
            
            const asMatch = colExpr.match(/(.+?)\s+as\s+(.+)/i);
            if (asMatch) {
              colExpr = asMatch[1].trim();
              alias = asMatch[2].trim().replace(/^['"]|['"]$/g, '');
            }

            let value = row[colExpr];
            if (value === undefined) {
              // try dot representation
              value = row[colExpr.split('.').pop()!];
            }
            flatRow[alias] = value !== undefined ? value : null;
          });
          return flatRow;
        });
      }
    }

    // 6. Sort ORDER BY
    if (orderByCol) {
      const orderParts = orderByCol.trim().split(/\s+/);
      const sortField = orderParts[0].trim();
      const sortFieldClean = sortField.split('.').pop()!;
      const isDesc = orderParts[1] && orderParts[1].toUpperCase() === 'DESC';

      finalRows.sort((a, b) => {
        let vA = a[sortField] !== undefined ? a[sortField] : a[sortFieldClean];
        let vB = b[sortField] !== undefined ? b[sortField] : b[sortFieldClean];

        if (vA === undefined || vA === null) return 1;
        if (vB === undefined || vB === null) return -1;

        if (typeof vA === 'string' && typeof vB === 'string') {
          return isDesc ? vB.localeCompare(vA) : vA.localeCompare(vB);
        } else {
          return isDesc ? Number(vB) - Number(vA) : Number(vA) - Number(vB);
        }
      });
    }

    // 7. Limit results
    if (limitVal !== null) {
      finalRows = finalRows.slice(0, limitVal);
    }

    // Capture column headers for grid table rendering
    const columns = finalRows.length > 0 ? Object.keys(finalRows[0]) : [];

    return {
      success: true,
      data: finalRows,
      columns
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Execution Error: ${err.message}`
    };
  }
}

// 10 Requested Resume-Ready Analytical Predefined SQL Queries
export const REPORT_SQL_QUERIES = {
  bookingTrends: {
    title: 'Booking Trends (Aggregate Logs)',
    sql: `SELECT booking_date, COUNT(*) as bookings_count, SUM(amount) as daily_revenue FROM bookings GROUP BY booking_date ORDER BY booking_date DESC`,
    description: 'Tracks overall booking frequencies and aggregate volume over dates.'
  },
  monthlyRevenue: {
    title: 'Monthly Revenue Generated',
    sql: `SELECT payment_method, COUNT(*) as transactions_count, SUM(amount) as method_total FROM payments WHERE status = 'success' GROUP BY payment_method ORDER BY method_total DESC`,
    description: 'Computes monetary performance aggregated by transactional gateways.'
  },
  topRatedProviders: {
    title: 'Top Rated Service Providers',
    sql: `SELECT service_providers.name, service_providers.rating, COUNT(reviews.id) as reviews_received FROM service_providers JOIN reviews ON reviews.provider_id = service_providers.id GROUP BY service_providers.name ORDER BY service_providers.rating DESC LIMIT 5`,
    description: 'Extracts elite caregivers backed by cumulative community validation.'
  },
  popularServicesByLocation: {
    title: 'Popular Services by Location',
    sql: `SELECT city, service_type, COUNT(*) as booking_count FROM bookings JOIN service_providers ON bookings.provider_id = service_providers.id GROUP BY city, service_type ORDER BY booking_count DESC`,
    description: 'Demographics analyzer locating hyper-performing segments by city.'
  },
  repeatUsers: {
    title: 'High Engagement Repeat Users',
    sql: `SELECT segment_name, COUNT(*) as user_count, SUM(total_spent) as segment_revenue FROM user_segments GROUP BY segment_name ORDER BY segment_revenue DESC`,
    description: 'Isolates customer retention ratios and cashflow vectors per user tier.'
  },
  cancellationAnalysis: {
    title: 'Booking Cancellation Rates',
    sql: `SELECT status, COUNT(*) as count, SUM(amount) as lost_or_locked_valuation FROM bookings GROUP BY status ORDER BY count DESC`,
    description: 'System health check detecting friction patterns and booking churn.'
  },
  petBreedDistribution: {
    title: 'Pet Breed & Category Distribution',
    sql: `SELECT breed, type, COUNT(*) as count FROM pets GROUP BY breed ORDER BY count DESC`,
    description: 'Analytics for market demands pointing which pet classes require targeted campaigns.'
  },
  demandByWeekday: {
    title: 'Weekday vs Weekend Demand Load',
    sql: `SELECT forecast_date, predicted_bookings, confidence_score, season FROM demand_forecasts ORDER BY predicted_bookings DESC`,
    description: 'Time Series Predictive demands showing high loads expected for upcoming events.'
  },
  serviceWiseRevenue: {
    title: 'Service-Wise Revenue Share',
    sql: `SELECT service_type, COUNT(*) as volume, SUM(amount) as partition_total FROM bookings WHERE status = 'completed' GROUP BY service_type ORDER BY partition_total DESC`,
    description: 'Breakdown of service performances driving business growth.'
  },
  foodPurchasePatterns: {
    title: 'Custom Pet Food Order Segments',
    sql: `SELECT product_name, status, COUNT(*) as occurrences, SUM(amount) as order_valuation FROM orders GROUP BY product_name ORDER BY order_valuation DESC`,
    description: 'Food product analytics charting brand segments and supply chains.'
  }
};

// 1. ML FEATURE: Pet Food Recommendation Engine
export interface FoodRecInput {
  breed: string;
  age: number;
  weight: number;
  size: 'Small' | 'Medium' | 'Large';
  allergies: string;
  activity_level: 'Low' | 'Moderate' | 'High';
  budget: 'Budget' | 'Moderate' | 'Premium';
}

export interface FoodRecOutput {
  brand: string;
  rating: number;
  price: number;
  matchScore: number;
  weeklyServingGrams: number;
  rationale: string;
  dailyCaloriesKcal: number;
}

export function calculateFoodRecommendation(input: FoodRecInput): FoodRecOutput[] {
  const db = getDbState();
  const rawProviders = db.service_providers.filter(p => p.service_id === 2); // food subscription category

  // Basic calorie calculator algorithm for pets (Dog/Cat standard RER)
  // RER = 70 * (weightin kg)^0.75
  const rer = Math.round(70 * Math.pow(input.weight, 0.75));
  let activityFactor = 1.2;
  if (input.activity_level === 'Moderate') activityFactor = 1.4;
  if (input.activity_level === 'High') activityFactor = 1.8;
  const der = Math.round(rer * activityFactor); // Daily Energy Requirement

  // Map to find the best provider recommendation from service_providers
  return rawProviders.map((provider) => {
    let baseScore = 70; // starts at 70%

    // 1. Budget alignment
    if (input.budget === 'Premium' && provider.price_per_unit >= 3000) baseScore += 15;
    else if (input.budget === 'Moderate' && provider.price_per_unit >= 2000 && provider.price_per_unit < 3000) baseScore += 15;
    else if (input.budget === 'Budget' && provider.price_per_unit < 2000) baseScore += 15;
    else baseScore -= 5; // moderate penalty

    // 2. Allergy/diet safety mapping
    const tags = provider.compatibility_tags.map(t => t.toLowerCase());
    const queryAllergy = input.allergies.toLowerCase();
    
    if (queryAllergy !== 'none' && queryAllergy !== '' && tags.includes('allergies')) {
      baseScore += 10;
    } else if (queryAllergy === 'none' || queryAllergy === '') {
      baseScore += 5;
    }

    // 3. Size alignment
    const querySize = input.size.toLowerCase();
    if (tags.includes(`${querySize} dogs`) || tags.includes('all sizes')) {
      baseScore += 10;
    }

    // 4. Provider rating addition
    baseScore += Math.round((provider.rating - 4.0) * 10);

    // Limit score margins [0 - 100]
    const matchScore = Math.max(0, Math.min(100, baseScore));

    // Calculate portions dynamically: average dog/cat food has about 350 kcal per 100g
    const dailyGrams = Math.round((der / 350) * 100);
    const weeklyServingGrams = dailyGrams * 7;

    let allergenNote = input.allergies !== 'None' ? `, hypo-allergenic safe for ${input.allergies}` : '';
    let rationale = `Specially selected for ${input.breed}. Formulated to supply ${der} daily kcal based on ${input.activity_level.toLowerCase()} activity level${allergenNote}. Fits your ${input.budget.toLowerCase()} budget bracket perfectly.`;

    return {
      brand: provider.name,
      rating: provider.rating,
      price: provider.price_per_unit,
      matchScore,
      weeklyServingGrams,
      rationale,
      dailyCaloriesKcal: der
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// 2. ML FEATURE: Service Matching System
export function calculateServiceCompatibility(pet: any, provider: any): { score: number; reasons: string[] } {
  let score = 75; // baseline rating
  const reasons: string[] = [];

  // Compatibility rules:
  // Match Location / City
  if (provider.city && pet.owner_id) {
    const db = getDbState();
    const owner = db.users.find(u => u.id === pet.owner_id);
    if (owner && owner.city.toLowerCase() === provider.city.toLowerCase()) {
      score += 10;
      reasons.push(`Caregiver is physically located in your city (${provider.city}).`);
    } else {
      score -= 5;
    }
  }

  // Match Temperament & Compatibility tags
  const tags = (provider.compatibility_tags || []).map((t: string) => t.toLowerCase());
  const petTemperament = (pet.temperament || 'Friendly').toLowerCase();
  
  if (tags.includes(petTemperament)) {
    score += 12;
    reasons.push(`Provider is experienced with '${pet.temperament}' pet temperaments.`);
  }

  // Size Match
  const petSize = (pet.size || 'Medium').toLowerCase();
  if (tags.includes(`${petSize} dogs`) || tags.includes('all sizes')) {
    score += 8;
    reasons.push(`Provider facility is designed to host ${pet.size}-sized pets comfortably.`);
  }

  // High activity Match
  if (pet.activity_level === 'High' && tags.includes('high activity')) {
    score += 10;
    reasons.push('High-intensity routines match your pet s high physical energy profile.');
  }

  // Safe checks for behavior
  if (petTemperament === 'anxious' && tags.includes('anxious pets')) {
    score += 15;
    reasons.push('Provider offers isolated, low-stress, quiet accommodation perfect for anxious pets.');
  } else if (petTemperament === 'anxious') {
    score -= 10;
    reasons.push('This provider does not explicitly detail low-stress environments for anxious pets.');
  }

  // Cap matching index to maximum 100 and minimum 40
  score = Math.max(40, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push('General suitability matching based on caregiver standards and reviews.');
  }

  return { score, reasons };
}

// 3. ML FEATURE: Customer Segmentation & Churn Engine
export interface UserChurnInsight {
  userId: number;
  name: string;
  email: string;
  segmentName: string;
  totalSpent: number;
  totalBookings: number;
  daysSinceLastActive: number;
  churnRisk: 'High' | 'Medium' | 'Low';
  riskScore: number; // 0 - 100
  recommendedAction: string;
}

export function calculateChurnInsights(): UserChurnInsight[] {
  const db = getDbState();
  const currentDate = new Date('2026-05-23'); // Standard Anchor system dates

  return db.users.map(user => {
    // find segment profile
    const segment = db.user_segments.find(s => s.user_id === user.id) || {
      segment_name: 'Occasional Users',
      total_bookings: 0,
      total_spent: 0,
      last_active: user.created_at.split(' ')[0]
    };

    const lastActiveDate = new Date(segment.last_active);
    const diffTime = Math.abs(currentDate.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Rule-based classification algorithm
    let riskScore = 15; // baseline index
    
    // Add weights according to inactivity days
    if (diffDays > 30) riskScore += 45;
    else if (diffDays > 14) riskScore += 25;
    else riskScore -= 5;

    // Add weights indicating booking patterns
    if (segment.total_bookings === 0) riskScore += 20;
    else if (segment.total_bookings === 1) riskScore += 10;
    else riskScore -= 10;

    const risk = Math.max(0, Math.min(100, riskScore));

    let churnRisk: 'High' | 'Medium' | 'Low' = 'Low';
    let recommendedAction = 'Engage with weekly newsletter and newly added local walking providers.';
    
    if (risk >= 60) {
      churnRisk = 'High';
      recommendedAction = '⚠️ Send automated high-value promo code (30% off boarding) and SMS reminder.';
    } else if (risk >= 30) {
      churnRisk = 'Medium';
      recommendedAction = '📧 Prompt customer with personalized pet food refill reminder.';
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      segmentName: segment.segment_name,
      totalSpent: segment.total_spent,
      totalBookings: segment.total_bookings,
      daysSinceLastActive: diffDays,
      churnRisk,
      riskScore: risk,
      recommendedAction
    };
  });
}
