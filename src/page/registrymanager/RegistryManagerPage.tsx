import {Component} from "preact";

interface RegistryManagerState {

}

export default class RegistryManagerPage extends Component<{}, RegistryManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (<>
      <h1>Registry Manager</h1>
    </>);
  }
}
