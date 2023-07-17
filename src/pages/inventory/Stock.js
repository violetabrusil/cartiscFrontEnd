import "../../Stock.css";
import React from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";

const Stock = () => {

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

        <div className="stock-container">
            <div>
                <SearchBar onFilter={handleFilter} />
                <DataTable data={data} columns={columns} />
            </div>

            <div className="label-input-container">
                <label>Stock Total</label>
                <input type="text" />
            </div>
        </div>
    )
};

export default Stock;