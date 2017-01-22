import React, { Component } from 'react';
import './App.css';

var json
var server = "http://localhost/kubernetes/"
var api = "api/v1"
var url = `${server}${api}/pods`

function updateData() {
  fetch(url,
    {
      mode: "no-cors",
      method: "GET"
  })
  .then(function(response) {
    return response.json()
  })
  .then(function(data) {
    json = data
  });
}

function pruneContainerJSON(container) {
  let running = (("running" in container.ready.hasOwnProperty) === false);

  return {
    name:    container.name,
    running: running,
    ready:   container.ready,
    image:   container.image
  }
}

function prunePodJSON(pod) {
  let containers = [];

  for (var key in pod.status.containerStatuses) {
    if (pod.status.containerStatuses.hasOwnProperty(key)) {
      containers.push(pruneContainerJSON(pod.status.containerStatuses[key]))
    }
  }

  return {
    name:       pod.metadata.name,
    namespace:  pod.metadata.namespace,
    labels:     pod.metadata.labels,
    nodeName:   pod.spec.nodeName,
    state:      pod.status.phase,
    containers: containers
  }
}

class Data extends Component {
  render() {
    updateData();

    let pods = []

    if (json) {
      for (var key in json.items) {
        if (json.items.hasOwnProperty(key)) {
          pods.push(prunePodJSON(json.items[key]))
        }
      }
    }

    return <pre>{JSON.stringify(pods, null, 2)}</pre>
  }
}

class Pods extends Component {
  constructor(props) {
    super(props);
    this.state = {text: <Data />};
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ text: <Data /> });
  }

  render() {
    return (
      <div>{this.state.text}</div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-fetch">
          <Pods />
        </div>
      </div>
    );
  }
}

export default App;
