/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config({ path: process.env.ENV_PATH || '.env' });
const Exercise = require('../models/Exercise');

const seedData = [
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    equipment: 'barbell',
    difficulty: 'intermediate',
    instructions: 'Lie on a flat bench, grip the bar, lower to chest, press up.'
  },
  {
    name: 'Back Squat',
    muscleGroup: 'quads',
    equipment: 'barbell',
    difficulty: 'intermediate',
    instructions: 'Bar on back, squat to parallel, stand up.'
  },
  {
    name: 'Deadlift',
    muscleGroup: 'back',
    equipment: 'barbell',
    difficulty: 'advanced',
    instructions: 'Hinge at hips, grip bar, keep back neutral, stand up.'
  },
  {
    name: 'Pull-up',
    muscleGroup: 'back',
    equipment: 'pull_up_bar',
    difficulty: 'intermediate',
    instructions: 'Grip bar, pull chin over bar, lower under control.'
  },
  {
    name: 'Plank',
    muscleGroup: 'abs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    instructions: 'Elbows under shoulders, keep body straight, hold position.'
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await Exercise.countDocuments();
    if (existing === 0) {
      await Exercise.insertMany(seedData);
      console.log(`Inserted ${seedData.length} exercises.`);
    } else {
      console.log('Exercises already exist, skipping seeding.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

run();


