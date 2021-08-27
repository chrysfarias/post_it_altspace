const express = require ('express');
const router = express.Router();

const controller = require('../controllers/post.controller');

router.post('/post', controller.create);
router.get('/post', controller.getAll);
router.delete('/post/:id', controller.delete);
router.put('/post/:id', controller.update);

module.exports = router;