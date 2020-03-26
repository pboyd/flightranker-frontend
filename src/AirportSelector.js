import React from "react";

import AirportSearchResults from "./AirportSearchResults";

import { BACKEND_URL } from "./util";

function parseFormattedAirport(value) {
  const openParen = value.indexOf("(");
  const closeParen = value.indexOf(")");
  if (openParen < 0 || closeParen < 0 || closeParen < openParen) {
    return "";
  }

  return value.substring(openParen + 1, closeParen);
}

class AirportSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      resultValues: []
    };

    this.onChange = this.onChange.bind(this);
  }

  render() {
    const dataListID = this.props.name + "Results";

    const results = (
      <AirportSearchResults id={dataListID} values={this.state.resultValues} />
    );

    return (
      <div className="control">
        <input
          placeholder={this.props.label}
          className="input"
          type="text"
          onChange={this.onChange}
          list={dataListID}
        />
        {results}
      </div>
    );
  }

  onChange(e) {
    const code = parseFormattedAirport(e.target.value);
    if (code) {
      this.setState({
        value: code,
        resultValues: []
      });

      if (this.props.onChange) {
        this.props.onChange(code);
      }
      return;
    }

    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }

    this.setState({
      value: e.target.value
    });

    if (e.target.value.length === 0) {
      this.setState({
        resultValues: []
      });
    } else if (e.target.value.length < 2) {
      return;
    }

    fetch(
      BACKEND_URL +
        '/?q={airportList(term:"' +
        e.target.value +
        '"){code,name,city,state}}'
    )
      .then(res => {
        return res.json();
      })
      .then(body => {
        this.setState({
          resultValues: body.airportList
        });
      });
  }
}

export default AirportSelector;
