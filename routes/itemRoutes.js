const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item-controller');
const { requireAuth } = require('../middleware/authMiddleware');

// Route to handle form submission
router.post('/post-item', requireAuth, itemController.upload.single('image'), itemController.postItem);

module.exports = router;
