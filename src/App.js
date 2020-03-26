import React from "react";

import FlightInfo from "./FlightInfo";
import FlightForm from "./FlightForm";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.changeFlight = this.changeFlight.bind(this);

    const initialState = {
      origin: "",
      destination: "",
      loading: false
    };

    this.state = initialState;
  }

  render() {
    if (this.state.static) {
      return this.state.static;
    }

    return (
      <div>
        <FlightForm onSubmit={this.changeFlight} loading={this.state.loading} />
        <FlightInfo
          origin={this.state.origin}
          destination={this.state.destination}
          loadingStart={() => this.loadingStart()}
          loadingEnd={() => this.loadingEnd()}
        />
      </div>
    );
  }

  changeFlight(originCode, destinationCode) {
    this.setState({
      origin: originCode,
      destination: destinationCode
    });
  }

  componentDidMount() {
    window.addEventListener("popstate", e => {
      if (e.state && e.state.origin && e.state.destination) {
        this.changeFlight(e.state.origin, e.state.destination);
      }
    });

    if (document.location.hash.length === 8) {
      const slash = document.location.hash.indexOf("/");
      if (slash === 4) {
        this.changeFlight(
          document.location.hash.substring(1, 4),
          document.location.hash.substring(5, 8)
        );
      }
    } else if (document.location.pathname === "/about") {
      import("./about").then(about => {
        this.setState({
          static: <about.About />
        });
      });
    }
  }

  loadingStart() {
    this.setState({ loading: true });
  }

  loadingEnd() {
    this.setState({ loading: false });
  }
}

export default App;
