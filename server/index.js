// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const fs = require('fs');
const util = require('util');
const moment = require('moment');
 
// Your Google Cloud Platform project ID
const projectId = '320538068341';
const orgId = 22632046;
const filepath = 'events.json'; 

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
  console.log('Querying GBG');

  const options = {
    query: createQuery(date),
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
  await util.promisify(fs.writeFile)(filepath, '');
  let numberOfRows = 0;
  let date = moment('2017-01-01');
  const end = moment('2017-01-03');

  while (date.isBefore(end)) {
    numberOfRows += await executeQuery(date);
    date = date.add(1, 'day');
  }
}

main()
  .catch(err => console.error(err));