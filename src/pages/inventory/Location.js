import "../../Location.css";
import React from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";

const Location = () => {

    const handleFilter = (selectedOption, searchTerm) => {
        console.log("Selected option", selectedOption);
        console.log("Search term", searchTerm);
        // Aquí puedes manejar la lógica del filtro
    };

    const data = React.useMemo(
        () => [
            {
                serie: "13413",
                titulo: "Bujía",
            },
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            { Header: "Número de serie", accessor: "serie" },
            { Header: "Título", accessor: "titulo" },
        ],
        []
    );

    return (

        <div className="location-container">
            <div>
                <SearchBar onFilter={handleFilter} />
                <DataTable data={data} columns={columns} />
            </div>

            <div className="input-location-container">
                <div className="label-input-location-container">
                    <label>Fila</label>
                    <input type="text" />
                </div>

                <div className="label-input-location-container">
                    <label>Columna</label>
                    <input type="text" />
                </div>
            </div>
        </div>
    )
};

export default Location;