
const pool = require('../config/database');

const createUsersTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(50) NOT NULL,
      "providerId" VARCHAR(100) NOT NULL,
      "displayName" VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_provider_id UNIQUE (provider, "providerId")
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(queryText);
    client.release();
    console.log("'Users' table has been created successfully.");
  } catch (err) {
    console.error('Error creating users table:', err.stack);
  }
};

createUsersTable();
