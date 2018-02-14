import TransformableStream from './transform-stream';
import oboe from 'oboe';

export default class JSONParser {
  constructor(pattern) {
    this.oboe = oboe();
    this.decoder = new TextDecoder();

    this.oboe
      .node(pattern, (data) => {
        this.controller.enqueue(data);
      })
      .done(() => this.controller.close());
  }

  get readable() {
    const self = this;

    return new ReadableStream({
      start(controller) {
        self.controller = controller;
      }
    });
  }

  get writable() {
    const self = this;

    return new WritableStream({
      write(chunk) {
          self.oboe.emit('data', self.decoder.decode(chunk));
      }
    });
  }
}