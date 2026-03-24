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
    setCurrentPage,
    onPageChange,
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

        const finalNumbers = [];
        pageNumbers.forEach((number, index) => {
            if (index > 0 && number - pageNumbers[index - 1] > 1) {
                finalNumbers.push('...');
            }
            finalNumbers.push(number);
        });

        return finalNumbers.map((number, index) => {
            if (number === '...') {
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
