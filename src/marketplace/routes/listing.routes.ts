import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import listingController from '../controllers/listing.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/search', listingController.searchListings);
router.get('/:id', listingController.getListing);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  upload.array('images', 5),
  listingController.createListing
);

router.patch('/:id', listingController.updateListing);
router.post('/:id/publish', listingController.publishListing);
router.delete('/:id', listingController.deleteListing);

export default router;
