import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

var myHeaders = new Headers({
  "Content-Type": "application/json",
  "Accept": "application/json"
});

function switchStatus(id, status) {
  fetch('https://gvw188k7c6.execute-api.us-west-2.amazonaws.com/prod/graphql', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      query: `
        mutation {
          updateSwitchStatus(id: "${id}", status: "${status}")
        }
      `
    }),
    headers: myHeaders
  }).catch(err => console.log(err))
    .then(result => console.log(result));
}

function getGraph() {
  return fetch('https://gvw188k7c6.execute-api.us-west-2.amazonaws.com/prod/graphql', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      query: `
        query {
          switches {
            id,
            number,
            purpose,
            status,
            schedule {
              onTime,
              offTime
            }
          },
          iotStatus {
            lastPingTime,
            minutesSinceLastPing
          }
        }
      `
    }),
    headers: myHeaders
  }).catch(err => console.log(err))
    .then(response => response.json())
    .then(result => result.data);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      switches: [],
      iotStatus: {},
      loading: true
    };
  }

  componentDidMount() {
    getGraph().then(graph => this.setState({ ...graph, loading: false }))
  }

  render() {
    if (this.state.loading) {
      return (<div className="App"></div>);
    }

    return (
      <div className="App">
        {this.state.switches.map((object) => {
          return (
            <div>
              <span style={{marginRight: '20px'}}>{object.purpose}</span>
              {object.status === 'off' ?
                <button disabled={!!object.schedule} style={{background: 'white'}} onClick={() => switchStatus(object.id, 'on')}>Turn On</button>
                : <button disabled={!!object.schedule} style={{background: 'yellow'}} onClick={() => switchStatus(object.id, 'off')}>Turn Off</button>
              }
              {object.schedule ?
                <span style={{marginLeft: '20px'}}>{object.schedule.onTime} - {object.schedule.offTime}</span>
                : null
              }
            </div>
          );
        })}
        <div style={this.state.iotStatus.minutesSinceLastPing >= 5 ? {color: 'red'} : {color: 'green'}}>
          The Raspberry Pi was last on at {new Date(this.state.iotStatus.lastPingTime).toLocaleString()},
          which was {this.state.iotStatus.minutesSinceLastPing} minutes ago
        </div>
      </div>
    );
  }
}

export default App;
