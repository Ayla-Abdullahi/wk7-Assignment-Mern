#!/usr/bin/env node
// Script to create a least-privileged MongoDB Atlas user.
// Run locally with environment variables ADMIN_URI, NEW_DB, NEW_USER, NEW_PASS.
// ADMIN_URI should be a connection string for a user with userAdmin privileges.

import { MongoClient } from 'mongodb';

const { ADMIN_URI, NEW_DB, NEW_USER, NEW_PASS } = process.env;
if (!ADMIN_URI || !NEW_DB || !NEW_USER || !NEW_PASS) {
  console.error('Missing required env vars: ADMIN_URI, NEW_DB, NEW_USER, NEW_PASS');
  process.exit(1);
}

async function run () {
  const client = new MongoClient(ADMIN_URI);
  await client.connect();
  const adminDb = client.db('admin');
  try {
    await adminDb.command({
      createUser: NEW_USER,
      pwd: NEW_PASS,
      roles: [{ role: 'readWrite', db: NEW_DB }]
    });
    console.log(`Created user ${NEW_USER} with readWrite on ${NEW_DB}`);
  } catch (e) {
    console.error('Error creating user', e);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
run();
