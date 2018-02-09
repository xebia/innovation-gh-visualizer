import React from 'react';
import PouchDB from 'pouchdb';
import Head from 'next/head';

const db = new PouchDB('http://localhost:9001/github');

db.info().then(function (info) {
  console.log(info);
})

export default class Main extends React.Component {
  state = {
    rows: []
  };

  componentDidMount() {
    db.allDocs({ include_docs: true }).then((docs) => {
      console.log(docs);
      this.setState({
        rows: this.state.rows.concat(docs.rows)
      })
    });
  }

  render() {
    return (
    <div>
      <Head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
      </Head>
      <table className="table">
        <thead>
          <td>ID</td>
          <td>created_at</td>
          <td>event type</td>
        </thead>
        <tbody>
        {this.state.rows.map(row => 
        <tr key={row.id}>
          <td>{row.doc.id}</td>
          <td>{row.doc.created_at}</td>
          <td>{row.doc.type}</td>
        </tr>
        )}
        </tbody>
      </table>
    </div>
    );
  }
}