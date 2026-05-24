import type { Service, Testimonial, TeamMember, CommunityPost, Host, Trainer, CommunityEvent, PlaydateProfile, AdoptablePet } from './types';
import { HomeIcon, HeartIcon, UserGroupIcon, MapPinIcon, CalendarIcon, SparklesIcon, PuzzlePieceIcon } from './components/icons/ServiceIcons';

export const SERVICES: Service[] = [
  { icon: HomeIcon, title: 'Temporary Pet Hosting', description: 'Safe and loving homes for your pet while you\'re away.', pageLink: 'hosting' },
  { icon: HeartIcon, title: 'Custom Pet Food', description: 'Subscription-based, tailor-made meals for your pet\'s diet.', pageLink: 'food' },
  { icon: UserGroupIcon, title: 'Trainer & Walker Booking', description: 'Book certified professionals for training and daily walks.', pageLink: 'training' },
  { icon: MapPinIcon, title: 'Nearby Vet Finder', description: 'Quickly locate and contact veterinarians near you.', pageLink: 'vets' },
  { icon: CalendarIcon, title: 'Pet Community Events', description: 'Join local meetups, workshops, and fun events for pets.', pageLink: 'events' },
  { icon: SparklesIcon, title: 'Playdate Matching', description: 'Find compatible furry friends for your pet to socialize with.', pageLink: 'playdates' },
  { icon: PuzzlePieceIcon, title: 'Pet Adoption Portal', description: 'Connect with local shelters to find your new best friend.', pageLink: 'adoption' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Finding a reliable sitter for Bruno in Bangalore used to be a nightmare. With PetPal, we found a perfect host family in Koramangala in minutes!",
    author: 'Priya & Rohan',
    pet: 'Bruno the Beagle',
    rating: 5,
    avatarUrl: 'https://picsum.photos/id/1025/100/100',
  },
  {
    quote: "The custom food plan from Drools has done wonders for Luna's coat. The monthly delivery to our flat in Delhi is so convenient!",
    author: 'Amit Singh',
    pet: 'Luna the Cat',
    rating: 5,
    avatarUrl: 'https://picsum.photos/id/237/100/100',
  },
  {
    quote: "We joined the Mumbai Pet Carnival through the app and met so many wonderful people. It feels like a real family.",
    author: 'Aisha Khan',
    pet: 'Rocky the Retriever',
    rating: 5,
    avatarUrl: 'https://picsum.photos/id/1062/100/100',
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
    { name: 'Aarav Sharma', role: 'Founder & CEO', imageUrl: 'https://picsum.photos/seed/aarav/300/300' },
    { name: 'Isha Patel', role: 'Head of Pet Care', imageUrl: 'https://picsum.photos/seed/isha/300/300' },
    { name: 'Dr. Vikram Rao', role: 'Lead Veterinarian Consultant', imageUrl: 'https://picsum.photos/seed/vikram/300/300' },
    { name: 'Diya Mehta', role: 'Community Manager', imageUrl: 'https://picsum.photos/seed/diya/300/300' },
    { name: 'Rohan Gupta', role: 'Lead Software Engineer', imageUrl: 'https://picsum.photos/seed/rohan/300/300' },
    { name: 'Fatima Ansari', role: 'UX/UI Designer', imageUrl: 'https://picsum.photos/seed/fatima/300/300' },
    { name: 'Siddharth Kumar', role: 'Marketing Director', imageUrl: 'https://picsum.photos/seed/siddharth/300/300' },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
    {
        author: 'Anjali Desai',
        avatarUrl: 'https://picsum.photos/seed/anjali/100/100',
        content: 'Had an amazing time at the Cubbon Park dog meetup today! So many happy pups. Can’t wait for the next one in Bangalore!',
        imageUrl: 'https://picsum.photos/seed/cubbon/600/400',
        timestamp: '2 hours ago',
    },
    {
        author: 'Karan Malhotra',
        avatarUrl: 'https://picsum.photos/seed/karan/100/100',
        content: 'Does anyone have recommendations for a good groomer in South Delhi? My boy Sheru needs a trim!',
        timestamp: '5 hours ago',
    },
    {
        author: 'CUPA Bangalore',
        avatarUrl: 'https://picsum.photos/seed/cupa/100/100',
        content: 'Adoption Alert! Meet Rani, a sweet 2-year-old Indie looking for her forever home. She loves cuddles and long walks. Visit our portal to learn more!',
        imageUrl: 'https://picsum.photos/seed/rani/600/400',
        timestamp: '1 day ago',
    }
];

export const HOSTS: Host[] = [
    { id: 1, name: 'Paws & Stay by the Sea', location: 'Bandra, Mumbai', pricePerDayInr: 800, rating: 4.9, reviewCount: 128, imageUrl: 'https://picsum.photos/seed/host1/600/400', description: 'A loving apartment with a sea-view balcony, perfect for small dogs. We have a friendly resident cocker spaniel.' },
    { id: 2, name: 'The Pet Haven Garden Home', location: 'Indiranagar, Bangalore', pricePerDayInr: 1000, rating: 5.0, reviewCount: 92, imageUrl: 'https://picsum.photos/seed/host2/600/400', description: 'A spacious home with a large, secure garden. Ideal for energetic dogs who love to play.' },
    { id: 3, name: 'Happy Homes for Pets', location: 'Saket, Delhi', pricePerDayInr: 700, rating: 4.8, reviewCount: 210, imageUrl: 'https://picsum.photos/seed/host3/600/400', description: 'We\'re a family of four who adore pets. Your furry friend will get plenty of walks, cuddles, and home-cooked meals.' },
];

export const TRAINERS: Trainer[] = [
    { id: 1, name: 'Rohit Sharma', specialties: ['Puppy Training', 'Obedience'], rating: 5.0, pricePerSessionInr: 700, imageUrl: 'https://picsum.photos/seed/trainer1/300/300' },
    { id: 2, name: 'Simran Kaur', specialties: ['Pet Walking', 'Socialization'], rating: 4.9, pricePerSessionInr: 300, imageUrl: 'https://picsum.photos/seed/trainer2/300/300' },
    { id: 3, name: 'Arjun Nair', specialties: ['Behavioral Issues', 'Agility'], rating: 4.8, pricePerSessionInr: 850, imageUrl: 'https://picsum.photos/seed/trainer3/300/300' },
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
    { id: 1, title: 'PetFed India Delhi 2025', date: 'Sat, Nov 30 @ 11:00 AM', location: 'NSIC Grounds, Okhla', imageUrl: 'https://picsum.photos/seed/event1/600/400', description: 'Join India\'s biggest pet festival! Fun activities, competitions, and stalls for you and your furry friend.' },
    { id: 2, title: 'Mumbai Pet Carnival', date: 'Sun, Dec 15 @ 10:00 AM', location: 'MMRDA Grounds, BKC', imageUrl: 'https://picsum.photos/seed/event2/600/400', description: 'A fun-filled day for pets and their parents with games, food, and an adoption drive.' },
    { id: 3, title: 'Bangalore PawFest 2026', date: 'Sat, Jan 10 @ 11:00 AM', location: 'Jaymahal Palace Grounds', imageUrl: 'https://picsum.photos/seed/event3/600/400', description: 'Meet adorable, adoptable pets from local shelters. You might just find your new best friend.' },
];

export const PLAYDATE_PROFILES: PlaydateProfile[] = [
    { id: 1, name: 'Bruno', age: 3, breed: 'Golden Retriever', temperament: 'Friendly & Energetic', imageUrl: 'https://picsum.photos/seed/max/400/500', location: 'Pune' },
    { id: 2, name: 'Milo', age: 2, breed: 'Indie', temperament: 'Playful & Cuddly', imageUrl: 'https://picsum.photos/seed/bella/400/500', location: 'Delhi' },
    { id: 3, name: 'Snowy', age: 5, breed: 'Persian Cat', temperament: 'Calm & Curious', imageUrl: 'https://picsum.photos/seed/charlie/400/500', location: 'Mumbai' },
];

export const ADOPTABLE_PETS: AdoptablePet[] = [
    { id: 1, name: 'Rani', age: '2 years', breed: 'Indie', gender: 'Female', imageUrl: 'https://picsum.photos/seed/buddy/600/400', shelter: 'CUPA Bangalore', adoptionFeeInr: 0 },
    { id: 2, name: 'Leo', age: '1 year', breed: 'Labrador', gender: 'Male', imageUrl: 'https://picsum.photos/seed/lucy/600/400', shelter: 'World For All, Mumbai', adoptionFeeInr: 2000 },
    { id: 3, name: 'Minnie', age: '3 years', breed: 'Domestic Cat', gender: 'Female', imageUrl: 'https://picsum.photos/seed/oscar/600/400', shelter: 'Friendicoes, Delhi', adoptionFeeInr: 1000 },
    { id: 4, name: 'Sheru', age: '4 years', breed: 'German Shepherd Mix', gender: 'Male', imageUrl: 'https://picsum.photos/seed/misty/600/400', shelter: 'Blue Cross of India, Chennai', adoptionFeeInr: 500 },
];