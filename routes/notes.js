const express = require('express');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  emptyTrash,
} = require('../controllers/notesController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All note routes are protected

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/trash/empty')
  .delete(emptyTrash);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
