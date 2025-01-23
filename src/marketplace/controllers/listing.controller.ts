import { Request, Response, NextFunction } from 'express';
import { validate } from '../../common/middleware/validation';
import { authenticate } from '../../common/middleware/auth';
import listingService from '../services/listing.service';
import { ListingCategory } from '../models/listing.model';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  category: z.nativeEnum(ListingCategory),
  kosherCertification: z.object({
    certifier: z.string(),
    certificateNumber: z.string(),
    expirationDate: z.string().transform(str => new Date(str))
  }).optional(),
  shipping: z.object({
    weight: z.number().positive(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive()
    }),
    methods: z.array(z.string())
  }).optional(),
  metadata: z.record(z.unknown()).optional()
});

export class ListingController {
  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingService.createListing(
        req.user!.id,
        {
          ...req.body,
          images: req.files as Express.Multer.File[]
        }
      );

      res.status(201).json({
        status: 'success',
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingService.updateListing(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.status(200).json({
        status: 'success',
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  async getListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingService.getListing(req.params.id);

      res.status(200).json({
        status: 'success',
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  async searchListings(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, total } = await listingService.searchListings({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        category: req.query.category as ListingCategory,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        query: req.query.query as string,
        kosherCertified: req.query.kosherCertified === 'true'
      });

      res.status(200).json({
        status: 'success',
        data: { items, total }
      });
    } catch (error) {
      next(error);
    }
  }

  async publishListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingService.publishListing(
        req.params.id,
        req.user!.id
      );

      res.status(200).json({
        status: 'success',
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      await listingService.deleteListing(
        req.params.id,
        req.user!.id
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ListingController();
