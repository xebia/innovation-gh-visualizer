const CouchDB = require('node-couchdb');
const fetch = require('./core/fetch');
const debug = require('debug')('server:db');

const HOST = 'localhost:5984';

const couch = new CouchDB();

// exports.insert = async function main(dbName, msg) {
//   const result = await couch.insert(dbName, msg);

//   debug('couchdb result', result);

//   if (!result.ok) {
//     throw new Error([
//       'Failed to store document in CouchDB',
//       JSON.stringify(result, null, 4)
//     ].join(' '));
//   }

//   return result;
// }

exports.insert = async function main(dbName, msgs) {
  return fetch(`http://${HOST}/${dbName}/_bulk_docs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      docs: msgs
    })
  });
}