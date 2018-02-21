const coreCouchDb = require('./core/couchdb.js')

const data = require('./data.json');

coreCouchDb.insert('github-events', data.rows.map(i => i.doc));
