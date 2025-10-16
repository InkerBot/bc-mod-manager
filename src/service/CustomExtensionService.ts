import {LocalStorageService} from './LocalStorageService';
import {LogService} from './LogService';

/**
 * Custom Extension Definition
 * Allows users to add their own extensions (including local development ones)
 */
export interface CustomExtension {
  id: string;                       // Unique ID for the custom extension
  name: string;                     // Display name
  description: string;              // Description
  author: string;                   // Author name
  sourceUrl: string;                // URL to the extension script
  type: 'script' | 'module';        // Script type
  icon?: string;                    // Optional icon URL
  repository?: string;              // Optional repository URL
  website?: string;                 // Optional website URL
  tags?: string[];                  // Optional tags
  createdAt: number;                // Timestamp when added
  updatedAt: number;                // Timestamp when last updated
}

/**
 * Custom Extension Service
 * Manages user-defined custom extensions
 */
export class CustomExtensionService {
  private static readonly STORAGE_KEY = 'bmm_custom_extensions';
  private static readonly CUSTOM_REGISTRY_ID = '__custom__';

  /**
   * Get the special registry ID for custom extensions
   */
  static getCustomRegistryId(): string {
    return this.CUSTOM_REGISTRY_ID;
  }

  /**
   * Get all custom extensions
   */
  static getAll(): CustomExtension[] {
    const extensions = LocalStorageService.getItem<CustomExtension[]>(this.STORAGE_KEY);
    return extensions || [];
  }

  /**
   * Get a custom extension by ID
   */
  static get(id: string): CustomExtension | null {
    const extensions = this.getAll();
    return extensions.find(ext => ext.id === id) || null;
  }

  /**
   * Add a new custom extension
   */
  static add(extension: Omit<CustomExtension, 'id' | 'createdAt' | 'updatedAt'>): CustomExtension | null {
    try {
      // Validate required fields
      if (!extension.name || !extension.sourceUrl) {
        LogService.error('CustomExtensionService: Name and source URL are required');
        return null;
      }

      // Validate URL format
      if (!this.isValidUrl(extension.sourceUrl)) {
        LogService.error('CustomExtensionService: Invalid source URL format');
        return null;
      }

      const extensions = this.getAll();

      // Generate unique ID
      const id = this.generateId();

      const now = Date.now();
      const newExtension: CustomExtension = {
        ...extension,
        id,
        author: extension.author || 'Unknown',
        description: extension.description || '',
        type: extension.type || 'script',
        createdAt: now,
        updatedAt: now,
      };

      extensions.push(newExtension);
      LocalStorageService.setItem(this.STORAGE_KEY, extensions);

      LogService.info(`CustomExtensionService: Added custom extension: ${newExtension.name}`);
      return newExtension;
    } catch (error) {
      LogService.error('CustomExtensionService: Error adding custom extension', error);
      return null;
    }
  }

  /**
   * Update an existing custom extension
   */
  static update(id: string, updates: Partial<Omit<CustomExtension, 'id' | 'createdAt' | 'updatedAt'>>): CustomExtension | null {
    try {
      const extensions = this.getAll();
      const index = extensions.findIndex(ext => ext.id === id);

      if (index === -1) {
        LogService.error('CustomExtensionService: Extension not found');
        return null;
      }

      // Validate URL if being updated
      if (updates.sourceUrl && !this.isValidUrl(updates.sourceUrl)) {
        LogService.error('CustomExtensionService: Invalid source URL format');
        return null;
      }

      const updatedExtension: CustomExtension = {
        ...extensions[index],
        ...updates,
        updatedAt: Date.now(),
      };

      extensions[index] = updatedExtension;
      LocalStorageService.setItem(this.STORAGE_KEY, extensions);

      LogService.info(`CustomExtensionService: Updated custom extension: ${updatedExtension.name}`);
      return updatedExtension;
    } catch (error) {
      LogService.error('CustomExtensionService: Error updating custom extension', error);
      return null;
    }
  }

  /**
   * Remove a custom extension
   */
  static remove(id: string): boolean {
    try {
      const extensions = this.getAll();
      const filtered = extensions.filter(ext => ext.id !== id);

      if (filtered.length === extensions.length) {
        LogService.error('CustomExtensionService: Extension not found');
        return false;
      }

      LocalStorageService.setItem(this.STORAGE_KEY, filtered);
      LogService.info(`CustomExtensionService: Removed custom extension: ${id}`);
      return true;
    } catch (error) {
      LogService.error('CustomExtensionService: Error removing custom extension', error);
      return false;
    }
  }

  /**
   * Convert custom extensions to FusamAddon format for compatibility
   */
  static toFusamAddons(): Array<{
    id: string;
    name: string;
    description: string;
    author: string;
    repository?: string;
    tags?: string[];
    type?: string;
    icon?: string;
    website?: string;
    versions: Array<{
      distribution: string;
      source: string;
    }>;
  }> {
    const extensions = this.getAll();
    return extensions.map(ext => ({
      id: ext.id,
      name: ext.name,
      description: ext.description,
      author: ext.author,
      repository: ext.repository,
      tags: ext.tags || ['custom'],
      type: ext.type,
      icon: ext.icon,
      website: ext.website,
      versions: [
        {
          distribution: 'custom',
          source: ext.sourceUrl,
        },
      ],
    }));
  }

  /**
   * Clear all custom extensions
   */
  static clearAll(): void {
    LocalStorageService.setItem(this.STORAGE_KEY, []);
    LogService.info('CustomExtensionService: Cleared all custom extensions');
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'file:';
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

