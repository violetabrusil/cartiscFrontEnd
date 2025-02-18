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
    setCurrentPage,// Recibe setCurrentPage como prop
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

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 10;

        for (let i = 1; i <= totalPages; i++) {
            if (i <= maxPagesToShow || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pageNumbers.push(i);
            }
        }

        // Agregar puntos suspensivos si es necesario
        const finalNumbers = [];
        pageNumbers.forEach((number, index) => {
            if (index > 0 && number - pageNumbers[index - 1] > 1) {
                finalNumbers.push('...'); // Puntos suspensivos
            }
            finalNumbers.push(number);
        });

        return finalNumbers.map((number, index) => {
            if (number === '...') {
                return <span key={index} className="ellipsis">{number}</span>;
            }
            return (
                <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            );
        });
    };

    return (
        <div className="container-table-pagination">
            <table {...getTableProps()} className="data-table">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                            {headerGroup.headers.map(column => (
                                <th key={column.id}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} key={row.id}>
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
                    {renderPageNumbers()}
                </div>
                <button onClick={goToNextPage} disabled={!hasNextPage}>
                    Siguiente &gt;
                </button>
            </div>


        </div>
    );
};

export default DataTablePagination;
