import {Component} from "preact";
import {type Registry, RegistryService} from "../../service/RegistryService";

interface RegistryManagerState {
  registries: Registry[];
  newUrl: string;
  editingId: string | null;
  editingUrl: string;
  error: string | null;
}

export default class RegistryManagerPage extends Component<{}, RegistryManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      registries: RegistryService.getAll(),
      newUrl: '',
      editingId: null,
      editingUrl: '',
      error: null,
    };
  }

  componentDidMount() {
    this.loadRegistries();
  }

  loadRegistries = () => {
    this.setState({
      registries: RegistryService.getAll(),
    });
  };

  handleNewUrlChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ newUrl: target.value, error: null });
  };

  handleEditUrlChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ editingUrl: target.value, error: null });
  };

  handleAdd = () => {
    const { newUrl } = this.state;

    if (!newUrl.trim()) {
      this.setState({ error: 'Please enter a URL' });
      return;
    }

    const registry = RegistryService.add(newUrl);

    if (registry) {
      this.setState({
        newUrl: '',
        error: null,
      });
      this.loadRegistries();
    } else {
      this.setState({ error: 'Failed to add registry. Please check the URL is valid and not a duplicate.' });
    }
  };

  handleEdit = (registry: Registry) => {
    this.setState({
      editingId: registry.id,
      editingUrl: registry.url,
      error: null,
    });
  };

  handleSaveEdit = () => {
    const { editingId, editingUrl } = this.state;

    if (!editingId) return;

    if (!editingUrl.trim()) {
      this.setState({ error: 'Please enter a URL' });
      return;
    }

    const registry = RegistryService.update(editingId, editingUrl);

    if (registry) {
      this.setState({
        editingId: null,
        editingUrl: '',
        error: null,
      });
      this.loadRegistries();
    } else {
      this.setState({ error: 'Failed to update registry. Please check the URL is valid and not a duplicate.' });
    }
  };

  handleCancelEdit = () => {
    this.setState({
      editingId: null,
      editingUrl: '',
      error: null,
    });
  };

  handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this registry?')) {
      const success = RegistryService.delete(id);

      if (success) {
        this.loadRegistries();
      } else {
        this.setState({ error: 'Failed to delete registry' });
      }
    }
  };

  render() {
    const { registries, newUrl, editingId, editingUrl, error } = this.state;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">Registry Manager</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Add New Registry */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">Add New Registry</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onInput={this.handleNewUrlChange}
              placeholder="Enter registry URL (e.g., https://example.com/registry.json)"
              className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              onClick={this.handleAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Registry List */}
        <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-blue-100 text-blue-800">Registered Registries</h2>

          {registries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No registries added yet. Add your first registry above.
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
                      <button
                        onClick={this.handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={this.handleCancelEdit}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-blue-700 font-medium break-all">{registry.url}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Added: {new Date(registry.createdAt).toLocaleString()}
                          {registry.updatedAt !== registry.createdAt && (
                            <span className="ml-2">
                              | Updated: {new Date(registry.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => this.handleEdit(registry)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => this.handleDelete(registry.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                          title="Delete"
                        >
                          Delete
                        </button>
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
            Total Registries: {registries.length}
          </div>
        )}
      </div>
    );
  }
}
