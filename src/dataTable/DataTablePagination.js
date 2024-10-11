import "../DataTablePagination.css";
import React from 'react';
import { useTable } from 'react-table';

const DataTablePagination = ({
    data,
    columns,
    onRowClick = () => { },
    highlightRows,
    selectedRowIndex,
    selectedRowId,
    customFontSize = false,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    totalPages,
    setCurrentCursor,
    pageSize,
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
        }
    );

    const goToPage = (pageNumber) => {
        setCurrentCursor((pageNumber - 1) * pageSize + 1);
    };

    return (
        <div className="container-table-pagination">
            <table {...getTableProps()} className={`data-table ${customFontSize ? 'custom-font-size' : ''}`}>
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

                        let isHighlighted = false;

                        if (selectedRowId !== undefined) {
                            isHighlighted = row.original.id === selectedRowId;
                        } else if (selectedRowIndex !== undefined) {
                            isHighlighted = index === selectedRowIndex;
                        }

                        return (
                            <tr
                                {...row.getRowProps()}
                                onClick={() => onRowClick(row, index)}
                                style={isHighlighted ? { backgroundColor: '#d1e2f1' } : {}}
                            >
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
                            onClick={() => goToPage(index + 1)}
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