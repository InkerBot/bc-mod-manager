import {Component} from "preact";

interface ModManagerState {

}

export default class ModManagerPage extends Component<{}, ModManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (<>
      <h1>Mod Manager</h1>
    </>);
  }
}
