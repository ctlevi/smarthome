import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

var myHeaders = new Headers({
  "Content-Type": "application/json",
  "Accept": "application/json"
});

function switchStatus(id, number, status) {
  fetch('https://gvw188k7c6.execute-api.us-west-2.amazonaws.com/prod/graphql', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      query: `
        mutation {
          updateSwitchStatus(id: "${id}", number: ${number}, status: "${status}")
        }
      `
    }),
    headers: myHeaders
  }).catch(err => console.log(err))
    .then(result => console.log(result));
}

function getSwitches() {
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
            onRange {
              start,
              end
            }
          }
        }
      `
    }),
    headers: myHeaders
  }).catch(err => console.log(err))
    .then(response => response.json())
    .then(result => result.data.switches);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      switches: []
    };
  }

  componentDidMount() {
    getSwitches().then(switches => this.setState({ switches }))
  }

  render() {
    return (
      <div className="App">
        {this.state.switches.map((object) => {
          return (
            <div>
              <span style={{marginRight: '20px'}}>{object.purpose}</span>
              {object.status === 'off' ?
                <button disabled={!!object.onRange} style={{background: 'white'}} onClick={() => switchStatus(object.id, object.number, 'on')}>Turn On</button>
                : <button disabled={!!object.onRange} style={{background: 'yellow'}} onClick={() => switchStatus(object.id, object.number, 'off')}>Turn Off</button>
              }
            </div>
          );
        })}
      </div>
    );
  }
}

export default App;
