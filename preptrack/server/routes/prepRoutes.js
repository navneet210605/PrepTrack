const express = require('express');
const router = express.Router();
const {
  createPrepItem,
  getPrepItems,
  getReviseToday,
  markRevised,
  getPrepItemById,
  updatePrepItem,
  deletePrepItem
} = require('../controllers/prepController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Specific routes before parameterized :id route
router.get('/revise-today', getReviseToday);
router.put('/:id/revised', markRevised);

router.route('/')
  .get(getPrepItems)
  .post(createPrepItem);

router.route('/:id')
  .get(getPrepItemById)
  .put(updatePrepItem)
  .delete(deletePrepItem);

module.exports = router;
