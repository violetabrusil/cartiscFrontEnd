import "../Modal.css";

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from "../dataTable/DataTable";
import SearchBar from "../searchBar/SearchBar";
import apiClient from "../services/apiClient";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

export function SearchProductsModal({ onClose,
    onProductsSelected,
    selectedProducts = [],
    onProductsUpdated,
    productPrices: initialProductPrices,
    onProductPricesUpdated,
    productQuantities: initialProductQuantities,
    onProductQuantitiesUpdated,
}) {

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [productPrices, setProductPrices] = useState(initialProductPrices || {});
    const [productQuantities, setProductQuantities] = useState(initialProductQuantities || {});
    
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
        if (isNaN(newPrice)) {
            console.error(`Invalid price for SKU: ${productSku}`);
            return;
        }
        console.log(`Changing price for SKU: ${productSku} to ${newPrice}`);
        setProductPrices(prevPrices => ({
            ...prevPrices,
            [productSku]: newPrice,
        }));
    };

    // Función para manejar cambios en la cantidad
    const handleQuantityChange = useCallback((sku, newQuantity) => {
        console.log(`Inicio de handleQuantityChange con SKU: ${sku} y Cantidad: ${newQuantity}`);
        console.log('allProducts:', allProducts);
        const product = allProducts.find(p => p.sku === sku) || selectedProducts.find(p => p.sku === sku);
        console.log('Producto encontrado:', product);
    
        if (!product) return;
    
        if (newQuantity > product.stock) {
            newQuantity = product.stock;
        } else if (newQuantity <= 0) {
            newQuantity = 1;
        }
    
        const originalUnitPrice = product.price;
    
        const updatedPrice = originalUnitPrice * newQuantity;
    
        console.log('Actualizando precios y cantidades...');
    
        setProductPrices(prevPrices => {
            console.log('Precio anterior:', prevPrices);
            const newPrices = {
                ...prevPrices,
                [sku]: updatedPrice
            };
            console.log('Nuevo precio:', newPrices);
            return newPrices;
        });
    
        setProductQuantities(prevQuantities => {
            console.log('Cantidad anterior:', prevQuantities);
            const newQuantities = {
                ...prevQuantities,
                [sku]: newQuantity
            };
            console.log('Nueva cantidad:', newQuantities);
            return newQuantities;
        });
    }, [allProducts]); // allProducts es la dependencia
    
   
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
                    const currentPrice = productPrices[sku] !== undefined ? productPrices[sku] : value;

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '40px' }}>
                            <span style={{ margin: '0 5px' }}>$</span>
                            <input
                                type="number"
                                value={currentPrice}
                                onChange={(e) => {
                                    handlePriceChange(sku, parseFloat(e.target.value));
                                }}
                                onBlur={() => {
                                    console.log("Actualizando precio para SKU:", sku, "con valor:", currentPrice);
                                }}
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
                    const currentQuantity = productQuantities[sku] || 1;
                
                    return (
                        <input
                            type="number"
                            value={currentQuantity}
                            onChange={(e) => {
                                const newValue = parseInt(e.target.value, 10);
                                handleQuantityChange(sku, newValue);
                            }}
                            style={{ width: '30px', fontWeight: '600', textAlign: 'center' }}
                            max={row.original.stock}
                            min="1"
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
        [productQuantities, productPrices]
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
        const updatedProducts = selectedProducts.map((product) => {
            const sku = product.sku;
            const price = productPrices[sku] || product.price;
            const quantity = productQuantities[sku] || 1;

            console.log(`SKU: ${sku}, Unit Price: ${price}, Quantity: ${quantity}, Total Price: ${price * quantity}`);

            return {
                ...product,
                price: price,
                quantity: quantity,
            };
        });
        onProductsUpdated(updatedProducts);
        onProductPricesUpdated(productPrices);
        onProductQuantitiesUpdated(productQuantities)
        onClose();
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
            const data = response.data.map(product => ({
                ...product,
                price: parseFloat(product.price),
            }));
            setAllProducts(data);
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

    useEffect(() => {
        const initialPrices = {};
        const initialQuantities = {};
        selectedProducts.forEach(product => {
            initialPrices[product.sku] = product.price;
            initialQuantities[product.sku] = product.quantity;
        });
        setProductPrices(initialPrices);
        setProductQuantities(initialQuantities);
    }, [selectedProducts]);

    useEffect(() => {
        console.log('Componente renderizado');
    });

    return (

        <div className='filter-modal-overlay'>
            <div style={{ maxWidth: '850px' }} className="modal-payment">
                <div style={{ display: 'flex', marginLeft: '10px', marginBottom: '0px', marginTop: '0px' }}>
                    <h3 style={{ marginBottom: '0px', flex: "1" }}>Productos</h3>
                    {selectedProducts.length > 0 ? (
                        // Si hay productos seleccionados, muestra el botón "Guardar"
                        <button style={{ width: '100px', height: '33px', marginTop: '11px', marginRight: '10px' }}
                            className="confirm-button" onClick={handleConfirmChanges}>
                            <span className="text-confirm-button">
                                Guardar
                            </span>
                        </button>
                    ) : (
                        // Si no hay productos seleccionados, muestra el botón "X" (cerrar)
                        <button style={{ marginTop: '14px', marginRight: '13px' }} className="button-close" onClick={onClose}>
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    )}

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