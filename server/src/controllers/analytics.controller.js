import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const toSeries = (record, keyName, valueName) => Object.entries(record)
  .map(([key, value]) => ({ [keyName]: key, [valueName]: value }));

export const dashboardSummary = asyncHandler(async (_req, res) => {
  const now = new Date();
  const [totalUsers, totalPets, totalBookings, activeTrainers, upcomingPetEvents, activeSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.pet.count(),
    prisma.booking.count(),
    prisma.trainer.count(),
    prisma.petEvent.count({ where: { date: { gte: now } } }),
    prisma.petFoodSubscription.count(),
  ]);

  res.json({
    data: {
      totalUsers,
      totalPets,
      totalBookings,
      activeTrainers,
      upcomingPetEvents,
      activeSubscriptions,
    },
  });
});

export const bookingTrends = asyncHandler(async (_req, res) => {
  const bookings = await prisma.booking.findMany({ select: { bookingDate: true, amount: true, serviceType: true } });
  const grouped = bookings.reduce((acc, booking) => {
    const month = monthKey(booking.bookingDate);
    if (!acc[month]) acc[month] = { month, bookings: 0, revenue: 0 };
    acc[month].bookings += 1;
    acc[month].revenue += booking.amount || 0;
    return acc;
  }, {});

  res.json({ data: Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month)) });
});

export const mostRequestedServices = asyncHandler(async (_req, res) => {
  const bookings = await prisma.booking.findMany({ select: { serviceType: true } });
  const data = toSeries(countBy(bookings, (booking) => booking.serviceType), 'serviceType', 'requests')
    .sort((a, b) => b.requests - a.requests);
  res.json({ data });
});

export const monthlyRegistrations = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ select: { createdAt: true } });
  const data = toSeries(countBy(users, (user) => monthKey(user.createdAt)), 'month', 'registrations')
    .sort((a, b) => a.month.localeCompare(b.month));
  res.json({ data });
});

export const petTypeDistribution = asyncHandler(async (_req, res) => {
  const pets = await prisma.pet.findMany({ select: { type: true } });
  res.json({ data: toSeries(countBy(pets, (pet) => pet.type), 'type', 'count') });
});

export const revenueEstimation = asyncHandler(async (_req, res) => {
  const [bookingRevenue, subscriptionCount] = await Promise.all([
    prisma.booking.aggregate({ _sum: { amount: true } }),
    prisma.petFoodSubscription.count(),
  ]);

  const subscriptionRevenueEstimate = subscriptionCount * 2200;
  res.json({
    data: {
      bookingRevenue: bookingRevenue._sum.amount || 0,
      subscriptionRevenueEstimate,
      totalEstimatedRevenue: (bookingRevenue._sum.amount || 0) + subscriptionRevenueEstimate,
    },
  });
});

export const activeSubscriptions = asyncHandler(async (_req, res) => {
  const subscriptions = await prisma.petFoodSubscription.findMany({
    include: { pet: { select: { type: true, breed: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const byFoodType = toSeries(countBy(subscriptions, (sub) => sub.foodType), 'foodType', 'subscriptions');
  const byPetType = toSeries(countBy(subscriptions, (sub) => sub.pet.type), 'petType', 'subscriptions');

  res.json({ data: { total: subscriptions.length, byFoodType, byPetType } });
});

export const insights = asyncHandler(async (_req, res) => {
  const [bookings, trainers, users] = await Promise.all([
    prisma.booking.findMany({ include: { user: true } }),
    prisma.trainer.findMany(),
    prisma.user.findMany({ include: { bookings: true } }),
  ]);

  const services = toSeries(countBy(bookings, (booking) => booking.serviceType), 'serviceType', 'count')
    .sort((a, b) => b.count - a.count);
  const locations = toSeries(countBy(bookings, (booking) => booking.user?.location || booking.user?.city), 'location', 'count')
    .sort((a, b) => b.count - a.count);
  const trainerCategories = toSeries(countBy(trainers, (trainer) => trainer.specialization), 'category', 'count')
    .sort((a, b) => b.count - a.count);
  const frequentUsers = users
    .filter((user) => user.bookings.length >= 2)
    .map((user) => ({ id: user.id, name: user.name, bookings: user.bookings.length }));

  const topService = services[0]?.serviceType || 'pet care';
  const topLocation = locations[0]?.location || 'your active cities';
  const topTrainerCategory = trainerCategories[0]?.category || 'obedience';

  res.json({
    data: [
      `${topService} demand is currently the strongest booking category.`,
      `Most popular trainer category: ${topTrainerCategory}.`,
      `Most active location: ${topLocation}.`,
      `${frequentUsers.length} users have frequent bookings and are good loyalty-campaign candidates.`,
    ],
  });
});

export const adminDashboard = asyncHandler(async (_req, res) => {
  const [summary, bookings, services, registrations, pets, revenue, subscriptions, insightRows] = await Promise.all([
    getSummaryData(),
    getBookingTrendData(),
    getServiceData(),
    getRegistrationData(),
    getPetTypeData(),
    getRevenueData(),
    getSubscriptionData(),
    getInsightData(),
  ]);

  res.json({
    data: {
      summary,
      charts: {
        bookingTrends: bookings,
        servicePopularity: services,
        userGrowth: registrations,
        petTypeDistribution: pets,
        subscriptionInsights: subscriptions,
      },
      revenue,
      insights: insightRows,
    },
  });
});

async function getSummaryData() {
  const now = new Date();
  const [totalUsers, totalPets, totalBookings, activeTrainers, upcomingPetEvents, activeSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.pet.count(),
    prisma.booking.count(),
    prisma.trainer.count(),
    prisma.petEvent.count({ where: { date: { gte: now } } }),
    prisma.petFoodSubscription.count(),
  ]);
  return { totalUsers, totalPets, totalBookings, activeTrainers, upcomingPetEvents, activeSubscriptions };
}

async function getBookingTrendData() {
  const bookings = await prisma.booking.findMany({ select: { bookingDate: true, amount: true } });
  const grouped = bookings.reduce((acc, booking) => {
    const month = monthKey(booking.bookingDate);
    if (!acc[month]) acc[month] = { month, bookings: 0, revenue: 0 };
    acc[month].bookings += 1;
    acc[month].revenue += booking.amount || 0;
    return acc;
  }, {});
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

async function getServiceData() {
  const bookings = await prisma.booking.findMany({ select: { serviceType: true } });
  return toSeries(countBy(bookings, (booking) => booking.serviceType), 'serviceType', 'requests')
    .sort((a, b) => b.requests - a.requests);
}

async function getRegistrationData() {
  const users = await prisma.user.findMany({ select: { createdAt: true } });
  return toSeries(countBy(users, (user) => monthKey(user.createdAt)), 'month', 'registrations')
    .sort((a, b) => a.month.localeCompare(b.month));
}

async function getPetTypeData() {
  const pets = await prisma.pet.findMany({ select: { type: true } });
  return toSeries(countBy(pets, (pet) => pet.type), 'type', 'count');
}

async function getRevenueData() {
  const [bookingRevenue, subscriptionCount] = await Promise.all([
    prisma.booking.aggregate({ _sum: { amount: true } }),
    prisma.petFoodSubscription.count(),
  ]);
  const subscriptionRevenueEstimate = subscriptionCount * 2200;
  return {
    bookingRevenue: bookingRevenue._sum.amount || 0,
    subscriptionRevenueEstimate,
    totalEstimatedRevenue: (bookingRevenue._sum.amount || 0) + subscriptionRevenueEstimate,
  };
}

async function getSubscriptionData() {
  const subscriptions = await prisma.petFoodSubscription.findMany({ include: { pet: true } });
  return toSeries(countBy(subscriptions, (sub) => sub.foodType), 'foodType', 'subscriptions');
}

async function getInsightData() {
  const [bookings, trainers, users] = await Promise.all([
    prisma.booking.findMany({ include: { user: true } }),
    prisma.trainer.findMany(),
    prisma.user.findMany({ include: { bookings: true } }),
  ]);
  const services = toSeries(countBy(bookings, (booking) => booking.serviceType), 'serviceType', 'count').sort((a, b) => b.count - a.count);
  const locations = toSeries(countBy(bookings, (booking) => booking.user?.location || booking.user?.city), 'location', 'count').sort((a, b) => b.count - a.count);
  const trainerCategories = toSeries(countBy(trainers, (trainer) => trainer.specialization), 'category', 'count').sort((a, b) => b.count - a.count);
  const frequentUsers = users.filter((user) => user.bookings.length >= 2);
  return [
    `${services[0]?.serviceType || 'Dog boarding'} demand increased this month.`,
    `Most popular trainer category: ${trainerCategories[0]?.category || 'Obedience'}.`,
    `Most active location: ${locations[0]?.location || 'Bengaluru'}.`,
    `${frequentUsers.length} users have frequent bookings.`,
  ];
}
