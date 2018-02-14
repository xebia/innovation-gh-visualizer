const fetch = require('./fetch');
const debug = require('debug')('server:db');
const util = require('./util');

const HOST = 'localhost:5984';

exports.insert = async function main(dbName, msgs) {
  const docs = msgs.map(msg => Object.assign({}, util.dropKey(msg, 'id'), { '_id': msg.id }));

  debug('storing docs', docs);

  return fetch(`http://${HOST}/${dbName}/_bulk_docs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ docs })
  });
}