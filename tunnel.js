const Log = require('logger3000').getLogger(__filename);
const tunnel = require('tunnel-ssh');
const Promise = require('bluebird');

const { SSH_USER, SSH_PASSWORD, SSH_HOST, SSH_KEY_PATH, MONGO_URL } = process.env;

function getPort(mongoURL) {
  const arr = mongoURL.split(':');
  let p = arr[arr.length - 1];
  p = p.split('/')[0];
  if (!p) {
    Log.info({ msg: 'Port not found in mongo url, defaulting to port `27017`' });
    p = 27017;
  }

  Log.debug({ msg: 'Detected remote vm mongo port ', arg1: p });
  return p;
}

exports.get = function() {
  if (SSH_HOST && SSH_USER) {
    const port = getPort(MONGO_URL);
    const config = {
      username: SSH_USER,
      host: SSH_HOST,
      agent: process.env.SSH_AUTH_SOCK,
      privateKey: SSH_KEY_PATH && require('fs').readFileSync(SSH_KEY_PATH),
      port: 22,
      dstPort: port,
      password: SSH_PASSWORD,
      keepAlive: true
    };

    const server = tunnel(config, function(error, server) {
      if (error) {
        Log.error({ error, msg: 'Not connected to tunnel. Pls verify the tunnel configurations' });
        process.exit(1);
      }

      Log.info({ msg: 'Connected to tunnel' });
      Promise.resolve(server);
    });

    server.on('error', function(error) {
      Log.error({ error, msg: 'Err in tunnel' });
    });
  }
};
