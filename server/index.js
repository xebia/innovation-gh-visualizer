// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const fs = require('fs');
const util = require('util');
 
// Your Google Cloud Platform project ID
const projectId = '320538068341';
const filepath = 'events.json'; 

// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
});
 
// The name for the new dataset
const datasetName = 'githubarchive';

const query = `SELECT id, type, created_at, repo.id, repo.name, actor.id, actor.login, payload
FROM (
  TABLE_DATE_RANGE([githubarchive:day.],
    TIMESTAMP('2018-02-08'), 
    TIMESTAMP('2018-02-09')
  )
) 
WHERE org.id = 22632046
ORDER BY created_at`;

const options = {
  query,
  useLegacySql: true,
};

function parsePayload(row) {
  try {
    return Object.assign({}, row, {
      payload: JSON.parse(row.payload),
    });
  } catch (err) {
    return row;
  }
}

// Creates the new dataset
async function main() {
  console.log('Querying GBG');

  const results = await bigquery.query(options);

  console.log('Fetched', results[0].length, 'rows');

  const contents = results[0]
    .map(parsePayload)
    .map(row => JSON.stringify(row))
    .join(',\n');

  await util.promisify(fs.writeFile)(filepath, `[\n${contents}\n]`);
}

main()
  .catch(err => console.error(err));