import { LocalStorageService } from './LocalStorageService';
import { RegistryDataService, type FusamAddon, type CachedRegistryData } from './RegistryDataService';
import { ModLoaderService } from './ModLoaderService';

/**
 * Mod Configuration
 * Stores user's mod preferences
 */
export interface ModConfig {
  modId: string;                    // Unique mod ID from registry
  registryId: string;               // Which registry this mod is from
  enabled: boolean;                 // Whether the mod is enabled
  selectedVersion: string;          // Selected distribution (e.g., "stable", "dev", "beta")
  installedAt: number;              // Timestamp when mod was first added
  updatedAt: number;                // Timestamp when config was last updated
}

/**
 * Mod with full details (combines config + registry data)
 */
export interface ModWithDetails extends ModConfig {
  name: string;
  description: string;
  author: string;
  repository?: string;
  tags?: string[];
  type?: string;
  icon?: string;
  website?: string;
  discord?: string;
  availableVersions: string[];      // List of available distributions
  sourceUrl?: string;               // URL to the selected version's source
}

/**
 * Mod Service
 * Manages user's mod configurations and preferences
 */
export class ModService {
  private static readonly STORAGE_KEY = 'bmm_mod_configs';

  /**
   * Get all mod configurations
   */
  static getAllConfigs(): ModConfig[] {
    const configs = LocalStorageService.getItem<ModConfig[]>(this.STORAGE_KEY);
    return configs || [];
  }

  /**
   * Get a mod configuration by ID
   */
  static getConfig(modId: string, registryId: string): ModConfig | null {
    const configs = this.getAllConfigs();
    return configs.find(c => c.modId === modId && c.registryId === registryId) || null;
  }

  /**
   * Add or update a mod configuration
   */
  static saveConfig(config: Omit<ModConfig, 'installedAt' | 'updatedAt'>): ModConfig {
    const configs = this.getAllConfigs();
    const existingIndex = configs.findIndex(
      c => c.modId === config.modId && c.registryId === config.registryId
    );

    const now = Date.now();
    let savedConfig: ModConfig;

    if (existingIndex !== -1) {
      // Update existing config
      savedConfig = {
        ...configs[existingIndex],
        ...config,
        updatedAt: now,
      };
      configs[existingIndex] = savedConfig;
    } else {
      // Create new config
      savedConfig = {
        ...config,
        installedAt: now,
        updatedAt: now,
      };
      configs.push(savedConfig);
    }

    LocalStorageService.setItem(this.STORAGE_KEY, configs);
    return savedConfig;
  }

  /**
   * Enable a mod
   */
  static enableMod(modId: string, registryId: string): boolean {
    const config = this.getConfig(modId, registryId);
    if (!config) return false;

    this.saveConfig({
      ...config,
      enabled: true,
    });
    return true;
  }

  /**
   * Change mod version
   */
  static changeVersion(modId: string, registryId: string, version: string): boolean {
    const config = this.getConfig(modId, registryId);
    if (!config) return false;

    this.saveConfig({
      ...config,
      selectedVersion: version,
    });
    return true;
  }

  /**
   * Remove a mod configuration
   */
  static removeConfig(modId: string, registryId: string): boolean {
    const configs = this.getAllConfigs();
    const config = configs.find(c => c.modId === modId && c.registryId === registryId);

    // Mark mod as disabled for refresh tracking if it was enabled
    if (config && config.enabled) {
      ModLoaderService.markModDisabled(modId, registryId);
    }

    const filtered = configs.filter(
      c => !(c.modId === modId && c.registryId === registryId)
    );

    if (filtered.length === configs.length) {
      return false; // Not found
    }

    LocalStorageService.setItem(this.STORAGE_KEY, filtered);
    return true;
  }

  /**
   * Get all mods with full details from cached registry data
   */
  static getAllModsWithDetails(): ModWithDetails[] {
    const configs = this.getAllConfigs();
    const cachedData = RegistryDataService.getAllCached();
    const modsWithDetails: ModWithDetails[] = [];

    // Create a map of cached data by registry ID
    const cacheMap = new Map<string, CachedRegistryData>();
    cachedData.forEach(cache => {
      cacheMap.set(cache.registryId, cache);
    });

    // Combine configs with registry data
    configs.forEach(config => {
      const cache = cacheMap.get(config.registryId);
      if (!cache || !cache.data) return;

      // Only handle fusam type for now
      if (cache.registryType === 'fusam') {
        const fusamData = cache.data as any;
        const addon = fusamData.addons?.find((a: FusamAddon) => a.id === config.modId);

        if (addon) {
          const availableVersions = addon.versions.map((v: any) => v.distribution);
          const selectedVersionData = addon.versions.find((v: any) => v.distribution === config.selectedVersion);

          modsWithDetails.push({
            ...config,
            name: addon.name,
            description: addon.description,
            author: addon.author,
            repository: addon.repository,
            tags: addon.tags,
            type: addon.type,
            icon: addon.icon,
            website: addon.website,
            discord: addon.discord,
            availableVersions: availableVersions,
            sourceUrl: selectedVersionData?.source,
          });
        }
      }
    });

    return modsWithDetails;
  }

  /**
   * Get available mods from all cached registries
   */
  static getAvailableMods(): Array<{
    addon: FusamAddon;
    registryId: string;
    registryUrl: string;
    config: ModConfig | null;
  }> {
    const configs = this.getAllConfigs();
    const cachedData = RegistryDataService.getAllCached();
    const availableMods: Array<{
      addon: FusamAddon;
      registryId: string;
      registryUrl: string;
      config: ModConfig | null;
    }> = [];

    cachedData.forEach(cache => {
      if (!cache.data || cache.error) return;

      // Only handle fusam type for now
      if (cache.registryType === 'fusam') {
        const fusamData = cache.data as any;
        fusamData.addons?.forEach((addon: FusamAddon) => {
          const config = configs.find(
            c => c.modId === addon.id && c.registryId === cache.registryId
          ) || null;

          availableMods.push({
            addon,
            registryId: cache.registryId,
            registryUrl: cache.registryUrl,
            config,
          });
        });
      }
    });

    return availableMods;
  }

  /**
   * Get enabled mods count
   */
  static getEnabledCount(): number {
    const configs = this.getAllConfigs();
    return configs.filter(c => c.enabled).length;
  }

  /**
   * Get total mods count
   */
  static getTotalCount(): number {
    return this.getAllConfigs().length;
  }

  /**
   * Get mod statistics
   */
  static getStats(): { total: number; enabled: number; disabled: number } {
    const configs = this.getAllConfigs();
    const enabled = configs.filter(c => c.enabled).length;
    return {
      total: configs.length,
      enabled,
      disabled: configs.length - enabled,
    };
  }

  /**
   * Clear all mod configurations
   */
  static clearAll(): void {
    LocalStorageService.setItem(this.STORAGE_KEY, []);
  }
}

