import React from 'react';
import './Table.css';
import numeral from "numeral";

function Table({ countries }) {
    return (
        <div className="table">
            {countries.map(({country, cases, countryInfo}) => (
                <tr>
                    <td>
                        <div className="table__flag">
                            <img src={countryInfo.flag } style={{height:"20px",width:"30px"}} alt="flag"/>
                        </div>
                    </td>
                    <td>{country}</td>
                    <td><strong>{numeral(cases).format("0,0")}</strong></td>
                </tr>
            ))}
        </div>
    );
}

export default Table
