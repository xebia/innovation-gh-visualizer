import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import sample from './sample/sample.json';
const d3 = window.d3;

class App extends Component {
  componentDidMount() {
    var groupedData = d3.nest()
      .key(function (d) {
        var date = new Date(d.created_at);
        return date.toDateString();
      })
      .key(function (d) {
        return d.actor_login;
      })
      .rollup(function (v) {
        return v.length;
      })
      .entries(sample);

    console.log(sample);
    console.log(groupedData);
    // var test = [{ "key": "Mon Jan 01 2018", "values": [{ "key": "papasnippy", "value": 1 }, { "key": "ryudice", "value": 1 }, { "key": "stale[bot]", "value": 7 }, { "key": "tonthanhhung", "value": 1 }, { "key": "monolead", "value": 1 }, { "key": "thomasfw", "value": 1 }, { "key": "Arshiamidos", "value": 1 }, { "key": "mdnsk", "value": 1 }, { "key": "saeidalidadi", "value": 1 }, { "key": "syahn", "value": 1 }, { "key": "tarol", "value": 1 }, { "key": "Egorvoz", "value": 1 }, { "key": "EKMN", "value": 1 }, { "key": "amazecc", "value": 1 }, { "key": "dependencies[bot]", "value": 2 }, { "key": "ValCapri", "value": 1 }, { "key": "codecov[bot]", "value": 2 }, { "key": "tkh", "value": 1 }, { "key": "goh-chunlin", "value": 1 }, { "key": "binyamg", "value": 1 }, { "key": "Hypnosphi", "value": 6 }, { "key": "franchb", "value": 1 }, { "key": "Chetan496", "value": 1 }, { "key": "oblador", "value": 1 }, { "key": "BrunoAnken", "value": 1 }, { "key": "echoAlexey", "value": 1 }, { "key": "malteA", "value": 1 }, { "key": "NetanelBasal", "value": 2 }, { "key": "wimjjj", "value": 1 }, { "key": "igor-dv", "value": 5 }, { "key": "hannesfrank", "value": 1 }, { "key": "eduardosilva", "value": 1 }, { "key": "kusl", "value": 1 }, { "key": "9034725985", "value": 1 }, { "key": "ersel", "value": 3 }, { "key": "ndelangen", "value": 6 }, { "key": "RichDonnellan", "value": 1 }, { "key": "coderkevin", "value": 1 }, { "key": "ralzinov", "value": 1 }, { "key": "waskito", "value": 2 }, { "key": "smclements", "value": 1 }, { "key": "solael", "value": 1 }, { "key": "pelotom", "value": 1 }] }];
    var dateSeries = d3.select("body")
      .selectAll("p")
      .data(groupedData)
      .enter().append("p")
      .text(function (d) {
        return d.key;
      });
    
    var nameSeries = dateSeries.selectAll("p")
      .data(function (d) {
        return d;
      }).enter

  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
      </div>
    );
  }
}

export default App;
