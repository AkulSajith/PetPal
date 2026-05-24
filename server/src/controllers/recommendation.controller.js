import { prisma } from '../prisma/client.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const nearbyTrainers = asyncHandler(async (req, res) => {
  const location = req.query.location?.toString() || req.user?.location || req.user?.city || '';
  const trainers = await prisma.trainer.findMany({
    include: {
      user: { select: { id: true, name: true, location: true, city: true } },
    },
  });

  const data = trainers
    .map((trainer) => ({
      ...trainer,
      matchScore: trainer.user.location?.toLowerCase() === location.toLowerCase() || trainer.user.city?.toLowerCase() === location.toLowerCase() ? 95 : 70,
      reason: `Specializes in ${trainer.specialization} with ${trainer.experience} years of experience.`,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ data });
});

export const foodSuggestions = asyncHandler(async (req, res) => {
  const petId = Number(req.query.petId);
  const pet = petId ? await prisma.pet.findUnique({ where: { id: petId } }) : null;

  const type = pet?.type || req.query.petType?.toString() || 'Dog';
  const age = pet?.age || Number(req.query.age || 2);

  const plan = type === 'Cat'
    ? 'High-protein fish and hairball-control subscription'
    : age >= 7
      ? 'Senior joint-support grain-balanced subscription'
      : 'Active pet high-protein personalized subscription';

  res.json({
    data: {
      petType: type,
      age,
      foodType: plan,
      deliveryFrequency: 'Weekly',
      customization: `Recommended from pet type ${type} and age ${age}.`,
    },
  });
});

export const caretakers = asyncHandler(async (_req, res) => {
  const providers = await prisma.serviceProvider.findMany({
    where: { service: { category: 'boarding' } },
    include: { bookings: true },
  });

  const reviews = await prisma.ratingReview.findMany({ where: { targetType: 'CARETAKER' } });

  const data = providers
    .map((provider) => {
      const providerReviews = reviews.filter((review) => review.targetId === provider.id);
      const averageRating = providerReviews.length
        ? Number((providerReviews.reduce((sum, review) => sum + review.rating, 0) / providerReviews.length).toFixed(2))
        : provider.rating;

      return {
        id: provider.id,
        name: provider.name,
        location: provider.location,
        popularity: provider.bookings.length,
        averageRating,
        score: Number((averageRating * 15 + provider.bookings.length * 5).toFixed(2)),
      };
    })
    .sort((a, b) => b.score - a.score);

  res.json({ data });
});

export const events = asyncHandler(async (req, res) => {
  const location = req.query.location?.toString() || req.user?.location || req.user?.city || '';
  const rows = await prisma.petEvent.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' } });
  const data = rows
    .map((event) => ({
      ...event,
      matchScore: event.location.toLowerCase() === location.toLowerCase() ? 95 : 72,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ data });
});
