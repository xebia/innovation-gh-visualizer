import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import data from './data.json';

import * as d3 from 'd3';
import * as scaleChromatic from 'd3-scale-chromatic';

const igorEvents = d3
const myData = data.filter(d => !d.actor_login.includes('bot')).map(e => ({
  user: e.actor_login,
  type: e.type,
  date: new Date(e.created_at),
  metadata: e.payload,
}));

const mapDays = function () {
  var minimumDate = new Date();
  var days = 60;

  // minimumDate.setDate(-days);
  var result = data;
  for (var i = 1; i < days; i++) {
    var dateTimeMillis = (new Date()).setDate(-i);
    var dayName = (new Date(dateTimeMillis)).toDateString();
    var foundItem = data.find(item => {
      return (new Date(item.created_at)).toDateString() === dayName;
    });
    if (!foundItem) {
      console.log(data.indexOf(foundItem));
      //Push the data in the right place into the event data
      // var index = getEventIndex(new Date(dateTimeMillis), data);
      result.push({
        "created_at": (new Date(dateTimeMillis)).toISOString()
      }
      );
      console.log(dayName);
    }

    // result.push(dayName);
    console.log(data);
  }

  result = result.sort(function (a, b) {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return result;
};

const getEventIndex = function (date, eventData) {
  eventData.find(item => {

  });
  for (var i = 0; i < eventData.length; i++) {

  }
};

const eventsByUser = d3
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

    var groupedData = d3.nest()
      .key(function (d) {
        var date = new Date(d.created_at);
        return date.toDateString();
      })
      .key(function (d) {
        return d.actor_login;
      })
      .rollup(function (v) {
        return  {
          length: v.length,
          event: v
        };
      })
      .entries(mapDays());

    // console.log(data);
    console.log(groupedData);

    var dateSeries = d3.select("body")
      .selectAll("ul")
      .data(groupedData)
      .enter().append("ul")
      .text(function (d) {
        return d.key;
      })
      .selectAll("li")
      .data(function (d) {
        return d.values;
      })
      .enter().append("li")
      .text(function (d) {
        return d.key;
      });
  }


  render() {
    return <svg id="svg" />;
  }
}

export default App;
