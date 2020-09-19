class EditorJSInspectorError extends Error {
  constructor(...args: any[]) {
    super(...args);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EditorJSInspectorError);
    }

    this.name = 'EditorJSInspectorError';
  }
}

export default EditorJSInspectorError;
