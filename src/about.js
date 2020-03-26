import React from "react";

export class About extends React.Component {
  render() {
    return (
      <div>
        <h1 className="title is-3">About</h1>
        <p className="content">
          FlightRanker.com was created by{" "}
          <a href="https://pboyd.io">Paul Boyd</a> as an experiment with
          software organization. You can read more about that{" "}
          <a href="https://pboyd.io">here</a>. The back-end source code is
          available at{" "}
          <a href="https://github.com/pboyd/flightranker-backend">
            github.com/pboyd/flightranker-backend
          </a>
          .
        </p>

        <p className="content">
          On-Time performance data are provided by the{" "}
          <a href="https://www.transtats.bts.gov">
            US Bureau of Transportation Statistics
          </a>
          .
        </p>

        <p className="content">
          Lists of airlines and airports were taken from{" "}
          <a href="http://stat-computing.org/dataexpo/2009/supplemental-data.html">
            stat-computing.org
          </a>
          .
        </p>
      </div>
    );
  }
}
