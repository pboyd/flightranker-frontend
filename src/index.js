import React from 'react';
import ReactDOM from 'react-dom';
import { Bar } from 'react-chartjs-2';
import './index.scss'

const SUBTITLE = "What are the odds your flight is on time?";
const INSTRUCTIONS = "Search by city, airport name or airport code to find out. Supports direct flights in the United States.";

const BACKEND_URL=process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

class AirportSearchResults extends React.Component {
    render() {
        if (this.props.values == null || this.props.values.length === 0) {
            return null;
        }

        const results = new Array(this.props.values.length)

        for (let i = 0; i < this.props.values.length; i++) {
            const r = this.props.values[i];

            results[i] = (
                <option key={r.code}>{formatAirport(r.city, r.state, r.code)}</option>
            );
        }

        return (
            <datalist id={this.props.id}>{results}</datalist>
        );
    }
}

class AirportSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            resultValues: [],
        };

        this.onChange = this.onChange.bind(this);
    }

    render() {
        const dataListID = this.props.name+"Results";

        const results = (<AirportSearchResults
            id={dataListID}
            values={this.state.resultValues}
        />);

        return (
            <div className="control">
                    <input placeholder={this.props.label} className="input" type="text"  onChange={this.onChange} list={dataListID}/>
                    {results}
            </div>
        );
    }

    onChange(e) {
        const code = parseFormattedAirport(e.target.value);
        if (code) {
            this.setState({
                value: code,
                resultValues: [],
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
            value: e.target.value,
        });

        if (e.target.value.length === 0) {
                this.setState({
                    resultValues: [],
                });
        } else if (e.target.value.length < 2) {
            return;
        }

        fetch(BACKEND_URL + "/?q={airportList(term:\"" + e.target.value + "\"){code,name,city,state}}")
            .then((res) => {
                return res.json();
            })
            .then((body) => {
                this.setState({
                    resultValues: body.airportList,
                });
            }
        );
    }
}

class FlightForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            originCode: "",
            destinationCode: "",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const origin = <AirportSelector label="Origin" name="origin" onChange={(val) => this.setState({originCode: val})}/>;
        const dest = <AirportSelector label="Destination" name="destination" onChange={(val) => this.setState({destinationCode: val})}/>;
        return (
            <form onSubmit={this.handleSubmit}>
                <p className="subtitle is-4">{SUBTITLE}</p>
                <p className="content">{INSTRUCTIONS}</p>
                <div id="flightForm" className="field is-grouped">
                    {origin}
                    {dest}
                    <button type="submit" className={"button" + (this.props.loading ? " is-loading" : "")}>Go</button>
                </div>
            </form>
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.originCode, this.state.destinationCode);
    }
}

class FlightInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (!this.state.origin || !this.state.destination) {
            return null;
        }

        const originDesc = formatAirport(this.state.origin.city, this.state.origin.state, this.state.origin.code);
        const destDesc = formatAirport(this.state.destination.city, this.state.destination.state, this.state.destination.code);

        const header = (<h1 className="title is-3">{originDesc} to {destDesc}</h1>);

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
                    <tbody>
                        {rows}
                    </tbody>
                </table>

                <Bar data={this.state.chartData} options={chartOptions}/>
            </div>
        );
    }

    componentDidUpdate(prevProps) {
        if (this.props.origin === prevProps.origin && this.props.destination === prevProps.destination) {
            return;
        }

        this.props.loadingStart();

        fetch(BACKEND_URL + '/?q={flightStatsByAirline(origin:"' + this.props.origin +'",destination:"' + this.props.destination + '"){airline,onTimePercentage,lastFlight},origin:airport(code:"' + this.props.origin + '"){code,name,city,state},destination:airport(code:"' + this.props.destination + '"){code,name,city,state},dailyFlightStats(origin:"' + this.props.origin + '",destination:"' + this.props.destination + '"){airline,days{date,onTimePercentage}}}')
            .then((res) => {
                return res.json();
            })
            .then((body) => {
                this.setState({
                    origin: body.origin,
                    destination: body.destination,
                    stats: body.flightStatsByAirline,
                    chartData: convertDailyStatsToChartData(body.dailyFlightStats),
                });

                let title = "Flight Stats"
                if (body.origin && body.destination) {
                    title = "Flight Stats - " +
                        formatAirport(body.origin.city, body.origin.state, body.origin.code) +
                        " to " +
                        formatAirport(body.destination.city, body.destination.state, body.destination.code);

                    window.history.pushState(
                        {
                            origin: body.origin.code,
                            destination: body.destination.code,
                        },
                        title,
                        "#" + body.origin.code + "/" + body.destination.code,
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
    loadingStart: function(){},
    loadingEnd: function(){},
};

class App extends React.Component {
    constructor(props) {
        super(props)

        this.changeFlight = this.changeFlight.bind(this);

        const initialState = {
            origin: "",
            destination: "",
            loading: false,
        };

        this.state = initialState;
    }

    render() {
        if (this.state.static) {
            return (this.state.static);
        }

        return (
            <div>
                <FlightForm onSubmit={this.changeFlight} loading={this.state.loading}/>
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
            destination: destinationCode,
        })
    }

    componentDidMount() {
        window.addEventListener(
            "popstate",
            (e) => {
                if (e.state && e.state.origin && e.state.destination) {
                    this.changeFlight(e.state.origin, e.state.destination);
                }
            },
        );

        if (document.location.hash.length === 8) {
            const slash = document.location.hash.indexOf("/");
            if (slash === 4) {
                this.changeFlight(
                    document.location.hash.substring(1, 4),
                    document.location.hash.substring(5, 8),
                );
            }
        } else if (document.location.pathname === "/about") {
            import('./about').then(about => {
                this.setState({
                    static: <about.About/>
                })
            });
        }
    }

    loadingStart() {
        this.setState({loading: true});
    }

    loadingEnd() {
        this.setState({loading: false});
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root'),
)

function formatAirport(city, state, code) {
        return city + ", " + state + " (" + code + ")";
}

function parseFormattedAirport(value) {
    const openParen = value.indexOf("(");
    const closeParen = value.indexOf(")");
    if (openParen < 0 || closeParen < 0 || closeParen < openParen) {
        return "";
    }

    return value.substring(openParen+1, closeParen);
}

function convertDailyStatsToChartData(stats) {
    if (stats === null || stats.length === 0) {
        return null;
    }

    return {
        datasets: dailyStatsData(stats),
    };
}

const chartOptions = {
    scales: {
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'On-Time Percentage',
            },
        }],
        xAxes: [{
            type: 'time',
            display: true,
            time: {
                parser: 'YYYY-MM-DDTHH:mm:ssZ',
                tooltipFormat: 'YYYY-MM-DD'
            },
            scaleLabel: {
                display: true,
                labelString: 'Date'
            },
        }],
    },
};

function dailyStatsData(stats) {
    const colors = defaultChartColors()

    return stats.map((airline) => {
        const color = colors.shift()
        return {
            label: airline.airline,
            fill: false,
            backgroundColor: color,
            borderColor: color,
            data: airline.days.map((day) => (
                {
                    x: day.date,
                    y: day.onTimePercentage,
                }
            )),
        }
    });
}

function defaultChartColors() {
    return [
        '#cc3333',
        '#3333cc',
        '#33cc33',
        '#33cccc',
        '#cccc33',
        '#990000',
        '#000099',
        '#009900',
        '#009999',
        '#999900',
        '#999999',
        '#cccccc',
        '#000000',
    ];
}
