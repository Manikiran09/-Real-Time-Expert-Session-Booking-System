/**
 * Migration: Fix existing timeslot documents
 *
 * Problems this fixes:
 *  1. date stored as a Date object → convert to 'YYYY-MM-DD' string
 *  2. capacity / currentBookings fields missing → set defaults (1 / 0)
 *
 * Run once: node scripts/migrateTimeslots.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const migrate = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const collection = db.collection('timeslots');

  const slots = await collection.find({}).toArray();
  console.log(`Found ${slots.length} timeslot documents`);

  let fixed = 0;

  for (const slot of slots) {
    const updates = {};

    // Fix date: if it's a Date object (or looks like one), convert to YYYY-MM-DD string
    if (slot.date instanceof Date || (slot.date && typeof slot.date === 'object' && slot.date.toISOString)) {
      updates.date = slot.date.toISOString().split('T')[0];
    } else if (typeof slot.date === 'string' && slot.date.length > 10) {
      // ISO string stored as string — trim to date part
      updates.date = slot.date.split('T')[0];
    }

    // Add missing capacity / currentBookings
    if (slot.capacity === undefined || slot.capacity === null) {
      updates.capacity = 1;
    }
    if (slot.currentBookings === undefined || slot.currentBookings === null) {
      updates.currentBookings = slot.isBooked ? 1 : 0;
    }

    if (Object.keys(updates).length > 0) {
      await collection.updateOne({ _id: slot._id }, { $set: updates });
      fixed++;
    }
  }

  console.log(`✅ Migrated ${fixed} / ${slots.length} documents`);
  process.exit(0);
};

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
