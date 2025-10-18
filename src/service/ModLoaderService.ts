import {ModService} from './ModService';
import {LogService} from './LogService';

/**
 * Mod Loader Service
 * Handles loading and injecting mod scripts into the page
 */
export class ModLoaderService {
  private static loadedMods: Set<string> = new Set();
  private static initialEnabledMods: Set<string> = new Set();
  private static hasDisabledMods: boolean = false;
  private static scheduledPreload: number | null = null;
  private static scheduledLoad: number | null = null;

  /**
   * Initialize the mod loader
   * Loads all enabled mods on startup
   */
  static initialize(): void {
    LogService.info('ModLoaderService: Initializing mod loader');

    // Track initially enabled mods
    const enabledMods = ModService.getAllModsWithDetails().filter(mod => mod.enabled);
    enabledMods.forEach(mod => {
      const modKey = `${mod.modId}_${mod.registryId}`;
      this.initialEnabledMods.add(modKey);
    });

    LogService.info(`ModLoaderService: Initialize succeed`);
  }

  /**
   * Load all enabled mods
   */
  static loadAllEnabledMods(): void {
    if (typeof Player !== "undefined" && !!Player) {
      this.loadAllEnabledModsImpl();
    } else if (!this.scheduledLoad) {
      this.scheduledLoad = setInterval(() => {
        if (typeof Player !== "undefined" && !!Player) {
          clearInterval(this.scheduledLoad!);
          this.scheduledLoad = null;
          this.loadAllEnabledModsImpl();
        }
      }, 5);
    }
  }

  static preloadAllEnabledMods(): void {
    if (document.head !== null) {
      this.preloadAllEnabledModsImpl();
    } else if (!this.scheduledPreload) {
      this.scheduledPreload = setInterval(() => {
        if (document.head !== null) {
          clearInterval(this.scheduledPreload!);
          this.scheduledPreload = null;
          this.preloadAllEnabledModsImpl();
        }
      }, 5);
    }
  }

  private static preloadAllEnabledModsImpl(): void {
    const modsWithDetails = ModService.getAllModsWithDetails();
    const enabledMods = modsWithDetails.filter(mod => mod.enabled && mod.type == 'module');
    enabledMods.forEach(mod => {
      this.preloadMod(mod.modId, mod.type, mod.registryId, mod.sourceUrl, mod.name, mod.selectedVersion);
    });
    LogService.info(`ModLoaderService: Preloaded ${enabledMods.length} enabled mods`);
  }

  /**
   * Load a single mod by injecting its script into the page
   */
  static loadMod(modId: string, type: string, registryId: string, sourceUrl: string | undefined, modName: string, distribution: string = 'unknown'): void {
    const modKey = `${modId}_${registryId}`;

    // Skip if already loaded
    if (this.loadedMods.has(modKey)) {
      LogService.debug(`ModLoaderService: Mod ${modName} (${modKey}) already loaded, skipping`);
      return;
    }

    // Skip if no source URL
    if (!sourceUrl) {
      LogService.warn(`ModLoaderService: Mod ${modName} (${modKey}) has no source URL, skipping`);
      return;
    }

    try {
      LogService.info(`ModLoaderService: Loading mod ${modName} from ${sourceUrl}`);

      // Register in FUSAM as loading if available
      if (window.FUSAM) {
        window.FUSAM.addons[modId] = {
          distribution: distribution,
          status: 'loading'
        };
      }

      // Create script element
      const script = document.createElement('script');
      script.src = sourceUrl;
      switch (type) {
        case 'module':
          script.type = 'module';
          break;
        case 'script':
        default:
          script.type = 'text/javascript';
          break;
      }
      script.async = true;
      script.crossOrigin = "anonymous";

      script.setAttribute('data-mod-id', modId);
      script.setAttribute('data-registry-id', registryId);
      script.setAttribute('data-mod-name', modName);
      script.setAttribute('data-distribution', distribution);

      // Add load event listener
      script.onload = () => {
        LogService.info(`ModLoaderService: Successfully loaded mod ${modName}`);
        this.loadedMods.add(modKey);

        // Update FUSAM status to loaded
        if (window.FUSAM) {
          window.FUSAM.addons[modId] = {
            distribution: distribution,
            status: 'loaded'
          };
        }
      };

      // Add error event listener
      script.onerror = (error) => {
        LogService.error(`ModLoaderService: Failed to load mod ${modName}`, error);

        // Update FUSAM status to error
        if (window.FUSAM) {
          window.FUSAM.addons[modId] = {
            distribution: distribution,
            status: 'error'
          };
        }
      };

      // Inject script into body
      document.head.appendChild(script);

      LogService.debug(`ModLoaderService: Script element created and appended for ${modName}`);
    } catch (error) {
      LogService.error(`ModLoaderService: Error loading mod ${modName}`, error);

      // Update FUSAM status to error
      if (window.FUSAM) {
        window.FUSAM.addons[modId] = {
          distribution: distribution,
          status: 'error'
        };
      }
    }
  }

  static preloadMod(modId: string, type: string | undefined, registryId: string, sourceUrl: string | undefined, modName: string, distribution: string = 'unknown'): void {
    const modKey = `${modId}_${registryId}`;

    // Skip if already loaded
    if (this.loadedMods.has(modKey)) {
      LogService.debug(`ModLoaderService: Mod ${modName} (${modKey}) already loaded, skipping`);
      return;
    }

    // Skip if no source URL
    if (!sourceUrl) {
      LogService.warn(`ModLoaderService: Mod ${modName} (${modKey}) has no source URL, skipping`);
      return;
    }

    try {
      LogService.info(`ModLoaderService: Preloading mod ${modName} from ${sourceUrl}`);
      const link = document.createElement('link');
      switch (type) {
        case 'module':
          link.rel = 'modulepreload';
          break;
        case 'script':
        default:
          link.rel = 'preload';
          link.as = 'script';
          break;
      }
      link.href = sourceUrl;
      link.setAttribute('data-mod-id', modId);
      link.setAttribute('data-registry-id', registryId);
      link.setAttribute('data-mod-name', modName);
      link.setAttribute('data-distribution', distribution);
      document.head.appendChild(link);
      LogService.debug(`ModLoaderService: Script element created and appended for ${modName}`);
    } catch (error) {
      LogService.error(`ModLoaderService: Error preloading mod ${modName}`, error);
    }
  }

  /**
   * Check if a mod is currently loaded
   */
  static isModLoaded(modId: string, registryId: string): boolean {
    const modKey = `${modId}_${registryId}`;
    return this.loadedMods.has(modKey);
  }

  /**
   * Mark that a mod has been disabled
   * This will trigger a page refresh when the mod manager closes
   */
  static markModDisabled(modId: string, registryId: string): void {
    const modKey = `${modId}_${registryId}`;

    // Only mark as disabled if it was initially enabled
    if (this.initialEnabledMods.has(modKey)) {
      LogService.info(`ModLoaderService: Mod ${modKey} has been disabled, page refresh will be required`);
      this.hasDisabledMods = true;
    }
  }

  /**
   * Check if any mods have been disabled during this session
   */
  static hasModsBeenDisabled(): boolean {
    return this.hasDisabledMods;
  }

  /**
   * Reset the disabled mods flag
   */
  static resetDisabledFlag(): void {
    this.hasDisabledMods = false;
  }

  /**
   * Refresh the page if mods have been disabled
   * Should be called when the mod manager closes
   */
  static refreshIfNeeded(): void {
    if (this.hasDisabledMods) {
      LogService.info('ModLoaderService: Mods have been disabled, refreshing page...');
      window.location.reload();
    } else {
      this.loadAllEnabledMods();
    }
  }

  /**
   * Get statistics about loaded mods
   */
  static getStats(): {
    loadedCount: number;
    enabledCount: number;
    hasDisabledMods: boolean;
  } {
    const enabledCount = ModService.getEnabledCount();
    return {
      loadedCount: this.loadedMods.size,
      enabledCount: enabledCount,
      hasDisabledMods: this.hasDisabledMods,
    };
  }

  /**
   * Get list of loaded mod keys
   */
  static getLoadedMods(): string[] {
    return Array.from(this.loadedMods);
  }

  /**
   * Unload all mods (remove script tags)
   * Note: This may not fully unload mods that have already executed
   */
  static unloadAllMods(): void {
    LogService.info('ModLoaderService: Unloading all mods');

    // Find all mod script elements
    const modScripts = document.querySelectorAll('script[data-mod-id]');
    modScripts.forEach(script => {
      script.remove();
    });

    // Clear loaded mods set
    this.loadedMods.clear();

    LogService.info('ModLoaderService: All mod scripts removed');
  }

  private static loadAllEnabledModsImpl(): void {
    const modsWithDetails = ModService.getAllModsWithDetails();
    const enabledMods = modsWithDetails.filter(mod => mod.enabled);

    LogService.info(`ModLoaderService: Loading ${enabledMods.length} enabled mods`);

    enabledMods.forEach(mod => {
      this.loadMod(mod.modId, mod.type || 'script', mod.registryId, mod.sourceUrl, mod.name, mod.selectedVersion);
    });
  }
}

