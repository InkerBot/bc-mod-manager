declare interface Bmm {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  app: import('../app.tsx').default;
}

declare interface Window {
  bmm: Bmm;
}
