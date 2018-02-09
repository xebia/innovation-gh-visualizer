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

async function saveRow(row) {
  return util.promisify(fs.appendFile)(filepath, JSON.stringify(row));
}

// Creates the new dataset
async function main() {
  fs.closeSync(fs.openSync(filepath, 'w'));

  const results = await bigquery.query(options);
  
  return Promise.all(results
    .map(parsePayload)
    .map(saveRow));
}

main()
  .catch(err => console.error(err));