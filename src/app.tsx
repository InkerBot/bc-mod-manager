import './app.css'
import {Component} from "preact";
import i18n from "./i18n/i18n.ts";
import RegistryManagerPage from "./page/registrymanager/RegistryManagerPage.tsx";
import ModManagerPage from "./page/modmanager/ModManagerPage.tsx";
import LogManagerPage from "./page/logmanager/LogManagerPage.tsx";
import ModalContainer from "./component/ModalContainer.tsx";
import {ModLoaderService} from "./service/ModLoaderService.ts";

type PageType = 'mod-manager' | 'registry-manager' | 'log-viewer' | 'modal-test' | null;

interface AppState {
  showButton: boolean;
  menuOpen: boolean;
  currentPage: PageType;
}

export default class App extends Component<{}, AppState> {
  private screenTimer: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      showButton: true,
      menuOpen: false,
      currentPage: null
    };
    window.bmm.app = this;
  }

  componentDidMount() {
    this.screenTimer = window.setInterval(() => {
      const targetState = typeof CurrentScreen == 'undefined' || CurrentScreen === "Preference" || CurrentScreen === "Login";
      if (this.state.showButton !== targetState) {
        this.setState({showButton: targetState});
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.screenTimer) {
      clearInterval(this.screenTimer);
    }
  }

  toggleMenu = () => {
    this.setState({menuOpen: !this.state.menuOpen});
  }

  closeMenu = () => {
    this.setState({menuOpen: false});
  }

  openPage = (page: PageType) => {
    this.setState({
      currentPage: page,
      menuOpen: false
    });
  }

  closePage = () => {
    const wasModManager = this.state.currentPage === 'mod-manager';
    this.setState({currentPage: null});

    // If closing mod manager, check if we need to refresh
    if (wasModManager) {
      ModLoaderService.refreshIfNeeded();
    }
  }

  render() {
    const {menuOpen, currentPage} = this.state;

    return (
      <>
        {/* Menu Button */}
        {(this.state.showButton && !currentPage) && <div className="fixed top-4 right-12 z-50">
          <button
            className={`menu-button w-8 h-8 rounded-full bg-blue-800 text-white ${menuOpen ? 'open' : ''}`}
            onClick={this.toggleMenu}
          >
            +
          </button>

          <div className="relative text-white text-xs">
            <button
              className={`sub-button w-28 h-8 bg-red-900 ${menuOpen ? 'open' : ''}`}
              onClick={() => this.openPage('mod-manager')}
            >
              {i18n('button-mod-manager')}
            </button>
            <button
              className={`sub-button w-28 h-8 bg-green-900 ${menuOpen ? 'open' : ''}`}
              onClick={() => this.openPage('registry-manager')}
            >
              {i18n('button-registry-manager')}
            </button>
            <button
              className={`sub-button w-28 h-8 bg-yellow-900 ${menuOpen ? 'open' : ''}`}
              onClick={() => this.openPage('log-viewer')}
            >
              {i18n('button-log-viewer')}
            </button>
          </div>
        </div>}

        {/* Page Modal/Overlay */}
        {currentPage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto relative">
              {/* Close Button */}
              <button
                onClick={this.closePage}
                className="sticky top-4 float-right mr-4 mt-4 w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-50 flex items-center justify-center text-2xl font-bold"
                title={i18n('button-close')}
              >
                ×
              </button>

              {/* Page Content */}
              <div className="clear-both">
                {currentPage === 'mod-manager' && <ModManagerPage/>}
                {currentPage === 'registry-manager' && <RegistryManagerPage/>}
                {currentPage === 'log-viewer' && <LogManagerPage/>}
              </div>
            </div>
          </div>
        )}

        {/* Modal Container */}
        <ModalContainer/>
      </>
    )
  }
}
