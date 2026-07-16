import React from 'react';
import "../DataTable.css"
import { useTable } from 'react-table';


export const EmptyTable = ({ columns, manualRowCells }) => {
    const { getTableProps, headerGroups } = useTable({ columns, data: [] });

    return (
        <table {...getTableProps()} className="empty-table">
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                key={column.id}
                                {...column.getHeaderProps()}
                                className={column.className} // Agrega la clase de la columna
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            {manualRowCells && (
                <tbody>
                    <tr className="empty-table-manual-row">
                        {headerGroups[0].headers.map(column => (
                            <td key={column.id} className={column.className}>
                                {manualRowCells[column.id] || null}
                            </td>
                        ))}
                    </tr>
                </tbody>
            )}
        </table>
    );
};
