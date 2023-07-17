import "../DataTable.css"
import React from 'react';
import { useTable, usePagination } from 'react-table';

const DataTable = ({ data, columns }) => {

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

    return (
        <div className="container-table">
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
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
    );
};

export default DataTable;
