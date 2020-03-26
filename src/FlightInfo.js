import React from "react";
import { Line } from "react-chartjs-2";

import { formatAirport, BACKEND_URL } from "./util";

class FlightInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (!this.state.origin || !this.state.destination) {
      return null;
    }

    const originDesc = formatAirport(
      this.state.origin.city,
      this.state.origin.state,
      this.state.origin.code
    );
    const destDesc = formatAirport(
      this.state.destination.city,
      this.state.destination.state,
      this.state.destination.code
    );

    const header = (
      <h1 className="title is-3">
        {originDesc} to {destDesc}
      </h1>
    );

    if (!this.state.stats || this.state.stats.length === 0) {
      return (
        <div className="section">
          {header}
          <div>No data available</div>
        </div>
      );
    }

    const rows = new Array(this.state.stats.length);
    for (let i = 0; i < rows.length; i++) {
      rows[i] = (
        <tr key={i}>
          <td>{this.state.stats[i].airline}</td>
          <td>{this.state.stats[i].onTimePercentage.toPrecision(4)}%</td>
        </tr>
      );
    }

    return (
      <div className="section">
        {header}
        <table className="table">
          <thead>
            <tr>
              <th>Airline</th>
              <th>On-Time Percentage</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>

        <Line data={this.state.chartData} options={chartOptions} />
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.origin === prevProps.origin &&
      this.props.destination === prevProps.destination
    ) {
      return;
    }

    this.props.loadingStart();

    fetch(
      BACKEND_URL +
        '/?q={flightStatsByAirline(origin:"' +
        this.props.origin +
        '",destination:"' +
        this.props.destination +
        '"){airline,onTimePercentage,lastFlight},origin:airport(code:"' +
        this.props.origin +
        '"){code,name,city,state},destination:airport(code:"' +
        this.props.destination +
        '"){code,name,city,state},monthlyFlightStats(origin:"' +
        this.props.origin +
        '",destination:"' +
        this.props.destination +
        '"){airline,rows{date,onTimePercentage}}}'
    )
      .then(res => {
        return res.json();
      })
      .then(body => {
        this.setState({
          origin: body.origin,
          destination: body.destination,
          stats: body.flightStatsByAirline,
          chartData: convertDailyStatsToChartData(body.monthlyFlightStats)
        });

        let title = "Flight Stats";
        if (body.origin && body.destination) {
          title =
            "Flight Stats - " +
            formatAirport(
              body.origin.city,
              body.origin.state,
              body.origin.code
            ) +
            " to " +
            formatAirport(
              body.destination.city,
              body.destination.state,
              body.destination.code
            );

          window.history.pushState(
            {
              origin: body.origin.code,
              destination: body.destination.code
            },
            title,
            "#" + body.origin.code + "/" + body.destination.code
          );
        }

        document.title = title;
      })
      .finally(() => {
        this.props.loadingEnd();
      });
  }
}

FlightInfo.defaultProps = {
  loadingStart: function() {},
  loadingEnd: function() {}
};

function convertDailyStatsToChartData(stats) {
  if (!stats || stats.length === 0) {
    return null;
  }

  return {
    datasets: dailyStatsData(stats)
  };
}

const chartOptions = {
  scales: {
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "On-Time Percentage"
        }
      }
    ],
    xAxes: [
      {
        type: "time",
        display: true,
        time: {
          parser: "YYYY-MM-DDTHH:mm:ssZ",
          tooltipFormat: "YYYY-MM-DD"
        },
        scaleLabel: {
          display: true,
          labelString: "Date"
        }
      }
    ]
  }
};

function dailyStatsData(stats) {
  const colors = defaultChartColors();

  return stats.map(airline => {
    const color = colors.shift();
    return {
      label: airline.airline,
      fill: false,
      backgroundColor: color,
      borderColor: color,
      data: airline.rows.map(day => ({
        x: day.date,
        y: day.onTimePercentage
      }))
    };
  });
}

function defaultChartColors() {
  return [
    "#cc3333",
    "#3333cc",
    "#33cc33",
    "#33cccc",
    "#cccc33",
    "#990000",
    "#000099",
    "#009900",
    "#009999",
    "#999900",
    "#999999",
    "#cccccc",
    "#000000"
  ];
}

export default FlightInfo;
