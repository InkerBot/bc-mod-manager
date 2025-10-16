import {Component} from "preact";
import {type ModConfig, ModService} from "../../service/ModService";
import {type FusamAddon} from "../../service/RegistryDataService";
import i18n from "../../i18n/i18n.ts";
import CustomExtensionModal from "../../component/CustomExtensionModal";

interface ModManagerState {
  availableMods: Array<{
    addon: FusamAddon;
    registryId: string;
    registryUrl: string;
    config: ModConfig | null;
  }>;
  filter: 'all' | 'enabled' | 'disabled';
  searchQuery: string;
  error: string | null;
  expandedModId: string | null;
  // Track selected versions for mods that aren't installed yet
  pendingVersions: Map<string, string>; // key: `${modId}_${registryId}`, value: version
  showCustomExtensionModal: boolean;
}

export default class ModManagerPage extends Component<{}, ModManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      availableMods: [],
      filter: 'all',
      searchQuery: '',
      error: null,
      expandedModId: null,
      pendingVersions: new Map(),
      showCustomExtensionModal: false,
    };
  }

  componentDidMount() {
    this.loadMods();
  }

  loadMods = () => {
    const availableMods = ModService.getAvailableMods();
    this.setState({availableMods});
  };

  handleInstallMod = (modId: string, registryId: string) => {
    const uniqueKey = `${modId}_${registryId}`;
    const config = ModService.getConfig(modId, registryId);

    if (!config) {
      // Get the selected version from pendingVersions or use default
      const selectedVersion = this.state.pendingVersions.get(uniqueKey);
      const mod = this.state.availableMods.find(
        m => m.addon.id === modId && m.registryId === registryId
      );

      if (mod && mod.addon.versions.length > 0) {
        ModService.saveConfig({
          modId,
          registryId,
          enabled: true,
          selectedVersion: selectedVersion || mod.addon.versions[0].distribution,
        });

        // Clear pending version after install
        const newPendingVersions = new Map(this.state.pendingVersions);
        newPendingVersions.delete(uniqueKey);
        this.setState({pendingVersions: newPendingVersions});
      }
    } else {
      ModService.enableMod(modId, registryId);
    }
    this.loadMods();
  };

  handleVersionChange = (modId: string, registryId: string, version: string, isInstalled: boolean) => {
    const uniqueKey = `${modId}_${registryId}`;

    if (isInstalled) {
      // For installed mods, update the config directly
      ModService.changeVersion(modId, registryId, version);
      this.loadMods();
    } else {
      // For non-installed mods, store in pendingVersions
      const newPendingVersions = new Map(this.state.pendingVersions);
      newPendingVersions.set(uniqueKey, version);
      this.setState({pendingVersions: newPendingVersions});
    }
  };

  handleRemoveMod = (modId: string, registryId: string) => {
    if (confirm('Are you sure you want to remove this mod?')) {
      const uniqueKey = `${modId}_${registryId}`;
      ModService.removeConfig(modId, registryId);

      // Clear pending version if exists
      const newPendingVersions = new Map(this.state.pendingVersions);
      newPendingVersions.delete(uniqueKey);
      this.setState({pendingVersions: newPendingVersions});

      this.loadMods();
    }
  };

  handleFilterChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    this.setState({filter: target.value as 'all' | 'enabled' | 'disabled'});
  };

  handleSearchChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({searchQuery: target.value});
  };

  toggleExpanded = (modId: string) => {
    this.setState(prevState => ({
      expandedModId: prevState.expandedModId === modId ? null : modId,
    }));
  };

  handleOpenCustomExtensionModal = () => {
    this.setState({showCustomExtensionModal: true});
  };

  handleCloseCustomExtensionModal = () => {
    this.setState({showCustomExtensionModal: false});
  };

  handleCustomExtensionChanged = () => {
    // Reload mods when custom extensions are added/updated/deleted
    this.loadMods();
  };

  getFilteredMods = () => {
    const {availableMods, filter, searchQuery} = this.state;

    let filtered = availableMods;

    // Apply enabled/disabled filter
    if (filter === 'enabled') {
      filtered = filtered.filter(m => m.config?.enabled);
    } else if (filter === 'disabled') {
      filtered = filtered.filter(m => !m.config?.enabled);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.addon.name.toLowerCase().includes(query) ||
        m.addon.description.toLowerCase().includes(query) ||
        m.addon.author.toLowerCase().includes(query) ||
        m.addon.id.toLowerCase().includes(query) ||
        m.addon.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  render() {
    const {error, expandedModId, showCustomExtensionModal} = this.state;
    const filteredMods = this.getFilteredMods();
    const enabledCount = ModService.getEnabledCount();
    const totalCount = this.state.availableMods.length;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-600">{i18n('title-mod-manager')}</h1>
          <button
            onClick={this.handleOpenCustomExtensionModal}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
          >
            + {i18n('button-manage-custom-extensions')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-600">{i18n('label-total-mods')}:</span>
              <span className="ml-2 text-lg font-bold text-blue-700">{totalCount}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">{i18n('label-enabled-mods')}:</span>
              <span className="ml-2 text-lg font-bold text-green-600">{enabledCount}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">{i18n('label-disabled-mods')}:</span>
              <span className="ml-2 text-lg font-bold text-gray-600">{totalCount - enabledCount}</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 p-4 bg-white border border-blue-200 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={i18n('placeholder-search-mods')}
                value={this.state.searchQuery}
                onInput={this.handleSearchChange}
                className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <select
              value={this.state.filter}
              onChange={this.handleFilterChange}
              className="px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">{i18n('filter-all-mods')}</option>
              <option value="enabled">{i18n('filter-enabled-only')}</option>
              <option value="disabled">{i18n('filter-disabled-only')}</option>
            </select>
          </div>
        </div>

        {/* Mod List */}
        <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
          {filteredMods.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {totalCount === 0 ? (
                <>
                  <p className="mb-2">{i18n('no-mods-available')}</p>
                  <p className="text-sm">{i18n('no-mods-available-detail')}</p>
                </>
              ) : (
                <p>{i18n('no-mods-match-search')}</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {filteredMods.map((mod) => {
                const isEnabled = mod.config?.enabled || false;
                const uniqueId = `${mod.addon.id}_${mod.registryId}`;

                // Get selected version: from config if installed, from pendingVersions if not, or default
                const selectedVersion = isEnabled
                  ? (mod.config?.selectedVersion || mod.addon.versions[0]?.distribution || '')
                  : (this.state.pendingVersions.get(uniqueId) || mod.addon.versions[0]?.distribution || '');

                const isExpanded = expandedModId === uniqueId;

                return (
                  <div key={uniqueId} className="p-4 hover:bg-blue-50 transition-colors">
                    {/* Mod Header */}
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      {mod.addon.icon && (
                        <img
                          src={mod.addon.icon}
                          alt={mod.addon.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-blue-700">{mod.addon.name}</h3>
                          {mod.addon.tags && mod.addon.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {mod.addon.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Author and ID */}
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">by {mod.addon.author}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">ID: {mod.addon.id}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {mod.addon.description}
                        </p>

                        {/* Controls Row */}
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Status Badge */}
                          {isEnabled && (
                            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded">
                              ✓ {i18n('label-installed')}
                            </span>
                          )}

                          {/* Version Selector - Always show if versions available */}
                          {mod.addon.versions.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{i18n('label-selected-version')}:</span>
                              <select
                                value={selectedVersion}
                                onChange={(e) => this.handleVersionChange(
                                  mod.addon.id,
                                  mod.registryId,
                                  (e.target as HTMLSelectElement).value,
                                  isEnabled
                                )}
                                className="px-3 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                              >
                                {mod.addon.versions.map(v => (
                                  <option key={v.distribution} value={v.distribution}>
                                    {v.distribution}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => this.toggleExpanded(uniqueId)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {isExpanded ? ('▼ ' + i18n('button-less')) : ('▶ ' + i18n('button-more'))}
                          </button>

                          {/* Install/Remove Button */}
                          <div className="ml-auto">
                            {isEnabled ? (
                              <button
                                onClick={() => this.handleRemoveMod(mod.addon.id, mod.registryId)}
                                className="px-4 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                                title="Remove this mod"
                              >
                                {i18n('button-remove-mod')}
                              </button>
                            ) : (
                              <button
                                onClick={() => this.handleInstallMod(mod.addon.id, mod.registryId)}
                                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                                title="Install this mod"
                              >
                                {i18n('button-install-mod')}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {mod.addon.repository && (
                                <div>
                                  <span className="font-semibold text-gray-700">{i18n('label-repository')}:</span>
                                  <a
                                    href={mod.addon.repository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:underline break-all"
                                  >
                                    {mod.addon.repository}
                                  </a>
                                </div>
                              )}
                              {mod.addon.website && (
                                <div>
                                  <span className="font-semibold text-gray-700">{i18n('label-website')}:</span>
                                  <a
                                    href={mod.addon.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:underline break-all"
                                  >
                                    {mod.addon.website}
                                  </a>
                                </div>
                              )}
                              {mod.addon.discord && (
                                <div>
                                  <span className="font-semibold text-gray-700">{i18n('label-discord')}:</span>
                                  <a
                                    href={mod.addon.discord}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:underline"
                                  >
                                    {i18n('button-join-discord')}
                                  </a>
                                </div>
                              )}
                              {mod.addon.type && (
                                <div>
                                  <span className="font-semibold text-gray-700">{i18n('label-type')}:</span>
                                  <span className="ml-2 text-gray-600">{mod.addon.type}</span>
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-gray-700">{i18n('label-registry')}:</span>
                                <span className="ml-2 text-gray-600 text-xs break-all">{mod.registryUrl}</span>
                              </div>
                              {mod.addon.versions.length > 0 && (
                                <div className="md:col-span-2">
                                  <span
                                    className="font-semibold text-gray-700">{i18n('label-available-versions')}:</span>
                                  <div className="mt-1 flex gap-2 flex-wrap">
                                    {mod.addon.versions.map(v => (
                                      <span
                                        key={v.distribution}
                                        className={`px-2 py-1 text-xs rounded ${
                                          v.distribution === selectedVersion
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {v.distribution}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredMods.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            {i18n('showing-x-of-y-mods', {x: filteredMods.length, y: totalCount})}
          </div>
        )}

        {/* Custom Extension Modal */}
        {showCustomExtensionModal && (
          <CustomExtensionModal
            onClose={this.handleCloseCustomExtensionModal}
            onExtensionAdded={this.handleCustomExtensionChanged}
          />
        )}
      </div>
    );
  }
}
