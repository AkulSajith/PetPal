import bcrypt from 'bcryptjs';
import { prisma } from './client.js';

const dt = (value) => new Date(value);

const users = [
  ['Aarav Sharma', 'aarav@petpal.com', 'OWNER', 'Bengaluru'],
  ['Isha Patel', 'isha@petpal.com', 'OWNER', 'Mumbai'],
  ['Kabir Mehta', 'kabir@petpal.com', 'OWNER', 'Delhi'],
  ['Diya Rao', 'diya@petpal.com', 'OWNER', 'Pune'],
  ['Rohan Gupta', 'rohan@petpal.com', 'CARETAKER', 'Bengaluru'],
  ['Fatima Ansari', 'fatima@petpal.com', 'TRAINER', 'Mumbai'],
  ['Siddharth Kumar', 'siddharth@petpal.com', 'TRAINER', 'Delhi'],
  ['Naina Thomas', 'naina@petpal.com', 'TRAINER', 'Pune'],
  ['Vikram Iyer', 'vikram@petpal.com', 'TRAINER', 'Chennai'],
  ['Admin User', 'admin@petpal.com', 'ADMIN', 'Bengaluru'],
];

const pets = [
  [1, 'Bruno', 'Beagle', 3, 'Mild chicken allergy'],
  [1, 'Rocky', 'Golden Retriever', 4, 'High activity, gluten sensitive'],
  [2, 'Luna', 'Persian Cat', 2, 'Hairball management required'],
  [2, 'Milo', 'Indie Dog', 5, 'Vaccinated and sterilized'],
  [3, 'Sheru', 'German Shepherd Mix', 4, 'Anxious around loud traffic'],
  [3, 'Snowy', 'Rabbit', 1, 'Teeth scaling due in winter'],
  [4, 'Coco', 'Labrador', 6, 'Hip support diet'],
  [4, 'Minnie', 'Domestic Cat', 3, 'No known issues'],
  [5, 'Toffee', 'Cocker Spaniel', 2, 'Ear cleaning every month'],
  [5, 'Bella', 'Pug', 5, 'Heat sensitive'],
  [6, 'Max', 'Husky', 3, 'High exercise needs'],
  [7, 'Rani', 'Indie', 2, 'Recently adopted'],
  [8, 'Leo', 'Labrador', 1, 'Puppy training ongoing'],
  [9, 'Oscar', 'Boxer', 4, 'Grain-free food'],
  [10, 'Simba', 'Maine Coon', 2, 'Needs grooming'],
];

const trainers = [
  [1, 'Puppy Training', 4],
  [2, 'Obedience', 6],
  [3, 'Dog Walking', 3],
  [4, 'Agility', 5],
  [5, 'Boarding Care', 7],
  [6, 'Behavior Correction', 8],
  [7, 'Leash Training', 5],
  [8, 'Socialization', 4],
  [9, 'Senior Pet Fitness', 6],
  [10, 'Cat Enrichment', 3],
];

async function resetSequences() {
  const tables = ['users', 'pets', 'bookings', 'trainers', 'vets', 'pet_events', 'pet_food_subscriptions', 'rating_reviews', 'notifications'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`);
  }
}

async function main() {
  await prisma.$transaction([
    prisma.petFoodSubscription.deleteMany(),
    prisma.ratingReview.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.analyticsEvent.deleteMany(),
    prisma.recommendation.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.order.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.userSegment.deleteMany(),
    prisma.petProfile.deleteMany(),
    prisma.trainer.deleteMany(),
    prisma.vet.deleteMany(),
    prisma.petEvent.deleteMany(),
    prisma.pet.deleteMany(),
    prisma.serviceProvider.deleteMany(),
    prisma.service.deleteMany(),
    prisma.location.deleteMany(),
    prisma.user.deleteMany(),
    prisma.demandForecast.deleteMany(),
  ]);

  const hashedPassword = await bcrypt.hash('password123', 12);

  await prisma.user.createMany({
    data: users.map(([name, email, role, location], index) => ({
      id: index + 1,
      name,
      email,
      password: hashedPassword,
      role,
      location,
      city: location,
      petType: 'Dog',
    })),
  });

  await prisma.pet.createMany({
    data: pets.map(([ownerId, name, breed, age, medicalNotes], index) => ({
      id: index + 1,
      ownerId,
      name,
      breed,
      age,
      medicalNotes,
      type: breed === 'Rabbit' ? 'Other' : breed.includes('Cat') || breed.includes('Coon') ? 'Cat' : 'Dog',
      weight: 10 + index,
      size: index % 3 === 0 ? 'Large' : index % 3 === 1 ? 'Medium' : 'Small',
      temperament: index % 2 === 0 ? 'Friendly' : 'Calm',
      allergies: medicalNotes.includes('allergy') || medicalNotes.includes('Grain') ? medicalNotes : 'None',
      activityLevel: index % 2 === 0 ? 'High' : 'Moderate',
      budget: index % 3 === 0 ? 'Premium' : 'Moderate',
    })),
  });

  await prisma.trainer.createMany({
    data: trainers.map(([userId, specialization, experience], index) => ({
      id: index + 1,
      userId,
      specialization,
      experience,
    })),
  });

  await prisma.booking.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      userId: (index % 5) + 1,
      petId: (index % 10) + 1,
      serviceType: ['BOARDING', 'TRAINING', 'DOG_WALKING', 'VET'][index % 4],
      providerId: null,
      bookingDate: dt(`2026-06-${String(index + 1).padStart(2, '0')}T00:00:00Z`),
      status: ['CONFIRMED', 'PENDING', 'COMPLETED'][index % 3],
      amount: 600 + index * 250,
    })),
  });

  await prisma.vet.createMany({
    data: [
      { id: 1, name: 'Dr. Meera Nair', clinic: 'CureVets Hospital', location: 'Bengaluru', contact: '+91-90000-10001' },
      { id: 2, name: 'Dr. Arjun Shah', clinic: 'Tailwaggers Clinic', location: 'Mumbai', contact: '+91-90000-10002' },
      { id: 3, name: 'Dr. Kavya Menon', clinic: 'Apex Animal Care', location: 'Delhi', contact: '+91-90000-10003' },
      { id: 4, name: 'Dr. Rishi Kapoor', clinic: 'Pune Pet Wellness', location: 'Pune', contact: '+91-90000-10004' },
      { id: 5, name: 'Dr. Divya Krishnan', clinic: 'Blue Cross Vet Care', location: 'Chennai', contact: '+91-90000-10005' },
    ],
  });

  await prisma.petEvent.createMany({
    data: [
      { id: 1, title: 'Bengaluru PawFest', location: 'Bengaluru', date: dt('2026-06-15T00:00:00Z'), description: 'Community meetup with adoption stalls and agility games.' },
      { id: 2, title: 'Mumbai Pet Carnival', location: 'Mumbai', date: dt('2026-07-02T00:00:00Z'), description: 'Food, grooming, and playdate activities for pets.' },
      { id: 3, title: 'Delhi Vet Wellness Camp', location: 'Delhi', date: dt('2026-07-20T00:00:00Z'), description: 'Vaccination and wellness checks with verified vets.' },
      { id: 4, title: 'Pune Dog Walkathon', location: 'Pune', date: dt('2026-08-05T00:00:00Z'), description: 'Guided walkathon for dogs and pet parents.' },
      { id: 5, title: 'Chennai Adoption Day', location: 'Chennai', date: dt('2026-08-18T00:00:00Z'), description: 'Shelter-led adoption drive and pet care talks.' },
    ],
  });

  await prisma.petFoodSubscription.createMany({
    data: [
      { id: 1, petId: 1, foodType: 'Active Dog High Protein', deliveryFrequency: 'Weekly', customization: 'Gluten-safe formula for Beagle activity.' },
      { id: 2, petId: 3, foodType: 'Cat Hairball Control', deliveryFrequency: 'Bi-weekly', customization: 'Persian coat and hairball plan.' },
      { id: 3, petId: 7, foodType: 'Senior Joint Support', deliveryFrequency: 'Monthly', customization: 'Labrador senior hip support.' },
      { id: 4, petId: 9, foodType: 'Small Breed Digestive Care', deliveryFrequency: 'Weekly', customization: 'Cocker Spaniel ear-health omega blend.' },
      { id: 5, petId: 14, foodType: 'Grain Free Boxer Plan', deliveryFrequency: 'Weekly', customization: 'Grain-free high-energy recipe.' },
    ],
  });

  await prisma.ratingReview.createMany({
    data: [
      { id: 1, userId: 1, targetType: 'TRAINER', targetId: 1, rating: 5, comment: 'Excellent puppy training routine.' },
      { id: 2, userId: 2, targetType: 'TRAINER', targetId: 2, rating: 4, comment: 'Great obedience sessions.' },
      { id: 3, userId: 3, targetType: 'TRAINER', targetId: 4, rating: 5, comment: 'Agility work was structured and kind.' },
      { id: 4, userId: 4, targetType: 'CARETAKER', targetId: 1, rating: 5, comment: 'Very reliable caretaker.' },
      { id: 5, userId: 5, targetType: 'CARETAKER', targetId: 2, rating: 4, comment: 'Smooth boarding experience.' },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { id: 1, userId: 1, message: 'Booking confirmation: Bruno boarding is confirmed.', isRead: false },
      { id: 2, userId: 2, message: 'Upcoming event reminder: Mumbai Pet Carnival starts soon.', isRead: false },
      { id: 3, userId: 3, message: 'Subscription renewal reminder: Grain-free plan renews this week.', isRead: true },
    ],
  });

  await resetSequences();
  console.log('Phase 2 PetPal backend seed complete. Login with admin@petpal.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
