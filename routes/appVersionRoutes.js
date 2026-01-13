const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getLatestVersion,
  checkForUpdate,
  createVersion,
  getAllVersions,
} = require('../controllers/appVersionController');

router.get('/:platform', getLatestVersion);
router.post('/check', checkForUpdate);
router.post('/', protect, authorize('admin'), createVersion);
router.get('/', protect, authorize('admin'), getAllVersions);

module.exports = router;
