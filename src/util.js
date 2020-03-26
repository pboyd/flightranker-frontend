const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function formatAirport(city, state, code) {
  return city + ", " + state + " (" + code + ")";
}

export { BACKEND_URL, formatAirport };
