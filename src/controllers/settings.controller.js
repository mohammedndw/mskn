const settingsService = require('../services/settings.service');
const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');

class SettingsController {
  /**
   * Get all settings
   * @route GET /api/settings
   * @access Public (filtered by role)
   */
  getAllSettings = asyncHandler(async (req, res) => {
    const { key, isPublic } = req.query;
    const userRole = req.user?.role || 'PUBLIC';

    const settings = await settingsService.getAllSettings(
      { key, isPublic },
      userRole
    );

    return ApiResponse.success(
      res,
      settings,
      'Settings retrieved successfully'
    );
  });

  /**
   * Get setting by key
   * @route GET /api/settings/:key
   * @access Public (filtered by role)
   */
  getSettingByKey = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const userRole = req.user?.role || 'PUBLIC';

    const setting = await settingsService.getSettingByKey(key, userRole);

    return ApiResponse.success(
      res,
      setting,
      'Setting retrieved successfully'
    );
  });

  /**
   * Create new setting
   * @route POST /api/settings
   * @access Admin only
   */
  createSetting = asyncHandler(async (req, res) => {
    const setting = await settingsService.createSetting(req.body);

    return ApiResponse.success(
      res,
      setting,
      'Setting created successfully',
      201
    );
  });

  /**
   * Update setting by key
   * @route PUT /api/settings/:key
   * @access Admin only
   */
  updateSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;

    const updatedSetting = await settingsService.updateSetting(key, req.body);

    return ApiResponse.success(
      res,
      updatedSetting,
      'Setting updated successfully'
    );
  });

  /**
   * Delete setting by key
   * @route DELETE /api/settings/:key
   * @access Admin only
   */
  deleteSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;

    await settingsService.deleteSetting(key);

    return ApiResponse.success(
      res,
      null,
      'Setting deleted successfully'
    );
  });

  /**
   * Initialize default settings
   * @route POST /api/settings/initialize
   * @access Admin only
   */
  initializeSettings = asyncHandler(async (req, res) => {
    await settingsService.initializeDefaultSettings();

    return ApiResponse.success(
      res,
      null,
      'Default settings initialized successfully'
    );
  });
}

module.exports = new SettingsController();
