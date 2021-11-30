import React, { useState, useEffect } from "react";
import { 
  FormControl, 
  MenuItem, 
  Select, 
  Card, 
  CardContent 
} from "@mui/material";
import InfoBox from "./InfoBox";
import Map from "./Map"
import Table from "./Table"
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide'); // set default worldwide for selected country
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat:29, lng: 40}); // lat-lng center of the default map
  const [mapZoom, setMapZoom] = useState(1.8);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
  
  useEffect(() => {

    // async -> send a request, wait for response, get called/ used later on
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        // when get back the response -> do sthing
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
              name: country.country,        // United States, Vietnam, Austrlia
              value: country.countryInfo.iso2, // USA, VN, AU
          }));

          let sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);      //Map need all response from data, not just name and value from "countries"
          setCountries(countries);
        }); 
    };

    getCountriesData();
  }, []);


  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = 
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        // if "worldwide" selected, there would be no returned lat, long
        // => need to set lat long for worldwide case
        if (countryCode === "worldwide") {
          setMapCenter([29, 40])
          setMapZoom(1.8)
        } else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long ])
          setMapZoom(4.2)
        };
        //   ? setMapCenter([34.80746, -40.4796])
        //   : setMapCenter([data.countryInfo.lat, data.countryInfo.long ])
        // setMapZoom(4.2);    
      });
  };

  console.log("countryInfo:");
  console.log(countryInfo);


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worlwide</MenuItem>
              {countries.map((country) => (
                // .value, .name from each country in useEffect of the state "countries"
                <MenuItem value={country.value}>{country.name}</MenuItem> 
              ))}
            </Select>
          </FormControl>
        </div>  
        <div className="app__stats">
          <InfoBox 
            onClick={(e) => setCasesType("cases")}
            title="Covid Cases" 
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox
            onClick={(e) => setCasesType("recovered")} 
            title="Recovered" 
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox
            onClick={(e) => setCasesType("deaths")} 
            title="Deaths"
            isRed
            active={casesType === "deaths"} 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        <Map 
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Total cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
