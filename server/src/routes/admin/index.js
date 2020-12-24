import express from 'express';
import { TODO } from '../../utils/index.js';

const router = express.Router();

router.get('/porfolios', TODO)
router.get('/trades', TODO)

export default router;