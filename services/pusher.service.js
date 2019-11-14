const Pusher = require('pusher');

let instance = null;

class PusherService {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.ps = new Pusher({
      appId: '896393',
      key: '4a9bd45624f14eeef65e',
      secret: '5fe93074a717957cbdff',
      cluster: 'ap1',
      encrypted: true
    });
    return this.ps;
  }
}

module.exports = PusherService;