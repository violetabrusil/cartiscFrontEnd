// ServiceForm.jsx
import React, { useEffect } from "react";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

const ServiceForm = ({
    mode = "add",
    title, setTitle,
    totalCost,
    handleOpenModalSearchOperation,
    onBack,
    tableInstance,
    isEditing, setIsEditing,
    onSubmit,
    onDelete,
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        previousPage,
        nextPage,
    } = tableInstance;

    const isReadOnly = mode === "edit" && !isEditing;

    return (
        <div className="container-general">
            <CustomTitleSection
                onBack={() => {
                    if (mode === "edit" && typeof setIsEditing === "function") {
                        setIsEditing(false);
                    }
                    onBack?.();
                }}
                titlePrefix="Panel Servicios"
                title={mode === "add" ? "Nuevo Servicio" : "Información del servicio"}
                onCustomButtonClick={(mode === "add" || (mode === "edit" && isEditing)) ? onSubmit : undefined}
                customButtonLabel={(mode === "add" || (mode === "edit" && isEditing)) ? "GUARDAR" : undefined}
                showCustomButton={(mode === "add" || (mode === "edit" && isEditing))}
                showDeleteIcon={mode === "edit"}
                onDelete={mode === "edit" ? onDelete : undefined}
                showEditIcon={mode === "edit" && !isEditing}
                onEdit={mode === "edit" ? () => setIsEditing(true) : undefined}
            />



            <div className="container-section-service">

                <div className="service-column-title">
                    <span className="section-title">Información General</span>

                    <div className="field-group">
                        <label>Título</label>
                        <input
                            value={title}
                            className="title-service"
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>

                <div className="service-column-price">
                    <span className="section-title">Información financiera</span>

                    <div className="field-group">
                        <label>Precio Total</label>
                        <input
                            type="text"
                            value={`$ ${totalCost.toFixed(2)}`}
                            className="input-total-cost"
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>

            </div>


            <div className="container-operations-service">
                <div className="container-add-operations">
                    <span className="section-title">Operaciones</span>
                    <button
                        className="button-add-operation"
                        style={{ marginRight: "10px", backgroundColor: isEditing ? "var(--second-color" : "var(--gray-dark)" }}
                        onClick={handleOpenModalSearchOperation}
                    >
                        <span className="text-button">
                            Agregar Operación
                        </span>
                    </button>
                </div>

                <div style={{ padding: "1rem" }}>

                    <div className="container-table">
                        <table {...getTableProps()} className="operation-selected-table">
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                                                <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="container-table-buttons">
                            <button
                                style={{ marginRight: "10px", marginBottom: "10px" }}
                                onClick={previousPage}
                                disabled={!canPreviousPage}
                            >
                                Anterior
                            </button>
                            <button
                                style={{ marginLeft: "10px", marginBottom: "10px" }}
                                onClick={nextPage}
                                disabled={!canNextPage}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>

                </div>



            </div>


        </div>
    );
};

export default ServiceForm;
