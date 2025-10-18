import {Component} from "preact";
import {ModalService, type ModalState} from "../service/ModalService";
import ModalDialog from "./ModalDialog.tsx";

interface ModalContainerState {
  modals: ModalState[];
}

/**
 * Modal Container Component
 * Manages and renders all active modals
 */
export default class ModalContainer extends Component<{}, ModalContainerState> {
  private unsubscribe?: () => void;

  constructor(props: {}) {
    super(props);
    this.state = {
      modals: [],
    };
  }

  componentDidMount() {
    // Subscribe to modal state changes
    this.unsubscribe = ModalService.subscribe((modals) => {
      this.setState({modals});
    });
  }

  componentWillUnmount() {
    // Unsubscribe when component unmounts
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleModalClose = (modalId: string, action: string, inputValue?: string) => {
    // Find the modal and call its callback
    const modal = this.state.modals.find(m => m.id === modalId);
    if (modal) {
      modal.callback(action, inputValue);
    }

    // Close the modal
    ModalService.close(modalId);
  };

  render() {
    const {modals} = this.state;

    // Render all modals (stacked on top of each other if multiple)
    return (
      <>
        {modals.map((modal) => (
          <ModalDialog
            key={modal.id}
            modal={modal}
            onClose={(action, inputValue) => this.handleModalClose(modal.id, action, inputValue)}
          />
        ))}
      </>
    );
  }
}

