import "../DataTable.css"
import React from 'react';
import { useTable, usePagination } from 'react-table';


const DataTable = ({
    data,
    columns,
    onRowClick = () => { },
    highlightRows,
    selectedRowIndex,
    initialPageSize = 8,
    selectedRowId,
    customFontSize = false,
    onAddOperation,
    onRemoveOperation,
    addIconSrc,
    deleteIconSrc
}) => {

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
            initialState: { pageIndex: 0, pageSize: initialPageSize },
        },
        usePagination
    );

    return (
        <div className="container-table">
            <table {...getTableProps()} className={`products-table ${customFontSize ? 'custom-font-size' : ''}`}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                               <th {...column.getHeaderProps()} style={{ width: column.width }}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, index) => {
                        prepareRow(row);

                        let isHighlighted = false;

                        // Si el selectedRowId se ha proporcionado, usarlo para determinar el resaltado
                        if (selectedRowId !== undefined) {
                            isHighlighted = row.original.id === selectedRowId;
                        }
                        // De lo contrario, usar el selectedRowIndex
                        else if (selectedRowIndex !== undefined) {
                            isHighlighted = index === selectedRowIndex;
                        }

                        return (
                            <tr
                                {...row.getRowProps()}
                                onClick={() => onRowClick(row, index)}
                                style={isHighlighted ? { backgroundColor: '#d1e2f1' } : {}}
                            >
                                {row.cells.map(cell => {
                                    if (cell.column.id === 'action') {
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {addIconSrc && (
                                                    <img
                                                        className="add-operation-icon"
                                                        src={addIconSrc}
                                                        alt="Add operation"
                                                        onClick={() => onAddOperation(row.original)}
                                                    />
                                                )}
                                                {deleteIconSrc && (
                                                    <img
                                                        className="less-operation-icon"
                                                        src={deleteIconSrc}
                                                        alt="Delete operation"
                                                        onClick={() => onRemoveOperation(row.original.id)}
                                                    />
                                                )}
                                            </td>
                                        );
                                    } else {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                    }
                                })}
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
