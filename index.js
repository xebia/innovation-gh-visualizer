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

const query = `SELECT actor.login, COUNT(*) as nevents
FROM (
  TABLE_DATE_RANGE([githubarchive:day.],
    TIMESTAMP('2018-01-01'), 
    TIMESTAMP('2018-02-09')
  )
) 
WHERE org.id = 22632046
GROUP BY actor.login
ORDER BY nevents DESC`;

const options = {
  query,
  useLegacySql: true,
};

// Creates the new dataset
bigquery
  .query(options)
  .then(results => {
    console.log(results);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });