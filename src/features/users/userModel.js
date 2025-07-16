const pool = require('../../config/database');

class User {
  // The constructor is no longer needed for a static model
  // that primarily interacts with the database.

  /**
   * Finds a user by their internal database ID.
   * @param {number} id
   * @returns {Promise<object | undefined>}
   */
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }

  /**
   * Finds a single user based on a query object.
   * @param {object} query e.g., { provider: 'google', "providerId": '123' }
   * @returns {Promise<object | undefined>}
   */
  static async findOne(query) {
    const { provider, providerId } = query;
    const sqlQuery = 'SELECT * FROM users WHERE provider = $1 AND "providerId" = $2';
    try {
      const { rows } = await pool.query(sqlQuery, [provider, providerId]);
      return rows[0];
    } catch (err) {
      console.error('Error finding one user:', err);
      throw err;
    }
  }

  /**
   * Finds a user based on their OAuth profile or creates a new one in the database.
   * @param {object} profile - The profile returned from the OAuth provider.
   * @returns {Promise<object>}
   */
  static async findOrCreate(profile) {
    const { provider, id: providerId, displayName: rawDisplayName, emails } = profile;
    const displayName = rawDisplayName || providerId; // Use providerId as fallback if displayName is null
    const email = emails && emails.length > 0 ? emails[0].value : null;

    try {
      // Check if user already exists
      let user = await this.findOne({ provider, providerId });

      if (user) {
        return user;
      }

      // If not, create a new user
      const insertQuery = `
        INSERT INTO users (provider, "providerId", "displayName", email)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING -- Optional: handle email conflicts gracefully
        RETURNING *;
      `;
      
      const { rows } = await pool.query(insertQuery, [provider, providerId, displayName, email]);
      
      // If the user was not inserted due to a conflict and nothing was returned,
      // try to find them by email, as they might exist with another provider.
      if (rows.length === 0 && email) {
          const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          if(existingUserByEmail.rows.length > 0) {
              // Here you could implement logic to link accounts. 
              // For now, we'll just return the user found by email.
              console.log(`User with email ${email} already exists. Consider linking accounts.`);
              return existingUserByEmail.rows[0];
          }
      }
      
      user = rows[0];
      console.log('Created new user in DB:', user);
      return user;

    } catch (err) {
      console.error('Error in findOrCreate:', err);
      // Special handling for unique violation if not caught by ON CONFLICT
      if (err.code === '23505') { // Unique violation
        console.error('A user with this provider and providerId already exists.');
        // Attempt to refetch the user that must exist
        return this.findOne({ provider, providerId });
      }
      throw err;
    }
  }
  static async saveUserProfile(userId, profileData) {
    const query = `
      INSERT INTO user_profile (user_id, profile_data)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET profile_data = EXCLUDED.profile_data, "updatedAt" = CURRENT_TIMESTAMP;
    `;
    try {
      await pool.query(query, [userId, profileData]);
    } catch (err) {
      console.error('Error saving user profile:', err);
      throw err;
    }
  }

  /**
   * Fetches all users from the database.
   * @returns {Promise<Array<object>>}
   */
  static async getAllUsers() {
    const query = 'SELECT id, provider, "providerId", "displayName", email, "createdAt" FROM users';
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (err) {
      console.error('Error fetching all users:', err);
      throw err;
    }
  }
}

module.exports = User;
