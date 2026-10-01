import { useTable } from 'react-table';
import { getPageItems, useResponsiveMaxSlots, ELLIPSIS } from "../pagination/getPageItems";
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
    setCurrentPage,
    onPageChange,
    maxSlots = 10,
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

    const slots = useResponsiveMaxSlots(maxSlots);

    const renderPageNumbers = () => {
        return getPageItems(currentPage, totalPages, slots).map((number, index) => {
            if (number === ELLIPSIS) {
                return <span key={`ellipsis-${index}`} className="ellipsis">{number}</span>;
            }
            return (
                <button
                    key={number}
                    onClick={() => {
                        setCurrentPage(number);
                        if (onPageChange) onPageChange(number);
                    }}
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
                    {headerGroups.map((headerGroup, i) => (
                        <tr key={`header-${i}`}>
                            {headerGroup.headers.map((column, j) => (
                                <th key={`col-${j}`}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr key={`row-${i}`}>
                                {row.cells.map((cell, j) => (
                                    <td key={`cell-${i}-${j}`}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {totalPages > 0 && (
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
            )
            }

        </div>
    );
};

export default DataTablePagination;
