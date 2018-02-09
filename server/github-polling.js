const fetch = require('./core/fetch');

const token = process.env.GITHUB_TOKEN;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function github(path, {page=0, etag}) {

  const response = await fetch(`https://api.github.com${path}?page=${page}`,{
    headers: {
      'Authorization': `token ${token}`,
      'If-None-Match': etag,
    }
  });

  if (response.status === 304) {
    return { etag, body: [] };
  }

  const body = await response.json();

  return {
    etag: response.headers.get('etag').slice(2),
    body
  };
}

function normalizeEvent(msg) {
  return {
    id: msg.id,
    type: msg.type,
    created_at: msg.created_at,
    repo_id: msg.repo.id,
    repo_name: msg.repo.name,
    actor_id: msg.actor.id,
    actor_login: msg.actor.login,
    payload: msg.payload,
  };
}

async function main() {
  let etag = '';

  while (true) {
    const result = await github('/users/matthisk/events/orgs/xebia', {etag});

    etag = result.etag;

    console.log(JSON.stringify(result.body.map(normalizeEvent)));

    await sleep(5000);
  }
}

main()
  .catch(error => console.error(error.stack));