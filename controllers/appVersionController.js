const AppVersion = require('../models/AppVersion');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get latest app version
// @route   GET /api/app-version/:platform
// @access  Public
exports.getLatestVersion = async (req, res, next) => {
  try {
    const { platform } = req.params;
    
    const latestVersion = await AppVersion.findOne({ 
      platform, 
      isActive: true 
    }).sort({ buildNumber: -1 });

    if (!latestVersion) {
      return errorResponse(res, 404, 'No version found for this platform');
    }

    successResponse(res, 200, 'Latest version retrieved successfully', latestVersion);
  } catch (error) {
    next(error);
  }
};

// @desc    Check for update
// @route   POST /api/app-version/check
// @access  Public
exports.checkForUpdate = async (req, res, next) => {
  try {
    const { platform, currentVersion, currentBuildNumber } = req.body;

    const latestVersion = await AppVersion.findOne({ 
      platform, 
      isActive: true 
    }).sort({ buildNumber: -1 });

    if (!latestVersion) {
      return successResponse(res, 200, 'No updates available', { updateAvailable: false });
    }

    const updateAvailable = latestVersion.buildNumber > currentBuildNumber;

    successResponse(res, 200, updateAvailable ? 'Update available' : 'App is up to date', {
      updateAvailable,
      latestVersion: latestVersion.version,
      latestBuildNumber: latestVersion.buildNumber,
      downloadUrl: latestVersion.downloadUrl,
      releaseNotes: latestVersion.releaseNotes,
      isMandatory: latestVersion.isMandatory,
      fileSize: latestVersion.fileSize,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new version
// @route   POST /api/app-version
// @access  Private (Admin only)
exports.createVersion = async (req, res, next) => {
  try {
    const version = await AppVersion.create(req.body);
    successResponse(res, 201, 'Version created successfully', version);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all versions
// @route   GET /api/app-version
// @access  Private (Admin only)
exports.getAllVersions = async (req, res, next) => {
  try {
    const versions = await AppVersion.find().sort({ releaseDate: -1 });
    successResponse(res, 200, 'Versions retrieved successfully', versions);
  } catch (error) {
    next(error);
  }
};
