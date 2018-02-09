import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import data from './data.json';

const d3 = window.d3;

const myData = data.filter(d => !d.actor_login.includes('bot')).map(e => ({
  user: e.actor_login,
  type: e.type,
  date: new Date(e.created_at),
  metadata: e.payload,
}));

const myScale = d3.scaleLinear().domain([0, 10]);
const typeScale = d3
  .scaleOrdinal(d3.schemeAccent)
  .domain([
    'PushEvent',
    'IssueCommentEvent',
    'DeleteEvent',
    'IssuesEvent',
    'PullRequestEvent',
    'ForkEvent',
  ]);

// {
//   user,
//   time,
//   type,
//   meta,
// }

console.log(myData);

class App extends Component {
  componentDidMount() {
    d3
      .select('#svg')
      .selectAll('circle')
      .data(myData)
      .enter()
      .append('circle')
      .attr('r', (d, i, l) => {
        return 4;
      })
      .attr()
      .attr('cx', (d, i, l) => {
        return i;
      })
      .attr('cy', d => d);
  }
  render() {
    return <svg id="svg" />;
  }
}

export default App;
