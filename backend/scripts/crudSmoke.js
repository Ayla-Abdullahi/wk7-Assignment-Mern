#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from '../src/config/index.js';

async function run () {
  console.log('Connecting to', config.mongoUri);
  await mongoose.connect(config.mongoUri, { maxPoolSize: 5 });
  const Test = mongoose.model('SmokeTest', new mongoose.Schema({ name: String }, { timestamps: true }));
  const doc = await Test.create({ name: 'smoke-' + Date.now() });
  console.log('Inserted doc id:', doc._id.toString());
  const found = await Test.findById(doc._id).lean();
  console.log('Found doc:', found ? found.name : 'not found');
  await Test.deleteOne({ _id: doc._id });
  console.log('Deleted doc and closing connection');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(2);
});
