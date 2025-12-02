const { prisma } = require('../config/database');

class SettingsService {
  /**
   * Get all settings
   * @param {Object} filters - Filter options (key, isPublic)
   * @param {String} userRole - User role for access control
   * @returns {Promise<Array>} List of settings
   */
  async getAllSettings(filters = {}, userRole) {
    const where = {};

    // Filter by key if provided
    if (filters.key) {
      where.key = { contains: filters.key, mode: 'insensitive' };
    }

    // Non-admin users can only see public settings
    if (userRole !== 'ADMIN') {
      where.isPublic = true;
    } else if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    const settings = await prisma.settings.findMany({
      where,
      orderBy: { key: 'asc' }
    });

    return settings;
  }

  /**
   * Get setting by key
   * @param {String} key - Setting key
   * @param {String} userRole - User role for access control
   * @returns {Promise<Object>} Setting object
   */
  async getSettingByKey(key, userRole) {
    const setting = await prisma.settings.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new Error('Setting not found');
    }

    // Non-admin users can only access public settings
    if (userRole !== 'ADMIN' && !setting.isPublic) {
      throw new Error('Access denied to this setting');
    }

    return setting;
  }

  /**
   * Create new setting
   * @param {Object} data - Setting data
   * @returns {Promise<Object>} Created setting
   */
  async createSetting(data) {
    // Check if setting with this key already exists
    const existingSetting = await prisma.settings.findUnique({
      where: { key: data.key }
    });

    if (existingSetting) {
      throw new Error('Setting with this key already exists');
    }

    const setting = await prisma.settings.create({
      data
    });

    return setting;
  }

  /**
   * Update setting by key
   * @param {String} key - Setting key
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated setting
   */
  async updateSetting(key, data) {
    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      throw new Error('Setting not found');
    }

    const updatedSetting = await prisma.settings.update({
      where: { key },
      data
    });

    return updatedSetting;
  }

  /**
   * Delete setting by key
   * @param {String} key - Setting key
   * @returns {Promise<void>}
   */
  async deleteSetting(key) {
    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      throw new Error('Setting not found');
    }

    await prisma.settings.delete({
      where: { key }
    });
  }

  /**
   * Initialize default settings
   * @returns {Promise<void>}
   */
  async initializeDefaultSettings() {
    const defaultSettings = [
      {
        key: 'COMPANY_NAME',
        value: 'Property Management System',
        description: 'Company name displayed in the system',
        isPublic: true
      },
      {
        key: 'COMPANY_EMAIL',
        value: 'info@propertymanagement.com',
        description: 'Company contact email',
        isPublic: true
      },
      {
        key: 'COMPANY_PHONE',
        value: '+966501234567',
        description: 'Company contact phone',
        isPublic: true
      },
      {
        key: 'COMPANY_ADDRESS',
        value: 'Riyadh, Saudi Arabia',
        description: 'Company physical address',
        isPublic: true
      },
      {
        key: 'ENABLE_EMAIL_NOTIFICATIONS',
        value: true,
        description: 'Enable/disable email notifications',
        isPublic: false
      },
      {
        key: 'ENABLE_SMS_NOTIFICATIONS',
        value: false,
        description: 'Enable/disable SMS notifications',
        isPublic: false
      },
      {
        key: 'MAINTENANCE_AUTO_ASSIGN',
        value: false,
        description: 'Auto-assign maintenance requests to property managers',
        isPublic: false
      },
      {
        key: 'CONTRACT_EXPIRY_WARNING_DAYS',
        value: 30,
        description: 'Number of days before contract expiry to send warning',
        isPublic: false
      },
      {
        key: 'MAX_UPLOAD_SIZE_MB',
        value: 5,
        description: 'Maximum file upload size in MB',
        isPublic: false
      }
    ];

    for (const setting of defaultSettings) {
      const exists = await prisma.settings.findUnique({
        where: { key: setting.key }
      });

      if (!exists) {
        await prisma.settings.create({ data: setting });
      }
    }
  }
}

module.exports = new SettingsService();
