import {LogService} from "./service/LogService.ts";
import {ModalService} from "./service/ModalService.ts";

window.FUSAM = {
  present: true,
  addons: {},
  registerDebugMethod: (name: string, method: () => string | Promise<string>) => {
    LogService.registerDebugMethod(name, method);
  },
  modals: {
    open: (options: ModalOptions) => {
      ModalService.open(options);
    },
    openAsync: async (options: Omit<ModalOptions, "callback">) => {
      return new Promise((resolve) => {
        ModalService.open({
          ...options,
          callback: (action, inputValue) => {
            resolve([action, inputValue === undefined ? null : inputValue]);
          },
        });
      });
    },
  },
}
