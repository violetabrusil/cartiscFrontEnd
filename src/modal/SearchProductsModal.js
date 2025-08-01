import "../Modal.css";
import 'react-toastify/dist/ReactToastify.css';

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from "../dataTable/DataTable";
import SearchBar from "../searchBar/SearchBar";
import apiClient from "../services/apiClient";
import { usePageSizeForTabletLandscape } from "../pagination/UsePageSize";
import { EmptyTable } from "../dataTable/EmptyTable";
import { values } from "lodash";
import { PuffLoader } from "react-spinners";
import useCSSVar from "../hooks/UseCSSVar";
import { showToastOnce } from "../utils/toastUtils";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

export function SearchProductsModal({ onClose,
    onCloseAndSave,
    onProductsSelected,
    selectedProducts = [],
    onProductsUpdated,
    productPrices: initialProductPrices,
    onProductPricesUpdated,
    productQuantities: initialProductQuantities,
    onProductQuantitiesUpdated,
    workOrderId,
}) {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');
    const blackAlpha20 = useCSSVar('--black-alpha-20');

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [productPrices, setProductPrices] = useState(initialProductPrices || {});
    const [productQuantities, setProductQuantities] = useState(initialProductQuantities || {});
    const [isEditing, setIsEditing] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(5, 3);
    const responsivePageSizeProducts = usePageSizeForTabletLandscape(6, 4);
    const [editableTitleProduct, setEditableTitleProduct] = useState('');
    const [editedProducts, setEditedProducts] = useState({});
    const [loading, setLoading] = useState(false);

    const [manualProduct, setManualProduct] = useState({
        title: '',
        price: 0,
        quantity: 1,
    });

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const customSelectModalStyles = {
        control: (base, state) => ({
            ...base,
            width: '400px',
            height: '40px',
            minHeight: '40px',
            border: `1px solid ${blackAlpha34}`,
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box',
            marginRight: '20px',
            marginLeft: '-20px',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: grayMediumDark,
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '400px',
        }),

    };

    // Función para manejar cambios en la cantidad
    const handleQuantityChange = useCallback((sku, newQuantity) => {
        const product = allProducts.find(p => p.sku === sku) || selectedProducts.find(p => p.sku === sku);

        if (!product) return;

        if (newQuantity > product.stock) {
            newQuantity = product.stock;
        } else if (newQuantity <= 0) {
            newQuantity = 1;
        }

        setProductQuantities(prevQuantities => {
            const newQuantities = {
                ...prevQuantities,
                [sku]: newQuantity
            };

            return newQuantities;
        });
    }, [allProducts, selectedProducts]);


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
                                border: `1px solid ${blackAlpha20}`,
                                padding: '4px'
                            }}
                        />
                    );
                }
            },
            { Header: "Título", accessor: "title" },
            { Header: "Categoría", accessor: "category" },
            {
                Header: "Precio (P.U.)",
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

    const columnsProducts = [
        { Header: "Número de serie", accessor: "sku", id: "sku", className: "column-sku" },
        { Header: "Título", accessor: "title", id: "title", className: "column-title" },
        { Header: "Precio (P.U.)", accessor: "price", id: "price", className: "column-price" },
        { Header: "Cantidad", accessor: "quantity", id: "quantity", className: "column-quantity" },
        { Header: "Total", accessor: "total", id: "total", className: "column-total" },
        { Header: "", accessor: "action", id: "action", className: "column-action" },
    ];

    const handleTitleEdit = (e) => {
        const sku = e.target.dataset.sku;
        const newValue = e.target.value;
        setEditableTitleProduct(newValue);

        setEditedProducts((prevEditedProducts) => ({
            ...prevEditedProducts,
            [sku]: newValue,
        }));
    }

    const columnSelectProducts = React.useMemo(
        () => [
            { accessor: "sku", width: '23%' },
            {
                accessor: "title",
                width: '24%',
                Cell: ({ value, row }) => {
                    const currentTitle = row.original.title;

                    return (
                        <div>
                            <input
                                type="text"
                                defaultValue={currentTitle}
                                onBlur={(e) => {
                                    handleTitleEdit(e);
                                }}
                                data-sku={row.original.sku}
                            />
                        </div>

                    );
                },
            },
            {
                accessor: "price",
                width: '28%',
                Cell: ({ value, row }) => {
                    const currentPrice = row.original.price;
                    const handleBlur = (e) => {
                        handleCostChange(row.original.sku, parseFloat(e.target.value.trim()));
                    };

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '47px' }}>
                            <span style={{ margin: '0 5px' }}>$</span>
                            <input
                                type="text"
                                defaultValue={parseFloat(currentPrice).toFixed(2)}
                                onBlur={handleBlur}
                                style={{ width: '70px', fontWeight: '600', textAlign: 'center' }}
                            />
                        </div>
                    );
                },
            },
            {
                accessor: "quantity",
                width: '6%',
                Cell: ({ value, row }) => {
                    const [localQuantity, setLocalQuantity] = useState('1');
                    const sku = row.original.sku;
                    const currentQuantity = productQuantities[sku] || '1';

                    useEffect(() => {
                        setLocalQuantity(currentQuantity);
                    }, [currentQuantity]);

                    const handleLocalChange = (e) => {
                        const newValue = e.target.value;
                        if (newValue === '' || (!isNaN(newValue) && parseInt(newValue, 10) > 0)) {
                            setLocalQuantity(newValue);
                        }
                    };

                    const handleGlobalChange = () => {
                        if (localQuantity === '') {
                            handleQuantityChange(sku, '1');
                            setLocalQuantity('1');
                        } else {
                            handleQuantityChange(sku, localQuantity);
                        }
                    };

                    return (
                        <input
                            key={sku}
                            type="text"
                            value={localQuantity}
                            onChange={handleLocalChange}
                            onBlur={handleGlobalChange}
                            style={{ width: '40px', fontWeight: '600', textAlign: 'center' }}
                            max={row.original.stock}
                            min="1"
                        />
                    );
                },
            },
            {
                accessor: "total",
                width: '14%',
                Cell: ({ row }) => {
                    const { sku, quantity } = row.original;
                    const currentPrice = productPrices[sku] !== undefined ? productPrices[sku] : row.original.price;
                    const total = parseFloat(currentPrice) * parseInt(quantity, 10);

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '45px' }} className="column-total-products">
                            <span style={{ margin: '0 5px' }}>$</span>
                            {parseFloat(total).toFixed(2)}
                        </div>
                    );
                },
            },
            {
                width: '20%',
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-add-product-modal" onClick={() => removeProduct(product)}>
                            <img src={deleteIcon} alt="Add Product Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'delete-product-button',
            },
        ],
        [productQuantities, productPrices]
    );

    const handleCostChange = (productCode, newCost) => {
        console.log("costo del producto", newCost)
        if (isNaN(newCost)) {
            console.error(`Invalid price for product code: ${productCode}`);
            return;
        }
        setProductPrices(prevCost => ({
            ...prevCost,
            [productCode]: newCost,
        }));
    };

    const addProduct = (productToAdd) => {

        if (productToAdd.stock === 0) {
            showToastOnce("warn", "No se puede agregar el producto porque no cuenta con stock.");
            return;
        }

        onProductsSelected((prevProducts) => {
            if (prevProducts.some((p) => p.sku === productToAdd.sku)) {
                showToastOnce("info", "'El producto seleccionado ya se encuentra agregado.");
                return prevProducts; 
            }

            return [productToAdd, ...prevProducts];
        });
    };


    const removeProduct = (productToRemove) => {
        onProductsSelected((prevProducts) => prevProducts.filter((p) => p.sku !== productToRemove.sku));
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
        return new Promise((resolve) => {
            const updatedProducts = selectedProducts.map((product) => {
                const sku = product.sku;
                const editedTitle = editedProducts[sku];
                const title = editedTitle !== undefined ? editedTitle : product.title;
                const price = productPrices[sku] || 0;
                const quantity = productQuantities[sku] || 1;

                return {
                    ...product,
                    title: title,
                    price: price,
                    quantity: quantity,
                };
            });
            setEditedProducts({});
            onProductsUpdated(updatedProducts);
            onProductPricesUpdated(productPrices);
            onProductQuantitiesUpdated(productQuantities);
            resolve(updatedProducts); 
        });
    };

    const saveProducts = async (updatedProducts) => {
        try {
            const payload = {
                work_order_items: updatedProducts.map(product => ({
                    sku: product.sku.startsWith(".MA-") ? "" : product.sku,
                    title: product.title,
                    quantity: parseInt(product.quantity, 10),
                    price: parseFloat(parseFloat(product.price).toFixed(2))
                })),
            };
            await apiClient.post(`work-orders/add-products/${workOrderId}`, payload);
            showToastOnce("success","Productos agregados");
    
        } catch (error) {
            showToastOnce("error","Error al guardar los productos");
        }

    };

    const handleSave = async () => {
        const updatedProducts = await handleConfirmChanges(); 

        if (manualProduct.title.trim() !== '') {
            updatedProducts.push(manualProduct);
        }

        try {
            await saveProducts(updatedProducts); 
            onCloseAndSave(); 
        } catch (error) {}
    };

    const updateProducts = async (updatedProducts) => {

        try {
            const payload = {
                work_order_items: updatedProducts.map(product => ({
                    sku: product.sku.startsWith(".MA-") ? "" : product.sku,
                    title: product.title,
                    quantity: parseInt(product.quantity, 10),
                    price: parseFloat(parseFloat(product.price).toFixed(2))
                })),
            };
            console.log("data a enviar", payload)
            await apiClient.put(`work-orders/update-products/${workOrderId}`, payload);
            showToastOnce("success","Productos actualizados");

        } catch (error) {
             showToastOnce("error","Error al actualizar los productos.");
        }

    };

    const handleUpdate = async () => {
        const updatedProducts = await handleConfirmChanges(); 
        try {
            await updateProducts(updatedProducts); 
            onCloseAndSave(); 
        } catch (error) {}
    };

    const handleSaveUpdateProducts = () => {
        if (isEditing) {
            handleUpdate();
        } else {
            handleSave();
        }
    };

    const fetchData = async () => {

        let endpoint = '/products/all';

        if (searchTerm) {

            if (searchTerm.length < 3) {
                return; 
            }

            const searchTypes = {
                sku: "sku",
                supplier_name: "supplier_name",
                title: "title",
                category: "category",
                brand: "brand",
            };

            if (selectedOption.value in searchTypes) {
                endpoint = `/products/search?search_type=${searchTypes[selectedOption.value]}&criteria=${searchTerm}`;
            }
        }

        try {
            const response = await apiClient.get(endpoint);
            setAllProducts(response.data);
        } catch (error) {

            showToastOnce("error","Error al obtener los datos de los productos.");

        }
    };


    const handleManualProductChange = (field, value) => {
        setManualProduct((prevProduct) => ({
            ...prevProduct,
            [field]: value,
        }));
    };

    const addManualProduct = () => {

        if (manualProduct.title.trim() !== '' && !isNaN(manualProduct.price) && manualProduct.quantity > 0) {
            const updatedProducts = [{ ...manualProduct, sku: `.MA-${Date.now()}` }, ...selectedProducts];

            onProductsSelected(updatedProducts);

            setManualProduct({
                title: '',
                price: 0,
                quantity: 1,
            });
        } else {
          
            showToastOnce("warn","Ingrese valores válidos.");
        }
    };

    useEffect(() => {
        if (!searchTerm || searchTerm.length >= 3) {
            fetchData();
        }
    }, [selectedOption, searchTerm]);

    useEffect(() => {
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
        if (selectedProducts.length > 0) {
            setIsEditing(true);
        }
    }, [selectedProducts]);


    return (

        <div className='filter-modal-overlay'>

            <div style={{ maxWidth: '850px' }} className="modal-payment">
                <div style={{ display: 'flex', marginLeft: '10px', marginBottom: '0px', marginTop: '0px' }}>
                    <h3 style={{ marginBottom: '0px', flex: "1" }}>Productos</h3>

                    <div style={{ display: 'flex' }}>
                        <button style={{ width: '100px', height: '33px', marginTop: '11px', marginRight: '10px' }}
                            className="confirm-button" onClick={handleSaveUpdateProducts}>
                            <span className="text-confirm-button">
                                Guardar
                            </span>
                        </button>

                        <button style={{ marginTop: '14px', marginRight: '13px' }} className="button-close" onClick={onClose}>
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>

                    </div>

                </div>

                <div>
                    <h4 style={{ marginLeft: '10px', marginBottom: '0px' }}>Productos seleccionados</h4>

                    <EmptyTable
                        columns={columnsProducts}
                    />

                    <ManualProductRow
                        manualProduct={manualProduct}
                        onManualProductChange={handleManualProductChange}
                        onAddManualProduct={addManualProduct}
                    />


                    {selectedProducts.length > 0 && (
                        <div className="products-modal-content">

                            <DataTable
                                data={calculatedProducts}
                                columns={columnSelectProducts}
                                highlightRows={false}
                                initialPageSize={responsivePageSize} />
                        </div>
                    )}



                    <div style={{ marginTop: '20px' }}>
                        <SearchBar onFilter={handleFilter} customSelectStyles={customSelectModalStyles} customClasses="div-search-modal" />
                        {loading ? (
                            <div className="spinner-container-products">
                                <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                            </div>
                        ) : (
                            <div>
                                {allProducts.length > 0 && (
                                    <div className="products-modal-content">
                                        <h4 style={{ marginLeft: '10px', marginBottom: '10px' }}>Lista de productos</h4>
                                        <DataTable
                                            data={allProducts}
                                            columns={columns}
                                            highlightRows={false}
                                            initialPageSize={responsivePageSizeProducts} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>



                </div>



            </div>
        </div>

    )
};

// Componente para la fila de ingreso manual
const ManualProductRow = ({ manualProduct, onManualProductChange, onAddManualProduct }) => {

    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0;
        const newPrice = parseFloat(manualProduct.price) || 0;
        const totalPrice = newQuantity * newPrice;
        onManualProductChange('quantity', newQuantity, totalPrice);
    };

    const handlePriceChange = (e) => {
        const newPrice = e.target.value === "" ? "" : parseFloat(e.target.value) || 0;
        const newQuantity = parseInt(manualProduct.quantity, 10) || 0;
        const totalPrice = newQuantity * newPrice;
        onManualProductChange('price', newPrice, totalPrice);
    };

    return (
        <div className="manual-product-row">
            {/* Campos para ingresar manualmente */}
            <input
                type="text"
                value={manualProduct.title}
                onChange={(e) => onManualProductChange('title', e.target.value.toUpperCase())}
                className="manual-product-row-title"
            />
            <div className="dollar-sign-input">
                <span className="dollar-sign-price">$</span>
                <input
                    type="number"
                    value={manualProduct.price === 0 ? "" : manualProduct.price}
                    onChange={handlePriceChange}
                    className="manual-product-row-price"
                />
            </div>
            <input
                type="number"
                value={manualProduct.quantity === 0 ? "" : manualProduct.quantity}
                onChange={handleQuantityChange}
                className="manual-product-row-quantity"
            />
            <div className="manual-product-row-subtotal">
                <span className="dollar-sign-price">$</span>
                {/* Nueva columna para mostrar el valor total sin editar */}
                {parseFloat(manualProduct.price * manualProduct.quantity).toFixed(2)}
            </div>
            {/* Botón de acción */}
            <button className="button-add-product-modal manual-product-row-button " onClick={onAddManualProduct}>
                <img src={addIcon} alt="Add Product Icon" className="add-product-modal-icon " />
            </button>
        </div>
    );
};


export default SearchProductsModal;
