import TransformableStream from './transform-stream';
import Parser from 'jsonparse';

export default class JSONParser {
  constructor() {
    this.parser = new Parser();
    this.decoder = new TextDecoder();

    this.parser.onValue = this.onValue.bind(this);
  }

  onValue(value) {
    console.log(this.parser.stack);
    console.log(this.parser.key, ':', value);
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
        try {
          const txtChunk = self.decoder.decode(chunk);
          self.parser.write(txtChunk);
          self.controller.enqueue(chunk);
        } catch (err) {
          console.error('err', err);
        }
      }
    });
  }
}