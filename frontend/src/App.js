import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import data from './data.json';

import * as d3 from 'd3';
import * as scaleChromatic from 'd3-scale-chromatic';

const igorEvents = d3
  .nest()
  .key(d => d.actor_login)
  .key(d => {
    var date = new Date(d.created_at);
    return date.toDateString();
  })
  .entries(data)
  .find(({ key }) => key === 'igor-dv').values;

console.log(igorEvents);

const minDate = d3.timeDay.floor(
  new Date(Math.min(...data.map(({ created_at }) => new Date(created_at)))),
);
const maxDate = d3.timeDay.ceil(
  new Date(Math.max(...data.map(({ created_at }) => new Date(created_at)))),
);
const dateRange = d3.timeDay.range(minDate, maxDate);

const squareSize = 10;
const gutter = 5;
const xScaleSquare = x => x * (squareSize + gutter);
const eventTypes = [
  'PushEvent',
  'IssueCommentEvent',
  'DeleteEvent',
  'IssuesEvent',
  'PullRequestEvent',
  'ForkEvent',
];
const typeScale = d3
  .scaleOrdinal(scaleChromatic.schemeAccent)
  .domain(eventTypes);

// {
//   user,
//   time,
//   type,
//   meta,
// }

class App extends Component {
  componentDidMount() {
    // console.log(eventsByUser);
    const groupSelector = d3
      .select('#svg')
      .selectAll('rect')
      .data(
        [].concat(
          ...igorEvents.map(({ values }, y) =>
            values.map((event, x) => ({ ...event, x, y })),
          ),
        ),
      )
      .enter()
      .append('rect')
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('x', ({ x }) => {
        return xScaleSquare(x);
      })
      .attr('y', ({ y }) => {
        return xScaleSquare(y);
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
