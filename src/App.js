import React, { Component } from 'react';
import './App.css';

var myHeaders = new Headers({
  "Content-Type": "application/json",
  "Accept": "application/json"
});

let api = 'https://gvw188k7c6.execute-api.us-west-2.amazonaws.com/prod/graphql'
if (process.env.NODE_ENV === 'development') {
  api = 'https://gvw188k7c6.execute-api.us-west-2.amazonaws.com/prod/graphql-testing'
}

function switchStatus(id, status) {
  return fetch(api, {
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
  return fetch(api, {
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

  refreshData() {
    this.setState({ loading: true });
    getGraph()
      .then(graph => this.setState({ ...graph, loading: false }))
      .catch(err => this.setState({ loading: false }));
  }

  onSwitchClick(id, status) {
    return () => {
      switchStatus(id, status)
        .then(() => this.refreshData());
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  render() {
    if (this.state.loading) {
      return (<div className="App">Loading...</div>);
    }

    return (
      <div className="App">
        {this.state.switches.map((object) => {
          return (
            <div className="switches">
              <span>{object.purpose}</span>
              {object.status === 'off' ?
                <button disabled={!!object.schedule} style={{background: 'white'}} onClick={this.onSwitchClick(object.id, 'on')}>Turn On</button>
                : <button disabled={!!object.schedule} style={{background: 'yellow'}} onClick={this.onSwitchClick(object.id, 'off')}>Turn Off</button>
              }
              {object.schedule ?
                <span>{object.schedule.onTime} - {object.schedule.offTime}</span>
                : <span /> 
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
