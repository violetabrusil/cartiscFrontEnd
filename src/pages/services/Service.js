import "../../Service.css";
import "../../Modal.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import { useTable, usePagination } from "react-table";

const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";

const Services = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [showButtons, setShowButtons] = useState(true);
    const [showAddService, setShowAddService] = useState(false);
    const navigate = useNavigate();

    const handleSearchServiceChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        // Aquí puedes hacer cualquier otra lógica que necesites cuando cambie el término de búsqueda
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = () => {
        // Aquí se puede manejar la opción seleccionada.
        console.log(selectedOption);

        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleAddService = (event) => {
        event.stopPropagation();
        setShowAddService(true);
        setShowButtons(false);
    };

    const data = React.useMemo(
        () => [
            {
                codigo: "1",
                titulo: "Encerar",
                costo: "20.00",
            },
            // ... otros datos
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            { Header: "Código", accessor: "codigo" },
            { Header: "Título", accessor: "titulo" },
            {
                Header: "Costo",
                accessor: "costo",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            {
                Header: "",
                Cell: ({ row }) => (
                    <button className="button-delete-operation" onClick={() => handleDelete(row.original)}>
                        <img src={deleteIcon} alt="Delete Operation Icon" className="delete-icon" />
                    </button>
                ),
                id: 'delete-button'
            }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
    } = useTable({ columns, data }, usePagination);

    const handleDelete = (row) => {
        console.log("Eliminar fila: ", row);
        // Aquí puedes manejar la lógica para eliminar la fila
    };

    const handleAddOperation = () => {
        navigate("/services/operations");
    }


    return (
        <div>
             <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} />
            <Menu />

            <div className="container-services">
                <div className="left-section">
                    {/*Título del contenedor con buscador */}
                    <TitleAndSearchBox
                        title="Servicios"
                        onSearchChange={handleSearchServiceChange}
                        onButtonClick={openFilterModal}
                    />
                </div>
                <div className="right-section">
                    {showButtons && (
                        <div className="container-add-service">
                            <button className="button-add" style={{ marginRight: "10px" }} onClick={handleAddService} >
                                <span className="text-button">AGREGAR SERVICIO</span>
                            </button>
                            <button className="button-add" style={{ marginLeft: "10px" }} onClick={handleAddOperation}>
                                <span className="text-button">AGREGAR OPERACIÓN</span>
                            </button>
                        </div>

                    )}


                    {/*Contenedor para agregar servicio */}

                    {showAddService && (
                        <div className="container-general">
                            <div className="container-title-add-service">
                                <h2>Agregar Servicio</h2>
                            </div>

                            <div className="container-new-service">
                                <div className="row">
                                    <label>Título</label>
                                    <input style={{ marginLeft: "100px" }}></input>
                                </div>

                                <div className="row">
                                    <label>Costo Total</label>
                                    <input style={{ marginLeft: "50px" }}></input>
                                </div>

                            </div>

                            <div className="container-title-add-service">
                                <h2>Operaciones</h2>
                            </div>

                            <div style={{ backgroundColor: 'white' }}>
                                <table {...getTableProps()}>
                                    <thead>
                                        {headerGroups.map((headerGroup) => (
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map((column) => (
                                                    <th {...column.getHeaderProps()}>
                                                        {column.render('Header')}
                                                    </th>
                                                ))}

                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map((cell) => (
                                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                    ))}
                                                </tr>
                                            )
                                        })}

                                    </tbody>

                                </table>

                                <div className="container-table-buttons">
                                    <button style={{ marginRight: "10px", marginBottom: "10px" }} onClick={() => previousPage()} disabled={!canPreviousPage}>
                                        Anterior
                                    </button>
                                    <button style={{ marginLeft: "10px", marginBottom: "10px" }} onClick={() => nextPage()} disabled={!canNextPage}>
                                        Siguiente
                                    </button>

                                </div>



                            </div>

                            <div className="container-buttons">
                                <button className="button-add-operation" style={{ marginRight: "10px" }} onClick={handleAddOperation} >
                                    <span className="text-button">Agregar Operación</span>
                                </button>
                                <button className="button-add-operation" style={{ marginLeft: "10px" }}>
                                    <span className="text-button">Aceptar</span>
                                </button>

                            </div>

                        </div>

                    )}

                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Título', 'Nombre', 'Código']}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}


        </div>
    )

};

export default Services;
