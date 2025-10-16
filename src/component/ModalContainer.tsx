import { Component } from "preact";
import { ModalService, type ModalState } from "../service/ModalService";

interface ModalContainerState {
  modals: ModalState[];
}

interface ModalDialogProps {
  modal: ModalState;
  onClose: (action: string, inputValue?: string) => void;
}

interface ModalDialogState {
  inputValue: string;
}

/**
 * Individual Modal Dialog Component
 */
class ModalDialog extends Component<ModalDialogProps, ModalDialogState> {
  constructor(props: ModalDialogProps) {
    super(props);
    this.state = {
      inputValue: props.modal.input?.initial ?? "",
    };
  }

  handleAction = (action: string) => {
    const { modal, onClose } = this.props;
    const { inputValue } = this.state;

    // Call the callback with action and input value (if input exists)
    if (modal.input) {
      onClose(action, inputValue);
    } else {
      onClose(action);
    }
  };

  handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    this.setState({ inputValue: target.value });
  };

  render() {
    const { modal } = this.props;
    const { inputValue } = this.state;

    // Default buttons if not specified
    const buttons = modal.buttons ?? { submit: "OK", cancel: "Cancel" };
    const submitLabel = buttons.submit;
    
    // Get all other buttons (excluding submit)
    const otherButtons = Object.entries(buttons).filter(([key]) => key !== "submit");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          {/* Prompt */}
          <div className="mb-4 text-gray-800">
            {typeof modal.prompt === "string" ? (
              <p className="text-lg">{modal.prompt}</p>
            ) : (
              modal.prompt
            )}
          </div>

          {/* Input Field */}
          {modal.input && (
            <div className="mb-4">
              {modal.input.type === "textarea" ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputValue}
                  onInput={this.handleInputChange}
                  readOnly={modal.input.readonly}
                  rows={4}
                />
              ) : (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputValue}
                  onInput={this.handleInputChange}
                  readOnly={modal.input.readonly}
                />
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            {/* Other buttons (like cancel) */}
            {otherButtons.map(([action, label]) => (
              <button
                key={action}
                onClick={() => this.handleAction(action)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                {label}
              </button>
            ))}
            
            {/* Submit button */}
            <button
              onClick={() => this.handleAction("submit")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
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
      this.setState({ modals });
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
    const { modals } = this.state;

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

