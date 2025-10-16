import { LocalStorageService } from './LocalStorageService';

/**
 * Registry interface
 * Represents a mod registry with a unique ID and URL
 */
export interface Registry {
  id: string;
  url: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Registry Service
 * Manages mod registries with CRUD operations
 */
export class RegistryService {
  private static readonly STORAGE_KEY = 'bmm_registries';

  /**
   * Get all registries
   * @returns Array of all registries
   */
  static getAll(): Registry[] {
    let registries = LocalStorageService.getItem<Registry[]>(this.STORAGE_KEY);
    if (registries == null) {
      registries = [{
        id: 'fusam',
        url: 'https://gitlab.com/Sidiousious/bc-addon-loader/-/raw/main/manifest.json',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }]
      LocalStorageService.setItem(this.STORAGE_KEY, registries);
    }
    return registries;
  }

  /**
   * Get a registry by ID
   * @param id - The registry ID
   * @returns The registry or null if not found
   */
  static getById(id: string): Registry | null {
    const registries = this.getAll();
    return registries.find(r => r.id === id) || null;
  }

  /**
   * Add a new registry
   * @param url - The registry URL
   * @returns The created registry or null if failed
   */
  static add(url: string): Registry | null {
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL format');
      return null;
    }

    const registries = this.getAll();

    // Check for duplicate URLs
    if (registries.some(r => r.url === url)) {
      console.error('Registry URL already exists');
      return null;
    }

    const now = Date.now();
    const newRegistry: Registry = {
      id: this.generateId(),
      url: url.trim(),
      createdAt: now,
      updatedAt: now,
    };

    registries.push(newRegistry);
    LocalStorageService.setItem(this.STORAGE_KEY, registries);
    return newRegistry;
  }

  /**
   * Update an existing registry
   * @param id - The registry ID
   * @param url - The new URL
   * @returns The updated registry or null if failed
   */
  static update(id: string, url: string): Registry | null {
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL format');
      return null;
    }

    const registries = this.getAll();
    const index = registries.findIndex(r => r.id === id);

    if (index === -1) {
      console.error('Registry not found');
      return null;
    }

    // Check for duplicate URLs (excluding current registry)
    if (registries.some(r => r.id !== id && r.url === url)) {
      console.error('Registry URL already exists');
      return null;
    }

    registries[index].url = url.trim();
    registries[index].updatedAt = Date.now();

    LocalStorageService.setItem(this.STORAGE_KEY, registries);
    return registries[index];
  }

  /**
   * Delete a registry
   * @param id - The registry ID
   * @returns true if successful, false otherwise
   */
  static delete(id: string): boolean {
    const registries = this.getAll();
    const filteredRegistries = registries.filter(r => r.id !== id);

    if (filteredRegistries.length === registries.length) {
      console.error('Registry not found');
      return false;
    }

    LocalStorageService.setItem(this.STORAGE_KEY, filteredRegistries);
    return true;
  }

  /**
   * Delete all registries
   * @returns true if successful, false otherwise
   */
  static deleteAll(): boolean {
    LocalStorageService.setItem(this.STORAGE_KEY, []);
    return true;
  }

  /**
   * Generate a unique ID
   * @returns A unique ID string
   */
  private static generateId(): string {
    return `registry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate URL format
   * @param url - The URL to validate
   * @returns true if valid, false otherwise
   */
  private static isValidUrl(url: string): boolean {
    if (!url || url.trim().length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(url.trim());
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

