import {LocalStorageService} from './LocalStorageService';
import {LogService} from "./LogService.ts";
import {RegistryDataService} from "./RegistryDataService.ts";

/**
 * Registry type options
 */
export type RegistryType = 'fusam' | 'aurora';

/**
 * Registry interface
 * Represents a mod registry with a unique ID, URL, and type
 */
export interface Registry {
  id: string;
  url: string;
  type: RegistryType;
  createdAt: number;
  updatedAt: number;
  isPreset?: boolean;
}

/**
 * Registry Service
 * Manages mod registries with CRUD operations
 */
export class RegistryService {
  private static readonly STORAGE_KEY = 'bmm_registries';

  /**
   * Preset registry URLs that cannot be deleted or modified
   */
  private static readonly PRESET_REGISTRIES: Registry[] = [
    {
      id: 'sidiousious',
      url: 'https://sidiousious.gitlab.io/bc-addon-loader/manifest.json',
      type: 'fusam',
      createdAt: Date.parse('2025-10-16T00:00:00Z'),
      updatedAt: Date.parse('2025-10-16T00:00:00Z'),
      isPreset: true,
    },
    {
      id: 'inkerbot',
      url: 'https://inkerbot.github.io/bc-mod-manager/manifest.json',
      type: 'fusam',
      createdAt: Date.parse('2025-10-16T00:00:00Z'),
      updatedAt: Date.parse('2025-10-16T00:00:00Z'),
      isPreset: true,
    },
    {
      id: 'awdrrawd',
      url: 'https://cdn.jsdelivr.net/gh/awdrrawd/liko-Plugin-Repository@main/manifest.json',
      type: 'fusam',
      createdAt: Date.parse('2025-10-18T00:00:00Z'),
      updatedAt: Date.parse('2025-10-18T00:00:00Z'),
      isPreset: true,
    },
  ];


  static getAll(): Registry[] {
    return [...this.PRESET_REGISTRIES, ...this.getAllUser()];
  }

  /**
   * Get all registries
   * @returns Array of all registries
   */
  static getAllUser(): Registry[] {
    let registries = LocalStorageService.getItem<Registry[]>(this.STORAGE_KEY);
    if (registries == null) {
      registries = []
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
   * @param type - The registry type (default: 'fusam')
   * @returns The created registry or null if failed
   */
  static add(url: string, type: RegistryType = 'fusam'): Registry | null {
    if (!this.isValidUrl(url)) {
      LogService.error('Invalid URL format');
      return null;
    }

    const registries = this.getAllUser();

    // Check for duplicate URLs
    if (registries.some(r => r.url === url)) {
      LogService.error('Registry URL already exists');
      return null;
    }

    const now = Date.now();
    const newRegistry: Registry = {
      id: this.generateId(),
      url: url.trim(),
      type: type,
      createdAt: now,
      updatedAt: now,
    };

    registries.push(newRegistry);
    LocalStorageService.setItem(this.STORAGE_KEY, registries);
    RegistryDataService.fetchRegistry(newRegistry)
      .catch(error => {
        LogService.error('Error fetching registry:', error);
      });
    return newRegistry;
  }

  /**
   * Update an existing registry
   * @param id - The registry ID
   * @param url - The new URL
   * @param type - The registry type (optional)
   * @returns The updated registry or null if failed
   */
  static update(id: string, url: string, type?: RegistryType): Registry | null {
    if (!this.isValidUrl(url)) {
      LogService.error('Invalid URL format');
      return null;
    }

    const registries = this.getAllUser();
    const index = registries.findIndex(r => r.id === id);

    if (index === -1) {
      LogService.error('Registry not found');
      return null;
    }

    // Check for duplicate URLs (excluding current registry)
    if (registries.some(r => r.id !== id && r.url === url)) {
      LogService.error('Registry URL already exists');
      return null;
    }

    registries[index].url = url.trim();
    if (type !== undefined) {
      registries[index].type = type;
    }
    registries[index].updatedAt = Date.now();

    LocalStorageService.setItem(this.STORAGE_KEY, registries);

    RegistryDataService.fetchRegistry(registries[index])
      .catch(error => {
        LogService.error('Error fetching registry:', error);
      });

    return registries[index];
  }

  /**
   * Delete a registry
   * @param id - The registry ID
   * @returns true if successful, false otherwise
   */
  static delete(id: string): boolean {
    const registries = this.getAllUser();
    const filteredRegistries = registries.filter(r => r.id !== id);

    if (filteredRegistries.length === registries.length) {
      LogService.error('Registry not found');
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

