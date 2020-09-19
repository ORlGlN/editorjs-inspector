import type {
  API,
  InlineTool,
  InlineToolConstructorOptions,
} from '@editorjs/editorjs';
import EditorJSInspectorError from './EditorJSInspectorError';

class EditorJSInspector implements InlineTool {
  static get isInline() {
    return true;
  }

  static get title() {
    return 'Inspector';
  }

  static domTree({
    anchor,
    node,
  }: {
    anchor: Node;
    node: Node;
  }): HTMLLIElement {
    const listItem = document.createElement('li');
    const span = document.createElement('span');

    span.style.cursor = 'pointer';

    if (anchor.isEqualNode(node)) {
      span.style.backgroundColor = '#cae6fe';
    }

    span.textContent =
      node instanceof Element
        ? `<${[
            node.nodeName.toLowerCase(),
            ...Array.from(node.attributes).map(
              (attribute) => `${attribute.name}="${attribute.value}"`
            ),
          ].join(' ')}>`
        : node.textContent ?? '';

    span.addEventListener('pointerdown', (event) => {
      const selection = window.getSelection();

      if (!selection) {
        throw new EditorJSInspectorError();
      }

      const range = new Range();

      range.selectNodeContents(node);

      selection.removeAllRanges();
      selection.addRange(range);

      event.preventDefault();
    });

    listItem.append(span);

    const list = document.createElement('ul');

    list.append(
      ...Array.from(node.childNodes).map((childNode) =>
        EditorJSInspector.domTree({ anchor, node: childNode })
      )
    );

    listItem.append(list);

    return listItem;
  }

  #api: API;
  #button: HTMLButtonElement;
  #dialog: HTMLDivElement;
  #enabled: boolean;

  constructor({ api }: InlineToolConstructorOptions) {
    this.#api = api;

    this.#button = document.createElement('button');
    this.#button.classList.add(this.#api.styles.inlineToolButton);
    this.#button.type = 'button';
    this.#button.innerHTML = `
      <svg class="icon" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    `;

    this.#dialog = document.createElement('div');
    this.#dialog.classList.add('editorjs-inspector-dialog');
    this.#dialog.style.position = 'absolute';
    this.#dialog.style.backgroundColor = '#ffffff';
    this.#dialog.style.border = '1px solid #eaeaea';
    this.#dialog.style.borderRadius = '4px';
    this.#dialog.style.boxShadow = '0 3px 15px -3px rgba(13,20,33,.13)';
    this.#dialog.style.margin = '1rem';
    this.#dialog.style.paddingRight = '1rem';

    this.#enabled = false;
  }

  get shortcut() {
    return 'CMD+SHIFT+I';
  }

  checkState() {
    this.#button.classList.toggle(
      this.#api.styles.inlineToolButtonActive,
      this.#enabled
    );

    if (!this.#enabled) {
      this.clear();

      return false;
    }

    const selection = window.getSelection();

    if (!selection) {
      throw new EditorJSInspectorError();
    }

    if (!selection.anchorNode?.parentElement) {
      return false;
    }

    let root: HTMLElement | null = selection.anchorNode.parentElement;

    while (root && root?.contentEditable !== 'true') {
      root = root?.parentElement;
    }

    const codexEditor = this.#button.closest('.codex-editor');

    if (!codexEditor || !root) {
      return false;
    }

    const codexEditorRect = codexEditor.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();

    this.#dialog.innerHTML = '';
    this.#dialog.style.display = 'block';
    this.#dialog.style.top = `${rootRect.bottom - codexEditorRect.top + 16}px`;
    this.#dialog.style.left = `${rootRect.left - codexEditorRect.left}px`;

    const list = document.createElement('ul');

    list.append(
      EditorJSInspector.domTree({ anchor: selection.anchorNode, node: root })
    );

    this.#dialog.append(list);

    return true;
  }

  clear() {
    this.#dialog.style.display = 'none';
  }

  render() {
    setTimeout(() => {
      const inlineToolbar = this.#button
        .closest('.codex-editor')
        ?.querySelector('.ce-inline-toolbar');

      if (!inlineToolbar?.parentNode) {
        throw new EditorJSInspectorError();
      }

      inlineToolbar.parentNode.insertBefore(this.#dialog, inlineToolbar);
    });

    return this.#button;
  }

  surround() {
    this.#enabled = !this.#enabled;
  }
}

export default EditorJSInspector;
