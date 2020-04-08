const { getDBName, connect, getCollection, newConnection } = require('./');

(async function () {
  try {
    await connect();

  } catch (err) {
    // console.log('errr', err);
    throw err;
  }
})();