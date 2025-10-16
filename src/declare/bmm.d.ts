declare interface Bmm {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
}

declare interface Window {
  bmm: Bmm;
}
