import express from 'express';
import controller from '../controllers/move';
const router = express.Router();

router.get('/move', controller.getMove);

export = router;