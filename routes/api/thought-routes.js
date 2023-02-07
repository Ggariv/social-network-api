const router = require('express').Router();

const {
    getAllThoughts,
    getThoughtsbyId,
    createThought,
    updateThought,
    deleteThought,
    addReaction,
    deleteReaction
    } = require('../../controllers/thought-controller');

router.route('/').get(getAllThoughts).post(createThought);
router.route('/:id').get(getThoughtsbyId).put(updateThought).delete(deleteThought);
router.route('/:id/reactions').post(addReaction).delete(deleteReaction);

module.exports = router;