import React from "react";

import { formatAirport } from "./util";

class AirportSearchResults extends React.Component {
  render() {
    if (this.props.values == null || this.props.values.length === 0) {
      return null;
    }

    const results = new Array(this.props.values.length);

    for (let i = 0; i < this.props.values.length; i++) {
      const r = this.props.values[i];

      results[i] = (
        <option key={r.code}>{formatAirport(r.city, r.state, r.code)}</option>
      );
    }

    return <datalist id={this.props.id}>{results}</datalist>;
  }
}

export default AirportSearchResults;
