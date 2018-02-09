// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
 
// Your Google Cloud Platform project ID
const projectId = '320538068341';
 
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
  const results = await bigquery.query(options);
  
  results
    .map(parsePayload)
    .forEach(row => console.log(JSON.stringify(row)));
}

main()
  .catch(err => console.error(err));