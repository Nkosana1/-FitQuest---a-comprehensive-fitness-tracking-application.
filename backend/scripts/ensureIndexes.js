/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config({ path: process.env.ENV_PATH || '.env' });

// Register models to ensure their indexes are created
require('../models/User');
require('../models/Workout');
require('../models/Exercise');
require('../models/WorkoutLog');
require('../models/PersonalRecord');
require('../models/Progress');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: Number(process.env.MONGODB_POOL_SIZE || 10)
    });

    const collections = Object.values(mongoose.connection.models);
    for (const model of collections) {
      console.log(`Ensuring indexes for ${model.modelName}...`);
      await model.syncIndexes();
    }
    console.log('All indexes ensured successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring indexes:', err);
    process.exit(1);
  }
}

run();


