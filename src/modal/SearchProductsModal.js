import "../Modal.css";

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from "../dataTable/DataTable";
import SearchBar from "../searchBar/SearchBar";
import apiClient from "../services/apiClient";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

export function SearchProductsModal({ onClose, onProductsSelected, selectedProducts = [], onProductsUpdated }) {

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [productPrices, setProductPrices] = useState({});
    const [productQuantities, setProductQuantities] = useState({});

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const customSelectModalStyles = {
        control: (base, state) => ({
            ...base,
            width: '400px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box',
            marginRight: '20px',
            marginLeft: '-20px',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '400px', // puedes ajustar el ancho del menú aquí
        }),

    };

    // Función para manejar cambios en el precio
    const handlePriceChange = (productSku, newPrice) => {
        if (newPrice === "" || newPrice <= 0) {
            newPrice = allProducts.find(p => p.sku === productSku).price;
        }
        setProductPrices(prevPrices => ({
            ...prevPrices,
            [productSku]: parseFloat(newPrice),
        }));
    };

    // Función para manejar cambios en la cantidad
    const handleQuantityChange = (sku, newQuantity) => {
        const product = allProducts.find(p => p.sku === sku);
        if (!product) return;
        
        const unitPrice = productPrices[sku] ? productPrices[sku] / productQuantities[sku] : product.price;
        if (newQuantity > product.stock) {
            newQuantity = product.stock;
        } else if (newQuantity <= 0) {
            newQuantity = 1; // Restablecer a 1 si alguien introduce una cantidad <= 0
        }
        
        const updatedPrice = unitPrice * newQuantity;
    
        setProductPrices(prevPrices => ({
            ...prevPrices,
            [sku]: updatedPrice
        }));
    
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [sku]: newQuantity
        }));
    };
      
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
                                width: '13px',
                                height: '13px',
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
                    <div>
                        $ {parseFloat(value).toFixed(2)}
                    </div>
            },
            {
                Header: "Stock",
                accessor: "stock",
                Cell: ({ value }) =>
                    <div>
                        {value}
                    </div>

            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-add-product-modal" onClick={() => addProduct(product)} >
                            <img src={addIcon} alt="Add Product Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'add-product-button'
            },
        ],
        []
    );

    const columnSelectProducts = React.useMemo(
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
                                width: '13px',
                                height: '13px',
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
                Cell: ({ value, row }) => {
                    const sku = row.original.sku;

                    // Función auxiliar para obtener un precio formateado.
                    const getFormattedPrice = (price) => {
                        const priceNum = parseFloat(price); // Convertir el precio a un número.
                        if (!isNaN(priceNum)) { // Si es un número válido.
                            return priceNum.toFixed(2);
                        }
                        // Si no es un número válido, devolver un valor predeterminado o manejar el error.
                        return "0.00";
                    };

                    const initialPrice = productPrices[sku] ? getFormattedPrice(productPrices[sku]) : getFormattedPrice(value);
                    const [localPrice, setLocalPrice] = useState(initialPrice);

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '40px' }}>
                            <span style={{ margin: '0 5px' }}>$</span>
                            <input
                                type="number"
                                value={localPrice}
                                onChange={(e) => setLocalPrice(e.target.value)}
                                onBlur={() => handlePriceChange(sku, parseFloat(localPrice))}
                                style={{ width: '60px', fontWeight: '600' }}
                            />
                        </div>
                    );
                }
            },
            {
                Header: "Cantidad",
                accessor: "quantity",
                Cell: ({ value, row }) => {
                    const sku = row.original.sku;
                    const [localQuantity, setLocalQuantity] = useState(productQuantities[sku] !== undefined ? productQuantities[sku] : 1);
                    return (
                        <input
                            type="number"
                            value={localQuantity}
                            onChange={(e) => {
                                const newQuantity = e.target.value;
                                setLocalQuantity(newQuantity);
                                handleQuantityChange(sku, newQuantity);
                            }}
                            style={{ width: '30px', fontWeight: '600', textAlign: 'center' }}
                            max={row.original.stock}  // Establece el stock como el valor máximo
                            min="0"
                        />
                    );
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-add-product-modal" onClick={() => removeProduct(product)}>
                            <img src={deleteIcon} alt="Add Product Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'add-product-button'
            },
        ],
        [productQuantities]
    );

    const addProduct = (productToAdd) => {
        onProductsSelected(prevProducts => {
            if (prevProducts.some(p => p.sku === productToAdd.sku)) {
                return prevProducts; // retornar el mismo array si el producto ya está presente
            }
            return [...prevProducts, productToAdd];
        });
    };

    const removeProduct = (productToRemove) => {
        onProductsSelected(prevProducts => prevProducts.filter(p => p.sku !== productToRemove.sku));
    };

    const calculatedProducts = selectedProducts.map(product => {
        const price = productPrices[product.sku] !== undefined ? productPrices[product.sku] : product.price;
        const quantity = productQuantities[product.sku] !== undefined ? productQuantities[product.sku] : 1;
        return {
            ...product,
            price: price,
            quantity: quantity,
        };
    });

    const handleConfirmChanges = () => {
        // Puedes procesar o transformar los datos si es necesario
        // Por ejemplo, aquí podrías aplicar los cambios a selectedProducts
        const updatedProducts = selectedProducts.map((product) => {
            const sku = product.sku;
            const price = productPrices[sku] || product.price;
            const quantity = productQuantities[sku] || 1;
            return {
                ...product,
                price: price,
                quantity: quantity,
            };
        });

        // Luego, puedes actualizar selectedProducts o llamar a una función externa
        onProductsUpdated(updatedProducts);
    };

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
            console.log("Error al obtener los datos de los productos", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    useEffect(() => {
        console.log("Actualización de selectedProducts:", selectedProducts);
    }, [selectedProducts]);


    return (

        <div className='filter-modal-overlay'>
            <div style={{ maxWidth: '850px' }} className="modal-payment">
                <div style={{ display: 'flex', marginLeft: '10px', marginBottom: '0px', marginTop: '0px' }}>
                    <h3 style={{ marginBottom: '0px' }}>Productos</h3>
                    <div style={{ flex: "1", marginTop: '18px', marginRight: '10px' }}>
                        <button className="button-close" onClick={() => { onClose(); handleConfirmChanges(); }} >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>
                </div>

                <div>

                    {selectedProducts.length > 0 && (
                        <div className="products-modal-content">
                            <h4 style={{ marginLeft: '10px', marginBottom: '0px' }}>Productos seleccionados</h4>
                            <DataTable
                                data={calculatedProducts}
                                columns={columnSelectProducts}
                                highlightRows={false}
                                initialPageSize={5} />
                        </div>
                    )}
                    <div style={{ marginTop: '20px' }}>
                        <SearchBar onFilter={handleFilter} customSelectStyles={customSelectModalStyles} customClasses="div-search-modal" />
                    </div>

                    {allProducts.length > 0 && (
                        <div className="products-modal-content">
                            <h4 style={{ marginLeft: '10px', marginBottom: '10px' }}>Lista de productos</h4>
                            <DataTable
                                data={allProducts}
                                columns={columns}
                                highlightRows={false}
                                initialPageSize={6} />
                        </div>
                    )}

                </div>

            </div>
        </div>

    )
};

export default SearchProductsModal;
