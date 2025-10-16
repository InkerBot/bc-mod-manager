import './app.css'
import {Component} from "preact";
import i18n from "./i18n/i18n.ts";

interface AppState {
  menuOpen: boolean;
}

export default class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      menuOpen: false
    };
  }

  toggleMenu = () => {
    this.setState({menuOpen: !this.state.menuOpen});
  }

  closeMenu = () => {
    this.setState({menuOpen: false});
  }

  render() {
    const {menuOpen} = this.state;

    return (
      <div className="fixed top-4 right-12">
        <button
          className={`menu-button w-8 h-8 rounded-full bg-blue-800 text-white ${menuOpen ? 'open' : ''}`}
          onClick={this.toggleMenu}
        >
          +
        </button>

        <div className="relative text-white text-xs">
          <button className={`sub-button w-28 h-8 bg-red-900 ${menuOpen ? 'open' : ''}`} onClick={this.closeMenu}>
            {i18n('button-mod-manager')}
          </button>
          <button className={`sub-button w-28 h-8 bg-green-900 ${menuOpen ? 'open' : ''}`} onClick={this.closeMenu}>
            {i18n('button-registry-manager')}
          </button>
          <button className={`sub-button w-28 h-8 bg-yellow-900 ${menuOpen ? 'open' : ''}`} onClick={this.closeMenu}>
            {i18n('button-log-viewer')}
          </button>
        </div>
      </div>
    )
  }
}
