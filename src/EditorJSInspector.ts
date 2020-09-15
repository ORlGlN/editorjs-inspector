import type { InlineTool } from '@editorjs/editorjs';

class EditorJSInspector implements InlineTool {
  static get isInline() {
    return true;
  }

  #dialog: HTMLDivElement;

  constructor() {
    this.#dialog = document.createElement('div');

    this.#dialog.style.position = 'absolute';
    this.#dialog.style.border = '1px solid #000000';
    this.#dialog.style.backgroundColor = '#ffffff';
    this.#dialog.style.margin = '1rem';
    this.#dialog.style.zIndex = '1';
  }

  checkState() {
    const selection = window.getSelection();

    if (!selection) {
      throw new Error();
    }

    if (!selection.anchorNode?.parentElement) {
      return false;
    }

    let root: HTMLElement | null = selection.anchorNode.parentElement;

    while (root && root?.contentEditable !== 'true') {
      root = root?.parentElement;
    }

    if (!root) {
      return false;
    }

    const rect = root.getBoundingClientRect();

    this.#dialog.style.display = 'block';
    this.#dialog.style.top = `${window.pageYOffset + rect.bottom + 32}px`;
    this.#dialog.style.left = `${window.pageXOffset + rect.left}px`;
    this.#dialog.textContent = root.outerHTML;

    return false;
  }

  clear() {
    this.#dialog.style.display = 'none';
  }

  render() {
    const button = document.createElement('button');

    button.style.display = 'none';

    document.body.appendChild(this.#dialog);

    return button;
  }

  surround() {}
}

export default EditorJSInspector;
