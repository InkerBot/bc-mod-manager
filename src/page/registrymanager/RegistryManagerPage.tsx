import {Component} from "preact";
import {type Registry, type RegistryType, RegistryService} from "../../service/RegistryService";
import {type CachedRegistryData, RegistryDataService} from "../../service/RegistryDataService";
import i18n from "../../i18n/i18n";

interface RegistryManagerState {
  registries: Registry[];
  cachedData: Map<string, CachedRegistryData>;
  fetchingIds: Set<string>;
  newUrl: string;
  newType: RegistryType;
  editingId: string | null;
  editingUrl: string;
  editingType: RegistryType;
  error: string | null;
}

export default class RegistryManagerPage extends Component<{}, RegistryManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      registries: RegistryService.getAll(),
      cachedData: new Map(),
      fetchingIds: new Set(),
      newUrl: '',
      newType: 'fusam',
      editingId: null,
      editingUrl: '',
      editingType: 'fusam',
      error: null,
    };
  }

  componentDidMount() {
    this.loadRegistries();
    this.loadCachedData();
  }

  loadRegistries = () => {
    this.setState({
      registries: RegistryService.getAll(),
    });
  };

  loadCachedData = () => {
    const allCached = RegistryDataService.getAllCached();
    const cachedMap = new Map<string, CachedRegistryData>();
    allCached.forEach(cached => {
      cachedMap.set(cached.registryId, cached);
    });
    this.setState({ cachedData: cachedMap });
  };

  handleNewUrlChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ newUrl: target.value, error: null });
  };

  handleNewTypeChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    this.setState({ newType: target.value as RegistryType, error: null });
  };

  handleEditUrlChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ editingUrl: target.value, error: null });
  };

  handleEditTypeChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    this.setState({ editingType: target.value as RegistryType, error: null });
  };

  handleAdd = () => {
    const { newUrl, newType } = this.state;

    if (!newUrl.trim()) {
      this.setState({ error: i18n('error-enter-url') });
      return;
    }

    const registry = RegistryService.add(newUrl, newType);

    if (registry) {
      this.setState({
        newUrl: '',
        newType: 'fusam',
        error: null,
      });
      this.loadRegistries();
    } else {
      this.setState({ error: i18n('error-add-registry-failed') });
    }
  };

  handleEdit = (registry: Registry) => {
    this.setState({
      editingId: registry.id,
      editingUrl: registry.url,
      editingType: registry.type,
      error: null,
    });
  };

  handleSaveEdit = () => {
    const { editingId, editingUrl, editingType } = this.state;

    if (!editingId) return;

    if (!editingUrl.trim()) {
      this.setState({ error: i18n('error-enter-url') });
      return;
    }

    const registry = RegistryService.update(editingId, editingUrl, editingType);

    if (registry) {
      this.setState({
        editingId: null,
        editingUrl: '',
        editingType: 'fusam',
        error: null,
      });
      this.loadRegistries();
    } else {
      this.setState({ error: i18n('error-update-registry-failed') });
    }
  };

  handleCancelEdit = () => {
    this.setState({
      editingId: null,
      editingUrl: '',
      editingType: 'fusam',
      error: null,
    });
  };

  handleDelete = (id: string) => {
    if (confirm(i18n('confirm-delete-registry'))) {
      const success = RegistryService.delete(id);

      if (success) {
        // Also clear cached data
        RegistryDataService.clearCache(id);
        this.loadRegistries();
        this.loadCachedData();
      } else {
        this.setState({ error: i18n('error-delete-registry-failed') });
      }
    }
  };

  handleFetchRegistry = async (registry: Registry) => {
    const { fetchingIds } = this.state;

    // Prevent multiple simultaneous fetches
    if (fetchingIds.has(registry.id)) {
      return;
    }

    // Add to fetching set
    fetchingIds.add(registry.id);
    this.setState({ fetchingIds: new Set(fetchingIds), error: null });

    try {
      const cachedData = await RegistryDataService.fetchRegistry(registry);

      // Update cached data
      this.loadCachedData();

      // Remove from fetching set
      fetchingIds.delete(registry.id);
      this.setState({ fetchingIds: new Set(fetchingIds) });

      if (cachedData.error) {
        this.setState({ error: i18n('error-fetch-registry-failed', { error: cachedData.error }) });
      }
    } catch (error) {
      console.error('Error fetching registry:', error);
      fetchingIds.delete(registry.id);
      this.setState({
        fetchingIds: new Set(fetchingIds),
        error: i18n('error-fetch-registry-failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };

  handleFetchAllRegistries = async () => {
    const { registries } = this.state;

    if (registries.length === 0) {
      this.setState({ error: i18n('error-no-registries-to-fetch') });
      return;
    }

    // Mark all as fetching
    const fetchingIds = new Set(registries.map(r => r.id));
    this.setState({ fetchingIds, error: null });

    try {
      await RegistryDataService.fetchAllRegistries(registries);

      // Update cached data
      this.loadCachedData();

      // Clear fetching state
      this.setState({ fetchingIds: new Set() });
    } catch (error) {
      console.error('Error fetching registries:', error);
      this.setState({
        fetchingIds: new Set(),
        error: i18n('error-fetch-registries-failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };

  render() {
    const { registries, cachedData, fetchingIds, newUrl, newType, editingId, editingUrl, editingType, error } = this.state;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">{i18n('title-registry-manager')}</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Add New Registry */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">{i18n('title-add-new-registry')}</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onInput={this.handleNewUrlChange}
              placeholder={i18n('placeholder-registry-url')}
              className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <select
              value={newType}
              onChange={this.handleNewTypeChange}
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="fusam">{i18n('registry-type-fusam')}</option>
              <option value="aurora">{i18n('registry-type-aurora')}</option>
            </select>
            <button
              onClick={this.handleAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              {i18n('button-add')}
            </button>
          </div>
        </div>

        {/* Registry List */}
        <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-blue-100">
            <h2 className="text-xl font-semibold text-blue-800">{i18n('title-registered-registries')}</h2>
            <button
              onClick={this.handleFetchAllRegistries}
              disabled={registries.length === 0 || fetchingIds.size > 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              title={i18n('button-fetch-all')}
            >
              {fetchingIds.size > 0 ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  {i18n('button-fetching')}
                </>
              ) : (
                <>
                  <span>↻</span>
                  {i18n('button-fetch-all')}
                </>
              )}
            </button>
          </div>

          {registries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {i18n('message-no-registries')}
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {registries.map((registry) => (
                <div key={registry.id} className="p-4 hover:bg-blue-50 transition-colors">
                  {editingId === registry.id ? (
                    // Edit Mode
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingUrl}
                        onInput={this.handleEditUrlChange}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      <select
                        value={editingType}
                        onChange={this.handleEditTypeChange}
                        className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="fusam">{i18n('registry-type-fusam')}</option>
                        <option value="aurora">{i18n('registry-type-aurora')}</option>
                      </select>
                      <button
                        onClick={this.handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {i18n('button-save')}
                      </button>
                      <button
                        onClick={this.handleCancelEdit}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                      >
                        {i18n('button-cancel')}
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-blue-700 font-medium break-all">{registry.url}</div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            registry.type === 'fusam'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {registry.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {i18n('label-added')}: {new Date(registry.createdAt).toLocaleString()}
                          {registry.updatedAt !== registry.createdAt && (
                            <span className="ml-2">
                              | {i18n('label-updated')}: {new Date(registry.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Cache Information */}
                        {(() => {
                          const cached = cachedData.get(registry.id);
                          if (cached) {
                            return (
                              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="flex items-center gap-4 text-xs">
                                  {cached.error ? (
                                    <span className="text-red-600 font-medium">
                                      ❌ {i18n('label-error')}: {cached.error}
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-green-600 font-medium">
                                        ✓ {cached.modCount} {cached.modCount !== 1 ? i18n('label-mods') : i18n('label-mod')}
                                      </span>
                                      <span className="text-gray-600">
                                        {i18n('label-cached')}: {RegistryDataService.formatCacheAge(cached)}
                                      </span>
                                      <span className="text-gray-500">
                                        ({new Date(cached.fetchedAt).toLocaleString()})
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => this.handleFetchRegistry(registry)}
                          disabled={fetchingIds.has(registry.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          title={i18n('title-fetch-registry')}
                        >
                          {fetchingIds.has(registry.id) ? (
                            <>
                              <span className="inline-block animate-spin">⟳</span>
                              {i18n('button-fetching')}
                            </>
                          ) : (
                            <>
                              <span>↻</span>
                              {i18n('button-fetch')}
                            </>
                          )}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => this.handleEdit(registry)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            title={i18n('title-edit-registry')}
                          >
                            {i18n('button-edit')}
                          </button>
                          <button
                            onClick={() => this.handleDelete(registry.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                            title={i18n('title-delete-registry')}
                          >
                            {i18n('button-delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registry Count */}
        {registries.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            {i18n('message-total-registries', { count: registries.length.toString() })}
          </div>
        )}
      </div>
    );
  }
}
