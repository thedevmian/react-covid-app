import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import InfoBox from "./components/infoBox";
import Map from "./components/Map";
import Graph from "./components/Graph";
import Table from "./components/Table";
import { sortData } from "./util";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState([1]);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso3,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter({ lat: data.countryInfo.lat, lng: data.countryInfo.long });
        setMapZoom([4]);
      });
  };

  // https://disease.sh/v3/covid-19/countries
  // useEffect = runs a piece of code based on a given condition
  // The code inside will runs once when the component loads and not again
  // async -> send a request, wait for it, do somethin with it

  return (
    <div className="app">
      <div className="app__left">
        <div className="app_header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app_stats">
          <InfoBox
            title="Coronavirus Cases"
            cases={countryInfo.todayCases}
            total={countryInfo.cases}
          />
          <InfoBox
            title="Recovered"
            cases={countryInfo.todayRecovered}
            total={countryInfo.recovered}
          />
          <InfoBox
            title="Deathes"
            cases={countryInfo.todayDeaths}
            total={countryInfo.deaths}
          />
        </div>
        <div className="app_map">
          <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} />
        </div>
      </div>

      <div className="app__right">
        <Card className="sidebar">
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new cases</h3>
            <Graph />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
