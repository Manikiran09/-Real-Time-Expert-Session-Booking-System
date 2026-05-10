require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('../models/Expert');
const TimeSlot = require('../models/TimeSlot');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Expert.deleteMany({});
    await TimeSlot.deleteMany({});

    // Sample experts
    const experts = [
      {
        name: 'Dr. Sarah Johnson',
        category: 'Healthcare',
        experience: 15,
        rating: 4.8,
        bio: 'Senior cardiologist with 15 years of experience in cardiovascular health.',
        hourlyRate: 150,
        profileImage: 'https://via.placeholder.com/150?text=Dr+Sarah',
        timezone: 'UTC-5',
        isActive: true,
      },
      {
        name: 'John Mitchell',
        category: 'Finance',
        experience: 12,
        rating: 4.6,
        bio: 'Financial advisor specializing in investment strategies and portfolio management.',
        hourlyRate: 120,
        profileImage: 'https://via.placeholder.com/150?text=John+Mitchell',
        timezone: 'UTC',
        isActive: true,
      },
      {
        name: 'Emma Williams',
        category: 'Technology',
        experience: 10,
        rating: 4.9,
        bio: 'Full-stack developer and tech architect with expertise in cloud solutions.',
        hourlyRate: 130,
        profileImage: 'https://via.placeholder.com/150?text=Emma+Williams',
        timezone: 'UTC+1',
        isActive: true,
      },
      {
        name: 'Michael Brown',
        category: 'Marketing',
        experience: 8,
        rating: 4.5,
        bio: 'Digital marketing strategist specializing in brand development and growth hacking.',
        hourlyRate: 100,
        profileImage: 'https://via.placeholder.com/150?text=Michael+Brown',
        timezone: 'UTC-5',
        isActive: true,
      },
      {
        name: 'Lisa Chen',
        category: 'Legal',
        experience: 20,
        rating: 4.7,
        bio: 'Corporate lawyer with expertise in international business law.',
        hourlyRate: 200,
        profileImage: 'https://via.placeholder.com/150?text=Lisa+Chen',
        timezone: 'UTC+8',
        isActive: true,
      },
    ];

    const createdExperts = await Expert.create(experts);
    console.log(`✅ ${createdExperts.length} experts created`);

    // Create time slots for each expert (next 30 days)
    const timeSlots = [];
    // Use UTC to build dates; store as 'YYYY-MM-DD' string to match DB schema
    const todayUTC = new Date();

    createdExperts.forEach((expert) => {
      for (let day = 0; day < 30; day++) {
        const d = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate() + day));
        const dateStr = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // Create 4 slots per day (9 AM, 11 AM, 2 PM, 4 PM)
        const times = [
          { start: '09:00', end: '10:00' },
          { start: '11:00', end: '12:00' },
          { start: '14:00', end: '15:00' },
          { start: '16:00', end: '17:00' },
        ];

        times.forEach((time) => {
          timeSlots.push({
            expertId: expert._id,
            date: dateStr,       // 'YYYY-MM-DD' string, matching real DB schema
            startTime: time.start,
            endTime: time.end,
            isBooked: false,
            capacity: 1,
            currentBookings: 0,
          });
        });
      }
    });

    await TimeSlot.create(timeSlots);
    console.log(`✅ ${timeSlots.length} time slots created`);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
