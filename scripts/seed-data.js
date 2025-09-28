const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database with test data...');
  
  // Create test user if not exists
  const testUserEmail = '2880931@learn.vsb.bc.ca';
  let testUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  });
  
  if (!testUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testUserEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Created test user:', testUser.name);
  } else {
    console.log('Test user already exists:', testUser.name);
  }
  
  // Create test plant if not exists
  let testPlant = await prisma.plant.findFirst({
    where: { name: 'Test Plant' }
  });
  
  if (!testPlant) {
    testPlant = await prisma.plant.create({
      data: {
        name: 'Test Plant',
        description: 'A test plant for development',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3'
      }
    });
    console.log('Created test plant:', testPlant.name);
  } else {
    console.log('Test plant already exists:', testPlant.name);
  }
  
  // Create plant care assignment if not exists
  const existingCare = await prisma.plantCare.findFirst({
    where: {
      userId: testUser.id,
      plantId: testPlant.id
    }
  });
  
  if (!existingCare) {
    const plantCare = await prisma.plantCare.create({
      data: {
        userId: testUser.id,
        plantId: testPlant.id,
        startDate: new Date(),
        endDate: null
      }
    });
    console.log('Created plant care assignment');
  } else {
    console.log('Plant care assignment already exists');
  }
  
  // Create test check-in if not exists
  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId: testUser.id,
      plantId: testPlant.id
    }
  });
  
  if (!existingCheckIn) {
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: testUser.id,
        plantId: testPlant.id,
        notes: 'Test check-in',
        imageUrl: null
      }
    });
    console.log('Created check-in record');
  } else {
    console.log('Check-in record already exists');
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
