import React from 'react';
import { useTable } from 'react-table';
import "../DataTablePagination.css";

const DataTablePagination = ({
    data,
    columns,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage, // Recibe setCurrentPage como prop
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    });

    return (
        <div className="container-table-pagination">
            <table {...getTableProps()} className="data-table">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th key={column.id}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, index) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td key={cell.column.id}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="container-table-pagination-buttons">
                <button onClick={goToPreviousPage} disabled={!hasPreviousPage}>
                    &lt; Anterior
                </button>
                <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)} // Usa setCurrentPage para cambiar la página
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <button onClick={goToNextPage} disabled={!hasNextPage}>
                    Siguiente &gt;
                </button>
            </div>
        </div>
    );
};

export default DataTablePagination;