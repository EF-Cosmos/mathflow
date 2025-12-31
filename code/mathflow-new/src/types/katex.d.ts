declare module 'katex' {
  interface KatexOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    trust?: boolean;
    strict?: boolean | string;
  }
  
  function render(tex: string, element: HTMLElement, options?: KatexOptions): void;
  function renderToString(tex: string, options?: KatexOptions): string;
  
  export { render, renderToString, KatexOptions };
  export default { render, renderToString };
}
