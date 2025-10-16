import {Component} from 'preact';
import {type CustomExtension, CustomExtensionService} from '../service/CustomExtensionService';
import i18n from '../i18n/i18n';

interface CustomExtensionModalProps {
  onClose: () => void;
  onExtensionAdded: () => void;
}

interface CustomExtensionModalState {
  extensions: CustomExtension[];
  showAddForm: boolean;
  editingId: string | null;
  formData: {
    name: string;
    author: string;
    description: string;
    sourceUrl: string;
    type: 'script' | 'module';
    icon: string;
    repository: string;
    website: string;
    tags: string;
  };
  error: string | null;
  success: string | null;
}

export default class CustomExtensionModal extends Component<CustomExtensionModalProps, CustomExtensionModalState> {
  constructor(props: CustomExtensionModalProps) {
    super(props);
    this.state = {
      extensions: CustomExtensionService.getAll(),
      showAddForm: false,
      editingId: null,
      formData: this.getEmptyFormData(),
      error: null,
      success: null,
    };
  }

  getEmptyFormData() {
    return {
      name: '',
      author: '',
      description: '',
      sourceUrl: '',
      type: 'script' as 'script' | 'module',
      icon: '',
      repository: '',
      website: '',
      tags: '',
    };
  }

  handleInputChange = (field: keyof CustomExtensionModalState['formData'], value: string) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [field]: value,
      },
    }));
  };

  handleAddNew = () => {
    this.setState({
      showAddForm: true,
      editingId: null,
      formData: this.getEmptyFormData(),
      error: null,
      success: null,
    });
  };

  handleEdit = (extension: CustomExtension) => {
    this.setState({
      showAddForm: true,
      editingId: extension.id,
      formData: {
        name: extension.name,
        author: extension.author,
        description: extension.description,
        sourceUrl: extension.sourceUrl,
        type: extension.type,
        icon: extension.icon || '',
        repository: extension.repository || '',
        website: extension.website || '',
        tags: extension.tags?.join(', ') || '',
      },
      error: null,
      success: null,
    });
  };

  handleSubmit = () => {
    const {formData, editingId} = this.state;

    // Validate
    if (!formData.name.trim()) {
      this.setState({error: i18n('error-extension-name-required'), success: null});
      return;
    }

    if (!formData.sourceUrl.trim()) {
      this.setState({error: i18n('error-extension-source-url-required'), success: null});
      return;
    }

    // Parse tags
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const extensionData = {
      name: formData.name.trim(),
      author: formData.author.trim() || 'Unknown',
      description: formData.description.trim(),
      sourceUrl: formData.sourceUrl.trim(),
      type: formData.type,
      icon: formData.icon.trim() || undefined,
      repository: formData.repository.trim() || undefined,
      website: formData.website.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    let result;
    if (editingId) {
      // Update existing
      result = CustomExtensionService.update(editingId, extensionData);
      if (result) {
        this.setState({
          extensions: CustomExtensionService.getAll(),
          showAddForm: false,
          editingId: null,
          formData: this.getEmptyFormData(),
          error: null,
          success: i18n('success-extension-updated'),
        });
        this.props.onExtensionAdded();
      } else {
        this.setState({error: i18n('error-update-extension-failed'), success: null});
      }
    } else {
      // Add new
      result = CustomExtensionService.add(extensionData);
      if (result) {
        this.setState({
          extensions: CustomExtensionService.getAll(),
          showAddForm: false,
          formData: this.getEmptyFormData(),
          error: null,
          success: i18n('success-extension-added'),
        });
        this.props.onExtensionAdded();
      } else {
        this.setState({error: i18n('error-add-extension-failed'), success: null});
      }
    }
  };

  handleDelete = (id: string) => {
    if (confirm(i18n('confirm-delete-extension'))) {
      const success = CustomExtensionService.remove(id);
      if (success) {
        this.setState({
          extensions: CustomExtensionService.getAll(),
          error: null,
          success: i18n('success-extension-deleted'),
        });
        this.props.onExtensionAdded();
      } else {
        this.setState({error: i18n('error-delete-extension-failed'), success: null});
      }
    }
  };

  handleCancel = () => {
    this.setState({
      showAddForm: false,
      editingId: null,
      formData: this.getEmptyFormData(),
      error: null,
    });
  };

  render() {
    const {extensions, showAddForm, editingId, formData, error, success} = this.state;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-600">
                {i18n('button-manage-custom-extensions')}
              </h2>
              <button
                onClick={this.props.onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {i18n('message-custom-extensions-info')}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm ? (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">
                  {editingId ? i18n('button-edit') : i18n('title-add-custom-extension')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onInput={(e) => this.handleInputChange('name', (e.target as HTMLInputElement).value)}
                      placeholder={i18n('placeholder-extension-name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-author')}
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onInput={(e) => this.handleInputChange('author', (e.target as HTMLInputElement).value)}
                      placeholder={i18n('placeholder-extension-author')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onInput={(e) => this.handleInputChange('description', (e.target as HTMLTextAreaElement).value)}
                      placeholder={i18n('placeholder-extension-description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-source-url')} *
                    </label>
                    <input
                      type="text"
                      value={formData.sourceUrl}
                      onInput={(e) => this.handleInputChange('sourceUrl', (e.target as HTMLInputElement).value)}
                      placeholder={i18n('placeholder-extension-source-url')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-type')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => this.handleInputChange('type', (e.target as HTMLSelectElement).value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="script">{i18n('option-type-script')}</option>
                      <option value="module">{i18n('option-type-module')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n('label-extension-icon-url')}
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onInput={(e) => this.handleInputChange('icon', (e.target as HTMLInputElement).value)}
                        placeholder={i18n('placeholder-extension-icon-url')}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n('label-extension-repository-url')}
                      </label>
                      <input
                        type="text"
                        value={formData.repository}
                        onInput={(e) => this.handleInputChange('repository', (e.target as HTMLInputElement).value)}
                        placeholder={i18n('placeholder-extension-repository-url')}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-website-url')}
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onInput={(e) => this.handleInputChange('website', (e.target as HTMLInputElement).value)}
                      placeholder={i18n('placeholder-extension-website-url')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n('label-extension-tags')}
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onInput={(e) => this.handleInputChange('tags', (e.target as HTMLInputElement).value)}
                      placeholder={i18n('placeholder-extension-tags')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={this.handleSubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                    >
                      {editingId ? i18n('button-save') : i18n('button-add')}
                    </button>
                    <button
                      onClick={this.handleCancel}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors font-medium"
                    >
                      {i18n('button-cancel')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  onClick={this.handleAddNew}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                >
                  + {i18n('button-add-custom-extension')}
                </button>
              </div>
            )}

            {/* Extensions List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {i18n('label-custom-extensions')} ({extensions.length})
              </h3>
              {extensions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {i18n('message-no-custom-extensions')}
                </div>
              ) : (
                <div className="space-y-3">
                  {extensions.map(ext => (
                    <div key={ext.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        {ext.icon && (
                          <img
                            src={ext.icon}
                            alt={ext.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800">{ext.name}</h4>
                          <p className="text-sm text-gray-600">by {ext.author}</p>
                          {ext.description && (
                            <p className="text-sm text-gray-700 mt-1">{ext.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2 break-all">
                            <span className="font-medium">URL:</span> {ext.sourceUrl}
                          </div>
                          {ext.tags && ext.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {ext.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => this.handleEdit(ext)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            {i18n('button-edit')}
                          </button>
                          <button
                            onClick={() => this.handleDelete(ext.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            {i18n('button-delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={this.props.onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
            >
              {i18n('button-close')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

