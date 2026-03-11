#!/usr/bin/env node
/**
 * Database setup script for Speaking Hub
 * Creates tables and initializes default admin user
 * 
 * Usage: node scripts/setup-db.js
 * 
 * Prerequisites:
 * - DATABASE_URL environment variable must be set
 * - PostgreSQL database must exist
 * 
 * Optional environment variables:
 * - ADMIN_USERNAME (default: 'admin')
 * - ADMIN_PASSWORD (default: 'password123')
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const requiredEnv = (name) => {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
};

const optionalEnv = (name, defaultValue) => {
  return process.env[name] || defaultValue;
};

async function setupDatabase() {
  const pool = new Pool({
    connectionString: requiredEnv('DATABASE_URL'),
  });

  try {
    console.log('[DB Setup] Connecting to database...');
    
    // Test connection
    const testQuery = await pool.query('SELECT NOW()');
    console.log('[DB Setup] Connected successfully');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../backend/sql/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('[DB Setup] Creating tables...');
    await pool.query(schemaSql);
    console.log('[DB Setup] Tables created successfully');

    // Create or update admin user
    const adminUsername = optionalEnv('ADMIN_USERNAME', 'admin');
    const adminPassword = optionalEnv('ADMIN_PASSWORD', 'password123');
    
    console.log(`[DB Setup] Setting up admin user: ${adminUsername}`);
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    // Upsert admin user
    const adminQuery = `
      INSERT INTO admin_users (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = $2
      RETURNING id, username;
    `;
    
    const result = await pool.query(adminQuery, [adminUsername, passwordHash]);
    const adminUser = result.rows[0];
    
    console.log(`[DB Setup] Admin user setup complete: ID=${adminUser.id}, Username=${adminUser.username}`);

    // Initialize default content
    console.log('[DB Setup] Initializing default content...');
    
    const defaultContent = {
      'hero_title': 'Speaking Hub - Master English Communication',
      'hero_subtitle': 'Learn English with Teacher Shahlo',
      'courses_heading': 'Our Courses',
      'footer_text': '© 2024 Speaking Hub. All rights reserved.',
    };

    for (const [key, value] of Object.entries(defaultContent)) {
      await pool.query(
        `INSERT INTO content_kv (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    
    console.log('[DB Setup] Default content initialized');

    console.log('[DB Setup] Database setup completed successfully!');
    console.log('[DB Setup] Admin credentials:');
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('[DB Setup] Important: Change these credentials after first login!');

    process.exit(0);
  } catch (error) {
    console.error('[DB Setup] Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
