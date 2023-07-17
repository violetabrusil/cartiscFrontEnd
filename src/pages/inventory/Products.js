import "../../Products.css";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { useTable, usePagination } from "react-table";
import addProductIcon from "../../images/icons/addIcon.png";
import searchIcon from "../../images/icons/searchIcon.png";
import deleteIcon from "../../images/icons/deleteIcon.png";
import editIcon from "../../images/icons/editIcon.png";

const Products = () => {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showGeneralProducts, setShowGeneralProducts] = useState(true);
    const [showAddProducts, setShowAddProducts] = useState(false);
    const [showEditProducts, setShowEditProducts] = useState(false);

    //Variables para guardar los datos de entrada de producto
    const [serialNumber, setSerialNumber] = useState("");
    const [titleProduct, setTitleProduct] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [row, setRow] = useState("");
    const [column, setColumn] = useState("");

    //Variables para editar un producto
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState({
        serialNumber: "",
        titleProduct: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        row: "",
        column: "",
    });

    const handleOptionsChange = (selectedOption) => {
        setSelectedOption(selectedOption);
    };

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        //Búsqueda de productos
        const delayTimer = setTimeout(() => {
            //Lógica para realizar la búsqueda
            console.log("Select option", selectedOption);
            console.log("Search term", searchTerm);
        }, 500); //Espera 500ms después de la última pulsación de tecla

        return () => clearTimeout(delayTimer); //Limpia el temporizador al desmontarse el componente
    }, [selectedOption, searchTerm]);

    const options = [
        { value: 'numero de serie', label: 'Número de serie' },
        { value: 'titulo', label: 'Título' },
        { value: 'categoria', label: 'Categoría' }
    ];

    const customStyles = {
        control: (base, state) => ({
            ...base,
            width: '550px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box'  // Asegura que el borde y el relleno estén incluidos en el tamaño
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-product',
            // otros estilos personalizados si los necesitas
        }),
        menuPortal: base => ({ ...base, width: '41%', zIndex: 9999 }),

    };

    const data = React.useMemo(
        () => [
            {
                serie: "13413",
                titulo: "Bujía",
                categoria: "-",
                precio: "10.00",
                stock: "3",
                fila: "2",
                columna: "3",
            },
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            { Header: "Número de serie", accessor: "serie" },
            { Header: "Título", accessor: "titulo" },
            { Header: "Categoría", accessor: "categoria" },
            {
                Header: "Precio",
                accessor: "precio",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            { Header: "Stock", accessor: "stock" },
            { Header: "Fila", accessor: "fila" },
            { Header: "Columna", accessor: "columna" },
            {
                Header: "",
                Cell: ({ product }) => (
                    <button className="button-edit-product" onClick={handleEditProducts}>
                        <img src={editIcon} alt="Edit Product Icon" className="edit-product-icon" />
                    </button>
                ),
                id: 'edit-product-button'
            },
            {
                Header: "",
                Cell: ({ row }) => (
                    <button className="button-delete-product" onClick={() => handleDelete(row.original)}>
                        <img src={deleteIcon} alt="Delete Product Icon" className="delete-product-icon" />
                    </button>
                ),
                id: 'delete-product-button'
            }
        ],
        []
    );

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

    const handleDelete = (row) => {
        console.log("Eliminar fila: ", row);
        // Aquí puedes manejar la lógica para eliminar la fila
    };

    const handleEdit = (product) => {

        console.log("Editar fila: ", row);
        setSelectedProduct(product);
        setEditingProduct({ ...product });
        // Aquí puedes manejar la lógica para eliminar la fila
    };

    const handleShowAddProducts = (event) => {
        event.stopPropagation();
        setShowAddProducts(true);
        setShowGeneralProducts(false);
        //setShowEditProducts(false);
    };

    const handleEditProducts = (event) => {
        event.stopPropagation();
        setShowEditProducts(true);
        setShowGeneralProducts(false);
        setShowAddProducts(false);
        handleEdit(products);
    };

    const handleSaveProduct = () => {
        setShowEditProducts(false);
        setShowGeneralProducts(true);
    };

    return (
        <div>

            {showGeneralProducts && (
                <div>
                    <div className="product-container-title">
                        <label>999</label>
                        <span>Productos</span>
                        <button className="add-product-button" onClick={handleShowAddProducts}>
                            <img src={addProductIcon} alt="Add Product Icon" className="add-product-icon" />
                        </button>
                    </div>

                    <form>
                        <div className="search-bar-container">
                            <Select
                                options={options}
                                value={selectedOption}
                                onChange={handleOptionsChange}
                                styles={customStyles}
                                placeholder="Seleccionar"
                                menuPortalTarget={document.body}
                            />

                            <div className="search-products-box">
                                <img src={searchIcon} alt="Search Product Icon" className="search-products-icon" />
                                <input
                                    type="text"
                                    className="input-search-products"
                                    onChange={handleSearchInputChange}
                                    placeholder="Buscar Productos"
                                />
                            </div>
                        </div>

                    </form>

                    <div className="container-table">
                        <table {...getTableProps()}>
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th {...column.getHeaderProps()}>
                                                {column.render('Header')}
                                            </th>
                                        ))}

                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {page.map((row) => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map((cell) => (
                                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            ))}
                                        </tr>
                                    )
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

                </div>
            )}

            {showAddProducts && !showGeneralProducts && !showEditProducts(
                <div>
                    <div className="form-scroll-products">
                        <div className="form-container-products" >

                            <div className="input-group">
                                <label>Número de serie</label>
                                <input type="text"
                                    value={serialNumber}
                                    onChange={e => setSerialNumber(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Título</label>
                                <input type="text"
                                    value={titleProduct}
                                    onChange={e => setTitleProduct(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <input type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Categoría</label>
                                <input type="text"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Precio</label>
                                <input type="text"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Stock</label>
                                <input type="text"
                                    value={stock}
                                    onChange={e => setStock(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Fila</label>
                                <input type="text"
                                    value={row}
                                    onChange={e => setRow(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Columna</label>
                                <input type="text"
                                    value={column}
                                    onChange={e => setColumn(e.target.value)} />
                            </div>

                        </div>
                    </div>

                    <div className="container-button-save-product">
                        <button className="button-save-product">
                            GUARDAR
                        </button>
                    </div>
                </div>
            )}

            {showEditProducts && (
                <div>
                    <div className="form-scroll-products">
                        <div className="form-container-products" >

                            <div className="input-group">
                                <label>Número de serie</label>
                                <input type="text"
                                    value={editingProduct.serialNumber}
                                    onChange={e => setEditingProduct({ ...editingProduct, serialNumber: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Título</label>
                                <input type="text"
                                    value={editingProduct.titleProduct}
                                    onChange={e => setEditingProduct({ ...editingProduct, titleProduct: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <input type="text"
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Categoría</label>
                                <input type="text"
                                    value={editingProduct.category}
                                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Precio</label>
                                <input type="text"
                                    value={editingProduct.price}
                                    onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Stock</label>
                                <input type="text"
                                    value={editingProduct.stock}
                                    onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Fila</label>
                                <input type="text"
                                    value={editingProduct.row}
                                    onChange={e => setEditingProduct({ ...editingProduct, row: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Columna</label>
                                <input type="text"
                                    value={editingProduct.column}
                                    onChange={e => setEditingProduct({ ...editingProduct, column: e.target.value })} />
                            </div>

                        </div>
                    </div>

                    <div className="container-button-save-product">
                        <button className="button-save-product" onClick={handleSaveProduct}>
                            GUARDAR
                        </button>
                    </div>
                </div>

            )}

        </div>

    )

};

export default Products;