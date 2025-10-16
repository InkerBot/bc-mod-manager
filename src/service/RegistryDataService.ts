import {LocalStorageService} from './LocalStorageService';
import type {Registry, RegistryType} from './RegistryService';
import {LogService} from "./LogService.ts";

/**
 * Fusam Registry Data Structure
 */
export interface FusamAddon {
  id: string;
  name: string;
  description: string;
  author: string;
  repository?: string;
  tags?: string[];
  type?: string;
  icon?: string;
  website?: string;
  discord?: string;
  noCacheBusting?: boolean;
  versions: Array<{
    distribution: string;
    source: string;
  }>;
}

export interface FusamRegistryData {
  version: string;
  addons: FusamAddon[];
}

/**
 * Aurora Registry Data Structure (placeholder - adjust based on actual structure)
 */
export interface AuroraRegistryData {
  // TODO: Define based on actual aurora registry structure
  [key: string]: any;
}

/**
 * Cached Registry Data
 */
export interface CachedRegistryData {
  registryId: string;
  registryUrl: string;
  registryType: RegistryType;
  data: FusamRegistryData | AuroraRegistryData | null;
  modCount: number;
  fetchedAt: number;
  error: string | null;
}

/**
 * Registry Data Service
 * Handles fetching and caching registry data
 */
export class RegistryDataService {
  private static readonly CACHE_STORAGE_KEY = 'bmm_registry_cache';

  /**
   * Get all cached registry data
   */
  static getAllCached(): CachedRegistryData[] {
    const cached = LocalStorageService.getItem<CachedRegistryData[]>(this.CACHE_STORAGE_KEY);
    return cached || [];
  }

  /**
   * Get cached data for a specific registry
   */
  static getCached(registryId: string): CachedRegistryData | null {
    const allCached = this.getAllCached();
    return allCached.find(c => c.registryId === registryId) || null;
  }

  /**
   * Fetch registry data from URL
   */
  static async fetchRegistry(registry: Registry): Promise<CachedRegistryData> {
    const startTime = Date.now();

    try {
      LogService.info(`Fetching registry data from: ${registry.url}`);

      const response = await fetch(registry.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Parse based on registry type
      let modCount = 0;
      let parsedData: FusamRegistryData | AuroraRegistryData | null = null;

      if (registry.type === 'fusam') {
        parsedData = data as FusamRegistryData;
        modCount = parsedData.addons?.length || 0;
      } else if (registry.type === 'aurora') {
        // TODO: Parse aurora format when structure is known
        parsedData = data as AuroraRegistryData;
        modCount = 0; // Update based on aurora structure
      }

      const cachedData: CachedRegistryData = {
        registryId: registry.id,
        registryUrl: registry.url,
        registryType: registry.type,
        data: parsedData,
        modCount: modCount,
        fetchedAt: Date.now(),
        error: null,
      };

      // Save to cache
      this.saveToCache(cachedData);

      LogService.info(`Successfully fetched ${modCount} mods in ${Date.now() - startTime}ms`);

      return cachedData;
    } catch (error) {
      LogService.error('Error fetching registry:', error);

      const cachedData: CachedRegistryData = {
        registryId: registry.id,
        registryUrl: registry.url,
        registryType: registry.type,
        data: null,
        modCount: 0,
        fetchedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Save error to cache
      this.saveToCache(cachedData);

      return cachedData;
    }
  }

  /**
   * Fetch all registries
   */
  static async fetchAllRegistries(registries: Registry[]): Promise<CachedRegistryData[]> {
    const promises = registries.map(registry => this.fetchRegistry(registry));
    return Promise.all(promises);
  }

  /**
   * Clear cache for a specific registry
   */
  static clearCache(registryId: string): void {
    const allCached = this.getAllCached();
    const filtered = allCached.filter(c => c.registryId !== registryId);
    LocalStorageService.setItem(this.CACHE_STORAGE_KEY, filtered);
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    LocalStorageService.setItem(this.CACHE_STORAGE_KEY, []);
  }

  /**
   * Get cache age in milliseconds
   */
  static getCacheAge(cachedData: CachedRegistryData): number {
    return Date.now() - cachedData.fetchedAt;
  }

  /**
   * Format cache age as human-readable string
   */
  static formatCacheAge(cachedData: CachedRegistryData): string {
    const ageMs = this.getCacheAge(cachedData);
    const ageSeconds = Math.floor(ageMs / 1000);
    const ageMinutes = Math.floor(ageSeconds / 60);
    const ageHours = Math.floor(ageMinutes / 60);
    const ageDays = Math.floor(ageHours / 24);

    if (ageDays > 0) {
      return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
    } else if (ageHours > 0) {
      return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
    } else if (ageMinutes > 0) {
      return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
    } else {
      return `${ageSeconds} second${ageSeconds !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Check if cache is stale (older than specified time)
   */
  static isCacheStale(cachedData: CachedRegistryData, maxAgeMs: number = 3600000): boolean {
    return this.getCacheAge(cachedData) > maxAgeMs;
  }

  /**
   * Save cached data
   */
  private static saveToCache(cachedData: CachedRegistryData): void {
    const allCached = this.getAllCached();
    const index = allCached.findIndex(c => c.registryId === cachedData.registryId);

    if (index !== -1) {
      allCached[index] = cachedData;
    } else {
      allCached.push(cachedData);
    }

    LocalStorageService.setItem(this.CACHE_STORAGE_KEY, allCached);
  }
}

