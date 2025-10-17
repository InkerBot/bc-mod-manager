declare interface Bmm {
  shadowRootContainer: HTMLDivElement;
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  app: import('../app.tsx').default;
}

declare interface Window {
  bmm: Bmm;
}
