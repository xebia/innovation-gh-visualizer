import React from 'react';
import PouchDB from 'pouchdb';
import Head from 'next/head';
import JSONStream from '../core/json-stream.1';

const db = new PouchDB('http://localhost:5984/github-events');

db.info().then(function (info) {
  console.log(info);
})

const Events = ({ month, day, rows }) => (
  <table className="table">
    <thead>
      <tr>
      <th>ID</th>
      <th>created_at</th>
      <th>event type</th>
      </tr>
    </thead>
    <tbody>
    {rows.map(row => 
    <tr key={row._id}>
      <td>{row._id}</td>
      <td>{row.created_at.toISOString()}</td>
      <td>{row.type}</td>
    </tr>
    )}
    </tbody>
  </table>
)

const blockStyle = {
  display: 'inline-block',
  width: 7,
  height: 7,
  marginRight: 2,
  background: 'black'
};

const EventsByUser = ({selectColor, data}) => (
  <div>
    {data.map(([user,events]) => 
      events.length > 1 && <div>
        <b>{user} </b>
        { events.map(event => <div key={event._id} onMouseOver={() => console.log(event.type)} style={Object.assign({}, blockStyle, {background: selectColor(event.type)})} />) }
      </div>
    )}
  </div>
);

function groupBy(rows, field) {
  const data = rows.reduce((mem, doc) => 
    Object.assign({}, mem, { [doc[field]]: (mem[doc[field]] || []).concat(doc) }), 
    {}
  );

  return Object.keys(data).map(user => [user, data[user]]).sort((a, b) => b[1].length - a[1].length);
}

export default class Main extends React.Component {
  static colors = ['#C2024F', '#04BBBF', '#D2D945', '#FCB13F', '#FF594F'];
  static colorsForEventType = {
    'IssueCommentEvent': '#C2024F',
    'WatchEvent': 'yellow',
    'PullRequestEvent': 'green',
    'PushEvent': '#04BBBF',
    'IssueCommentEvent': '#D2D945',
    'IssuesEvent': 'red',
    'PullRequestReviewCommentEvent': '#FCB13F',
    'DeleteEvent': '#FF594F',
  };

  state = {
    orgId: 22632046,
    year: 2018,
    month: 2,
    rows: []
  };

  async fetchEvents() {
    const results = await db.query('by_org/created_at', {
      limit: 1000,
      include_docs: true,
      startkey: [parseInt(this.state.orgId, 10), parseInt(this.state.year, 10), parseInt(this.state.month, 10)],
      endkey: [parseInt(this.state.orgId, 10), parseInt(this.state.year, 10), parseInt(this.state.month, 10)]
    });
    
    const rows = results.rows.map(({key, doc}) => Object.assign({}, doc, { created_at: new Date(doc.created_at), key }));

    this.setState({
      rows
    });
  }

  componentDidMount() {
    this.fetchEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.orgId !== prevState.orgId || this.state.month !== prevState.month || this.state.year !== prevState.year) {
      this.fetchEvents();
    }
  }

  render() {
    const days = new Set(this.state.rows.map(({created_at}) => created_at.getDay()));

    return (
    <div>
      <Head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
      </Head>
      <label>Github org: </label>
      <select value={this.state.orgId} onChange={e => this.setState({ rows: [], orgId: e.target.value })}>
        <option value="375746">Xebia</option>
        <option value="22632046">StoryBook</option>
      </select>
      <label>Year: </label>
      <input type="number" value={this.state.year} onChange={e => this.setState({ year: e.target.value })} />
      <label>Month: </label>
      <input type="number" value={this.state.month} onChange={e => this.setState({ month: e.target.value })} />
      {
        [...days].sort().map(day => 
          [
            <h4 key={'title-'+day}>{this.state.year}-{this.state.month}-{day+1}</h4>,
            <span key={'events-'+day}>#events {this.state.rows.filter(doc => doc.created_at.getDay() !== day).length}</span>,
            <EventsByUser key={'byUser-'+day} selectColor={et => Main.colorsForEventType[et]} data={groupBy(this.state.rows, 'actor_login')} />,
          ]
        )
      }
    </div>
    );
  }
}