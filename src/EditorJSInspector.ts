import type { InlineTool } from '@editorjs/editorjs';

class EditorJSInspector implements InlineTool {
  static get isInline() {
    return true;
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
        throw new Error();
      }

      const range = new Range();

      range.setStartBefore(node);
      range.setEndAfter(node);

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

  #dialog: HTMLDivElement;

  constructor() {
    this.#dialog = document.createElement('div');

    this.#dialog.style.position = 'absolute';
    this.#dialog.style.backgroundColor = '#ffffff';
    this.#dialog.style.border = '1px solid #eaeaea';
    this.#dialog.style.borderRadius = '4px';
    this.#dialog.style.boxShadow = '0 3px 15px -3px rgba(13,20,33,.13)';
    this.#dialog.style.margin = '1rem';
    this.#dialog.style.paddingRight = '1rem';
    this.#dialog.style.transform = 'translateY(-100%)';
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

    this.#dialog.innerHTML = '';
    this.#dialog.style.display = 'block';
    this.#dialog.style.top = `${window.pageYOffset + rect.top - 16}px`;
    this.#dialog.style.left = `${window.pageXOffset + rect.left}px`;

    const list = document.createElement('ul');

    list.append(
      EditorJSInspector.domTree({ anchor: selection.anchorNode, node: root })
    );

    this.#dialog.append(list);

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
