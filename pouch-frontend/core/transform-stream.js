export default class TransformableStream {
  constructor({ transform }) {
    this.transform = transform;
  }

  get readable() {
    return this._readable();
  }

  get writable() {
    return this._writable();
  }

  _readable() {
    const self = this;

    return new ReadableStream({
      start(controller) {
        self.controller = controller;
      }
    });
  }

  _writable() {
    const self = this;

    return new WritableStream({
      write(chunk) {
        self.controller.enqueue(self.transform(chunk));
      },

      close() {
        self.controller.close();
      }
    })
  }
}