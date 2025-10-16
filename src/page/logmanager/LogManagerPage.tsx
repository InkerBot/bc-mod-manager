import { Component } from "preact";
import { LogService, LogLevel, type LogEntry } from "../../service/LogService";

interface LogManagerState {
  logs: LogEntry[];
  filter: LogLevel | 'all';
  searchQuery: string;
  autoRefresh: boolean;
  debugMethods: string[];
  isDownloading: boolean;
}

export default class LogManagerPage extends Component<{}, LogManagerState> {
  private refreshInterval: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      logs: [],
      filter: 'all',
      searchQuery: '',
      autoRefresh: false,
      debugMethods: [],
      isDownloading: false,
    };
  }

  componentDidMount() {
    this.loadLogs();
    this.loadDebugMethods();
  }

  componentWillUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadLogs = () => {
    const logs = LogService.getAllLogs();
    this.setState({ logs });
  };

  loadDebugMethods = () => {
    const debugMethods = LogService.getDebugMethods();
    this.setState({ debugMethods });
  };

  handleFilterChange = (filter: LogLevel | 'all') => {
    this.setState({ filter });
  };

  handleSearchChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ searchQuery: target.value });
  };

  handleAutoRefreshToggle = () => {
    const newAutoRefresh = !this.state.autoRefresh;
    this.setState({ autoRefresh: newAutoRefresh });

    if (newAutoRefresh) {
      this.refreshInterval = window.setInterval(() => {
        this.loadLogs();
      }, 2000); // Refresh every 2 seconds
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  };

  handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      LogService.clearLogs();
      this.loadLogs();
    }
  };

  handleDownloadCrashReport = async () => {
    this.setState({ isDownloading: true });
    try {
      await LogService.downloadCrashReport();
      alert('Crash report downloaded successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Failed to download crash report: ${errorMsg}`);
    } finally {
      this.setState({ isDownloading: false });
    }
  };

  handleRefresh = () => {
    this.loadLogs();
    this.loadDebugMethods();
  };

  getFilteredLogs = (): LogEntry[] => {
    let filtered = this.state.logs;

    // Filter by level
    if (this.state.filter !== 'all') {
      filtered = filtered.filter(log => log.level === this.state.filter);
    }

    // Filter by search query
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'bg-gray-100 text-gray-700';
      case LogLevel.INFO:
        return 'bg-blue-100 text-blue-700';
      case LogLevel.WARN:
        return 'bg-yellow-100 text-yellow-700';
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  render() {
    const { filter, searchQuery, autoRefresh, debugMethods, isDownloading } = this.state;
    const filteredLogs = this.getFilteredLogs();
    const stats = LogService.getLogStats();

    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Log Manager</h1>
          <p className="text-gray-600">View application logs and download crash reports</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{this.state.logs.length}</div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{stats[LogLevel.DEBUG]}</div>
            <div className="text-sm text-gray-600">Debug</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats[LogLevel.INFO]}</div>
            <div className="text-sm text-gray-600">Info</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats[LogLevel.WARN]}</div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats[LogLevel.ERROR]}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 border border-blue-100">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filter}
                onChange={(e) => this.handleFilterChange((e.target as HTMLSelectElement).value as LogLevel | 'all')}
                className="px-3 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Levels</option>
                <option value={LogLevel.DEBUG}>Debug</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.WARN}>Warnings</option>
                <option value={LogLevel.ERROR}>Errors</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onInput={this.handleSearchChange}
                className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Auto Refresh */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={this.handleAutoRefreshToggle}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
            </label>

            {/* Buttons */}
            <button
              onClick={this.handleRefresh}
              className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            >
              ↻ Refresh
            </button>

            <button
              onClick={this.handleDownloadCrashReport}
              disabled={isDownloading}
              className="px-4 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? '⟳ Downloading...' : '📦 Download Crash Report'}
            </button>

            <button
              onClick={this.handleClearLogs}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
            >
              🗑 Clear Logs
            </button>
          </div>

          {/* Debug Methods Info */}
          {debugMethods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Registered Debug Methods ({debugMethods.length}):</span>
                <span className="ml-2">{debugMethods.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow border border-blue-100">
          <div className="p-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Logs ({filteredLogs.length})
            </h2>
          </div>

          <div className="divide-y divide-blue-50 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-lg font-medium">No logs found</div>
                <div className="text-sm">
                  {searchQuery || filter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Logs will appear here as the application runs'}
                </div>
              </div>
            ) : (
              filteredLogs.reverse().map((log) => (
                <div key={log.id} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Level Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded ${this.getLevelColor(log.level)}`}>
                      {log.level}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-gray-800 break-words flex-1">
                          {log.message}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {this.formatTimestamp(log.timestamp)}
                        </div>
                      </div>

                      {/* Additional Data */}
                      {log.data && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                          <pre>{JSON.stringify(log.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}
