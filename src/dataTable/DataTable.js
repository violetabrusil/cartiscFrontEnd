import "../DataTable.css"
import React from 'react';
import { useTable, usePagination } from 'react-table';

const DataTable = ({ data, columns, onRowClick = () => {}, highlightRows, selectedRowIndex }) => {

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
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 8 },
        },
        usePagination
    );

    return (
        <div className="container-table">
            <table {...getTableProps()} className="products-table">
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
                    {page.map((row, index) => {
                        prepareRow(row);
                        return (
                            <tr
                                {...row.getRowProps()}
                                onClick={() => onRowClick(row, index)}
                                style={index === selectedRowIndex && highlightRows ? { backgroundColor: '#d1e2f1' } : {}}>
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
