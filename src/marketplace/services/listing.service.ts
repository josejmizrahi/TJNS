import { ListingEntity, ListingStatus, ListingCategory } from '../models/listing.model';
import { HybridStorageService, StorageType } from '../../common/utils/storage';
import { AppError } from '../../common/middleware/error';
import { adapterFactory } from '../../common/adapters';
import { PaginationParams } from '../../common/types';

export class ListingService {
  private database = adapterFactory.getDatabaseAdapter();
  private storage: HybridStorageService;

  constructor(storage: HybridStorageService) {
    this.storage = storage;
  }

  private convertToEntity(listing: Partial<ListingEntity>): ListingEntity {
    return new ListingEntity({
      ...listing,
      category: listing.category || ListingCategory.OTHER
    });
  }

  async createListing(
    sellerId: string,
    data: {
      title: string;
      description: string;
      price: number;
      category: ListingCategory;
      kosherCertification?: {
        certifier: string;
        certificateNumber: string;
        expirationDate: Date;
      };
      images?: Buffer[];
      shipping?: {
        weight: number;
        dimensions: {
          length: number;
          width: number;
          height: number;
        };
        methods: string[];
      };
      metadata?: Record<string, unknown>;
    }
  ): Promise<ListingEntity> {
    try {
      // Upload images if provided
      const uploadedImages: string[] = [];
      const imageStorageType = StorageType.SUPABASE;

      if (data.images?.length) {
        for (const [index, image] of data.images.entries()) {
          const { path } = await this.storage.uploadFile(
            `listings/${sellerId}/${Date.now()}_${index}`,
            image,
            {
              type: imageStorageType,
              bucket: 'marketplace',
              encrypted: false
            }
          );
          uploadedImages.push(path);
        }
      }

      const listing = new ListingEntity({
        sellerId,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        status: ListingStatus.DRAFT,
        kosherCertification: data.kosherCertification,
        images: uploadedImages,
        imageStorageType: uploadedImages.length ? imageStorageType : undefined,
        shipping: data.shipping,
        metadata: data.metadata || {}
      });

      const result = await this.database.createListing(listing);
      return this.convertToEntity(result);
    } catch (error) {
      throw new AppError(500, `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateListing(
    listingId: string,
    sellerId: string,
    data: Partial<ListingEntity>
  ): Promise<ListingEntity> {
    const listing = await this.database.getListing(listingId);
    
    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new AppError(403, 'Not authorized to update this listing');
    }

    const result = await this.database.updateListing(listingId, data);
    return this.convertToEntity(result);
  }

  async getListing(listingId: string): Promise<ListingEntity> {
    const listing = await this.database.getListing(listingId);
    
    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    return this.convertToEntity(listing);
  }

  async searchListings(
    params: PaginationParams & {
      category?: ListingCategory;
      minPrice?: number;
      maxPrice?: number;
      query?: string;
      kosherCertified?: boolean;
    }
  ): Promise<{ items: ListingEntity[]; total: number }> {
    const listings = await this.database.searchListings({
      ...params,
      status: ListingStatus.ACTIVE
    });
    return {
      items: listings.map(l => this.convertToEntity(l)),
      total: listings.length
    };
  }

  async publishListing(listingId: string, sellerId: string): Promise<ListingEntity> {
    const listing = await this.getListing(listingId);

    if (listing.sellerId !== sellerId) {
      throw new AppError(403, 'Not authorized to publish this listing');
    }

    if (listing.status !== ListingStatus.DRAFT) {
      throw new AppError(400, 'Only draft listings can be published');
    }

    return await this.updateListing(listingId, sellerId, {
      status: ListingStatus.ACTIVE
    });
  }

  async deleteListing(listingId: string, sellerId: string): Promise<void> {
    const listing = await this.getListing(listingId);

    if (listing.sellerId !== sellerId) {
      throw new AppError(403, 'Not authorized to delete this listing');
    }

    // Delete associated images
    if (listing.images?.length && listing.imageStorageType) {
      for (const imagePath of listing.images) {
        await this.storage.deleteFile(imagePath, listing.imageStorageType);
      }
    }

    await this.database.deleteListing(listingId);
  }
}

export default new ListingService(new HybridStorageService(
  adapterFactory.getStorageAdapter(),
  adapterFactory.getIPFSService(),
  adapterFactory.getEncryptionService()
));
