// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const fs = require('fs');
const util = require('util');
const moment = require('moment');
const debug = require('debug')('server:index');

const argv = require('yargs')
  .usage('Command to extract events for one Github organization from the Github archive in Google Big Query')
  .detectLocale(false)
  .wrap(120)
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
    default: moment().subtract(3, 'day').format('YYYY-MM-DD')
  })
  .option('endDate', {
    describe: 'Last date to retrieve events from',
    alias: 'e',
    type: /\d\d\d\d-\d\d-\d\d/,
    default: moment().subtract(3, 'day').format('YYYY-MM-DD')
  })
  .argv;
 
// Your Google Cloud Platform project ID
const projectId = argv.google;
const orgId = argv.org;
const filepath = argv.file; 

// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
});
 
// The name for the new dataset
const datasetName = 'githubarchive';

const createQuery = (date) => `SELECT id, type, created_at, repo.id, repo.name, actor.id, actor.login, payload
FROM (
  TABLE_DATE_RANGE([githubarchive:day.],
    TIMESTAMP('${date.format('YYYY-MM-DD')}'), 
    TIMESTAMP('${date.format('YYYY-MM-DD')}')
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
async function executeQuery(date) {
  const query = createQuery(date);

  debug('Executing query', query);

  const options = {
    query,
    useLegacySql: true,
  };

  const results = await bigquery.query(options);

  console.log('Fetched for day', date.format('YYYY-MM-DD'), results[0].length, 'rows');

  const contents = results[0]
    .map(parsePayload)
    .map(normalizeEvent)
    .map(row => JSON.stringify(row))
    .join(',\n');

  await util.promisify(fs.appendFile)(filepath, contents);

  return results[0].length;
}

async function main() {
  let numberOfRows = 0;
  let date = moment(argv.startDate);
  const end = moment(argv.endDate);

  console.log('Querying GBG from', date.format('YYYY-MM-DD'), 'to', end.format('YYYY-MM-DD'));

  while (date.isSameOrBefore(end)) {
    numberOfRows += await executeQuery(date);
    date = date.add(1, 'day');
  }
}

main()
  .catch(err => console.error(err));