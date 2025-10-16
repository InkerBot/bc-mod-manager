/**
 * ModalService - Manages modal dialogs
 * Provides both callback-based and promise-based APIs for showing modals
 */

export interface ModalState {
  id: string;
  prompt: string | Node;
  input?: { initial: string; readonly: boolean; type: "input" | "textarea" };
  callback: (action: string, inputValue?: string) => void;
  buttons?: { submit: string } & Record<string, string>;
}

type ModalListener = (modals: ModalState[]) => void;

export class ModalService {
  private static modals: ModalState[] = [];
  private static listeners: Set<ModalListener> = new Set();
  private static modalIdCounter = 0;

  /**
   * Subscribe to modal state changes
   * @param listener - Function to call when modals change
   * @returns Unsubscribe function
   */
  static subscribe(listener: ModalListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener([...this.modals]);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Open a modal with callback-based API
   * @param options - Modal configuration options
   */
  static open(options: ModalOptions): void {
    const modal: ModalState = {
      id: this.generateId(),
      prompt: options.prompt,
      input: options.input,
      callback: options.callback,
      buttons: options.buttons,
    };

    this.modals.push(modal);
    this.notify();
  }

  /**
   * Open a modal with promise-based API
   * @param options - Modal configuration options (without callback)
   * @returns Promise that resolves with [action, inputValue]
   */
  static openAsync(
    options: Omit<ModalOptions, "callback">
  ): Promise<[string, string | null]> {
    return new Promise((resolve) => {
      const modal: ModalState = {
        id: this.generateId(),
        prompt: options.prompt,
        input: options.input,
        callback: (action: string, inputValue?: string) => {
          resolve([action, inputValue ?? null]);
        },
        buttons: options.buttons,
      };

      this.modals.push(modal);
      this.notify();
    });
  }

  /**
   * Close a specific modal by ID
   * @param id - Modal ID to close
   */
  static close(id: string): void {
    const index = this.modals.findIndex(m => m.id === id);
    if (index !== -1) {
      this.modals.splice(index, 1);
      this.notify();
    }
  }

  /**
   * Close all modals
   */
  static closeAll(): void {
    this.modals = [];
    this.notify();
  }

  /**
   * Get all current modals
   */
  static getModals(): ModalState[] {
    return [...this.modals];
  }

  /**
   * Notify all listeners of state change
   */
  private static notify(): void {
    const modalsCopy = [...this.modals];
    this.listeners.forEach(listener => {
      listener(modalsCopy);
    });
  }

  /**
   * Generate a unique modal ID
   */
  private static generateId(): string {
    return `modal_${Date.now()}_${this.modalIdCounter++}`;
  }
}

