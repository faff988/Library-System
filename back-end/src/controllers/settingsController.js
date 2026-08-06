const knex = require('../config/db'); // Adjust path to your DB configuration
const bcrypt = require('bcrypt');

/**
 * GET /api/auth/me
 * Fetch current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Populated by your auth middleware

    const user = await knex('users')
      .where({ id: userId })
      .select('id', 'first_name', 'last_name', 'email', 'role', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/auth/change-password
 * Change password for logged-in user
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Get user password hash
    const user = await knex('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    // Hash new password and save
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await knex('users')
      .where({ id: userId })
      .update({ password_hash: newHash, updated_at: knex.fn.now() });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/settings/config
 * Fetch library configuration rules
 */
exports.getLibraryConfig = async (req, res) => {
  try {
    const settings = await knex('system_settings').select('*');
    // Converts array of key-value rows to object
    const config = settings.reduce((acc, curr) => {
      acc[curr.setting_key] = curr.setting_value;
      return acc;
    }, {});

    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/settings/config
 * Update library configuration settings
 */
exports.updateLibraryConfig = async (req, res) => {
  try {
    const settingsObj = req.body; // e.g. { maxBorrowDays: 14, finePerDay: 0.25 }

    const updates = Object.entries(settingsObj).map(([key, value]) => {
      return knex('system_settings')
        .insert({ setting_key: key, setting_value: String(value) })
        .onConflict('setting_key')
        .merge({ setting_value: String(value), updated_at: knex.fn.now() });
    });

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};