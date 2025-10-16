import {LogService} from "./service/LogService.ts";

window.FUSAM = {
  present: true,
  addons: {},
  registerDebugMethod: (name: string, method: () => string | Promise<string>) => {
    LogService.registerDebugMethod(name, method);
  },
  modals: {
    open: (options: ModalOptions) => {

    },
    openAsync: async (options: Omit<ModalOptions, "callback">) => {
      return ["", ""];
    },
  },
}
