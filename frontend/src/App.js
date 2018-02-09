import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import data from './data.json';

import * as d3 from 'd3';
import * as scaleChromatic from 'd3-scale-chromatic';

const myData = data.filter(d => !d.actor_login.includes('bot')).map(e => ({
  user: e.actor_login,
  type: e.type,
  date: new Date(e.created_at),
  metadata: e.payload,
}));

const eventsByUser = d3
  .nest()
  .key(d => d.user)
  .object(myData);

const squareSize = 10;
const gutter = 5;
const xScaleSquare = x =>  x * (squareSize + gutter);

const typeScale = d3
  .scaleOrdinal(scaleChromatic.schemeAccent)
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

class App extends Component {
  componentDidMount() {
    d3
      .select('#svg')
      .selectAll('circle')
      .data(eventsByUser.ndelangen)
      .enter()
      .append('svg:rect')
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('x', (d, i) => {
        return xScaleSquare(i);
      })
      .attr('fill', ({ type }) => {
        return typeScale(type);
      });
  }
  render() {
    return <svg id="svg" />;
  }
}

export default App;
