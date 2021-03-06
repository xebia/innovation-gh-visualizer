// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const fs = require('fs');
const util = require('util');
const moment = require('moment');
const debug = require('debug')('server:index');
const chalk = require('chalk');

const couchDB = require('./core/couchdb');

const {argv} = require('yargs')
  .usage('Command to extract events for one Github organization from the Github archive in Google Big Query')
  .detectLocale(false)
  .wrap(120)
  .option('db', {
    describe: 'Store fetched events in couchdb',
    type: 'boolean',
    default: true,
  })
  .option('dbName', {
    describe: 'CouchDB name',
    type: 'string',
    required: true,
  })
  .option('google', {
    describe: 'Google project ID',
    type: 'string',
    required: true,
  })
  .option('org', {
    describe: 'Github organization ID',
    type: 'number',
    required: true,
  })
  .option('file', {
    describe: 'Path to the file where all events are stored',
    type: 'string',
    default: 'events.json',
  })
  .option('startDate', {
    describe: 'Date to start retrieving Github events from',
    type: /\d\d\d\d-\d\d-\d\d/,
    alias: 's',
    default: moment().subtract(1, 'day').format('YYYY-MM-DD')
  })
  .option('stopAt', {
    describe: 'Last date to retrieve events from',
    alias: 'e',
    type: /\d\d\d\d-\d\d-\d\d/,
    default: moment().subtract(1, 'day').format('YYYY-MM-DD')
  })
  .option('interval', {
    alias: 'i',
    describe: 'Interval (in days) by which to retrieve events',
    type: 'number',
    default: 30,
  });
 
// Your Google Cloud Platform project ID
const projectId = argv.google;
const orgId = argv.org;
const filepath = argv.file; 

// Creates a client
const bigquery = new BigQuery({
  projectId,
});
 
// The name for the new dataset
const datasetName = 'githubarchive';

const createQuery = (date, end) => `SELECT id, type, created_at, org.id, repo.id, repo.name, actor.id, actor.login, payload
FROM (
  TABLE_DATE_RANGE([githubarchive:day.],
    TIMESTAMP('${date.format('YYYY-MM-DD')}'), 
    TIMESTAMP('${end.format('YYYY-MM-DD')}')
  )
)
WHERE org.id = ${orgId}
ORDER BY created_at`;

function parsePayload(row) {
  try {
    return Object.assign({}, row, {
      payload: JSON.parse(row.payload),
    });
  } catch (err) {
    return row;
  }
}

function normalizeEvent(row) {
  return Object.assign({}, row, {
    created_at: row.created_at.value
  });
}

// Creates the new dataset
async function executeQuery(date, end) {
  const query = createQuery(date, end);

  debug('Executing query', query);

  const options = {
    query,
    useLegacySql: true,
  };

  const results = await bigquery.query(options);

  console.log('Fetched events from', chalk.blue(date.format('YYYY-MM-DD')), 'to', chalk.blue(end.format('YYYY-MM-DD')), '#rows', chalk.green(results[0].length));

  const contents = results[0]
  .map(parsePayload)
  .map(normalizeEvent)

  if (argv.db) {
    await couchDB.insert(argv.dbName, contents);

    console.log('Stored #', chalk.green(contents.length), 'documents in couchdb', argv.dbName);
  } else {
    const fileContents = contents
    .map(row => JSON.stringify(row))
    .join(',\n');

    await util.promisify(fs.appendFile)(filepath, fileContents);
  }

  return results[0].length;
}

async function main() {
  let numberOfRows = 0;
  let date = moment(argv.startDate);
  let endDate = moment(date).add(argv.interval, 'day');
  const stopAt = moment(argv.stopAt);

  console.log('Querying Big Query from', chalk.blue(date.format('YYYY-MM-DD')), 'to', chalk.blue(stopAt.format('YYYY-MM-DD')));

  while (endDate.isSameOrBefore(stopAt)) {
    numberOfRows += await executeQuery(date, endDate);
    date = moment(date).add(argv.interval, 'day');
    endDate = moment(date).add(argv.interval, 'day');
  }

  if (date.isSameOrBefore(stopAt)) {
    numberOfRows += await executeQuery(date, stopAt);
  }

  console.log('🍾  Finished fetched', chalk.green(numberOfRows), 'number of rows');
}

main()
  .catch(err => console.error(err));