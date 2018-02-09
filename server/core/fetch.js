const _fetch = require('node-fetch');

module.exports = async function fetch(...args) {
  const response = await _fetch(...args);

  if (response.status === 304) {
    return response;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(['Request failed', response.url, response.status, response.statusText].join(' '));
  }

  return response;
}