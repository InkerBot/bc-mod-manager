interface Window {
  FUSAM?: FUSAMPublicAPI
}

// Overrides the default typedef for the `PlayerOnlineSettings` interface to have type-safety for FUSAMSettings
interface PlayerOnlineSettings {
  /** @deprecated */
  FUSAMSettings: string
}

interface ExtensionSettings {
  FUSAMSettings: string
}

type FUSAMPublicAPI = {
  present: true
  addons: Record<string, FUSAMAddonState>
  registerDebugMethod: (name: string, method: () => string | Promise<string>) => void
  modals: {
    open: (options: ModalOptions) => void
    openAsync: (options: Omit<ModalOptions, "callback">) => Promise<[string, string | null]>
  }
}

type FUSAMAddonState = {
  distribution: string
  status: "loading" | "loaded" | "error"
}

type FUSAMSettings = {
  enabledDistributions: Record<string, string>
}

type ModalOptions = {
  prompt: string | Node
  input?: { initial: string; readonly: boolean; type: "input" | "textarea" }
  callback: (action: string, inputValue?: string) => void
  buttons?: { submit: string } & Record<string, string>
}
