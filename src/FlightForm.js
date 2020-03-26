import React from "react";

import AirportSelector from "./AirportSelector";

const SUBTITLE = "What are the odds your flight is on time?";
const INSTRUCTIONS =
  "Search by city, airport name or airport code to find out. Supports direct flights in the United States.";

class FlightForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      originCode: "",
      destinationCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const origin = (
      <AirportSelector
        label="Origin"
        name="origin"
        onChange={val => this.setState({ originCode: val })}
      />
    );
    const dest = (
      <AirportSelector
        label="Destination"
        name="destination"
        onChange={val => this.setState({ destinationCode: val })}
      />
    );
    return (
      <form onSubmit={this.handleSubmit}>
        <p className="subtitle is-4">{SUBTITLE}</p>
        <p className="content">{INSTRUCTIONS}</p>
        <div id="flightForm" className="field is-grouped">
          {origin}
          {dest}
          <button
            type="submit"
            className={"button" + (this.props.loading ? " is-loading" : "")}
          >
            Go
          </button>
        </div>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.originCode, this.state.destinationCode);
  }
}

export default FlightForm;
