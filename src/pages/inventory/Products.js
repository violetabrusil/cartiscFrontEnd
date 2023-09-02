import "../../Products.css";
import React, { useEffect, useState, useCallback } from "react";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { ProductForm } from "./ProductForm";
import { ToastContainer } from "react-toastify";

const addProductIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

const Products = ({ viewMode, setViewMode }) => {

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshCount, setRefreshCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const columns = React.useMemo(
        () => [
            { Header: "Número de serie", accessor: "sku" },
            {
                Header: "Imagen",
                accessor: "product_picture",
                Cell: ({ value }) => {
                    const imageUrl = value ? `data:image/jpeg;base64,${value}` : productIcon;

                    return (
                        <img
                            src={imageUrl}
                            alt="Product"
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '10%',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                padding: '4px'
                            }}
                        />
                    );
                }
            },
            { Header: "Título", accessor: "title" },
            { Header: "Categoría", accessor: "category" },
            {
                Header: "Precio",
                accessor: "price",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        $ {parseFloat(value).toFixed(2)}
                    </div>
            },
            {
                Header: "Stock",
                accessor: "stock",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        {value}
                    </div>

            },
            {
                Header: "Fila",
                accessor: "row",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        {value}
                    </div>
            },
            {
                Header: "Columna",
                accessor: "column",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        {value}
                    </div>
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-edit-product" onClick={(event) => handleEditProducts(event, product)}>
                            <img src={eyeIcon} alt="Edit Product Icon" className="edit-product-icon" />
                        </button>
                    );
                },
                id: 'edit-product-button'
            },
        ],
        []
    );

    const handleShowAddProducts = (event) => {
        event.stopPropagation();
        setViewMode('add');
    };

    const handleEditProducts = (event, product) => {
        console.log("producto enviado", product)
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        setViewMode('edit');
        setSelectedProduct(product);
    };

    const handleNewProduct = () => {
        // Luego, redirige a tu pantalla principal (por ejemplo, ocultando el formulario y mostrando la tabla):
        setViewMode('general');
        setRefreshCount(refreshCount + 1);
        fetchData();
    };

    const handleUpdateProduct = () => {
        setViewMode('general');
        fetchData();
    };

    const handleSuspendProduct = () => {
        setViewMode('general');
        setRefreshCount(refreshCount + 1);
        fetchData();
    };

    //Función que permite obtener todos los productos
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {
        console.log("entro");

        //Endpoint por defecto
        let endpoint = '/products/all';
        const searchPerSku = "sku";
        const searchPerSupplier = "supplier_name";
        const searchPerTitle = "title";
        const searchPerCategory = "category";
        const searchPerBrand = "brand";

        if (searchTerm) {
            console.log(selectedOption);
            switch (selectedOption.value) {

                case 'sku':
                    endpoint = `/products/search?search_type=${searchPerSku}&criteria=${searchTerm}`;

                    break;
                case 'supplier_name':
                    endpoint = `/products/search?search_type=${searchPerSupplier}&criteria=${searchTerm}`;
                    break;
                case 'title':
                    endpoint = `/products/search?search_type=${searchPerTitle}&criteria=${searchTerm}`;
                    break;
                case 'category':
                    endpoint = `/products/search?search_type=${searchPerCategory}&criteria=${searchTerm}`;
                    break;
                case 'brand':
                    endpoint = `/products/search?search_type=${searchPerBrand}&criteria=${searchTerm}`;
                    break;
                default:
                    break;
            }
            console.log("Using endpoint:", endpoint);
        }
        try {
            console.log("Endpoint to fetch:", endpoint);
            const response = await apiClient.get(endpoint);
            console.log("Respuesta del servidor:", response.data);
            setAllProducts(response.data);
        } catch (error) {
            console.log("Error al obtener los datos de los servicios");
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm, refreshCount]);

    return (
        <div style={{ marginTop: '-18px' }}>
            <ToastContainer />

            {viewMode === 'general' && (
                <div>
                    <div className="product-container-title">
                        <label>{String(allProducts.length).padStart(4, '0')}</label>
                        <span>Productos</span>
                        <button className="add-product-button" onClick={handleShowAddProducts}>
                            <img src={addProductIcon} alt="Add Product Icon" className="add-product-icon" />
                        </button>
                    </div>

                    <SearchBar onFilter={handleFilter} />

                    <DataTable data={allProducts} columns={columns} highlightRows={false} />

                </div>
            )}

            {viewMode === 'add' && (
                <ProductForm mode="add" onSubmit={handleNewProduct} />
            )}

            {viewMode === 'edit' && (
                <ProductForm mode="edit" productData={selectedProduct} onSubmit={handleUpdateProduct} onSuspendSuccess={handleSuspendProduct} />
            )}

        </div>

    )

};

export default Products;