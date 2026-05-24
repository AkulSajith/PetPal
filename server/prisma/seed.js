import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Akul",
      email: "akul@example.com",
      password: hashedPassword,
      role: "OWNER",
      location: "Bangalore"
    }
  });

  const pet = await prisma.pet.create({
    data: {
      ownerId: user.id,
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      medicalNotes: "Vaccinated"
    }
  });

  await prisma.booking.create({
    data: {
      petId: pet.id,
      ownerId: user.id,
      serviceType: "Pet Boarding",
      bookingDate: new Date(),
      status: "CONFIRMED"
    }
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
         