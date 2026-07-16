import React from 'react';
import "../DataTable.css";
import { useTable, usePagination } from 'react-table';

// Header, fila de ingreso manual y filas de datos viven en la MISMA tabla,
// para que las columnas queden alineadas siempre (mismo <table>, mismas columnas).
export const SelectedItemsTable = ({ columns, data, manualRowCells, initialPageSize = 8 }) => {
    const {
        getTableProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
    } = useTable(
        { columns, data, initialState: { pageIndex: 0, pageSize: initialPageSize } },
        usePagination
    );

    return (
        <div className="selected-items-table">
            <table {...getTableProps()} className="empty-table">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th key={column.id} {...column.getHeaderProps()} className={column.className}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {manualRowCells && (
                        <tr className="empty-table-manual-row">
                            {headerGroups[0].headers.map(column => (
                                <td key={column.id} className={column.className}>
                                    {manualRowCells[column.id] || null}
                                </td>
                            ))}
                        </tr>
                    )}
                    {page.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} className="empty-table-data-row">
                                {row.cells.map(cell => (
                                    <td key={cell.column.id} {...cell.getCellProps()} className={cell.column.className}>
                                        {cell.render('Cell')}
                                    </td>
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
