import React, { useEffect, useState, useCallback } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { ProductForm } from "./ProductForm";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";
import { showToastOnce } from "../../utils/toastUtils";
import Icon from "../../components/Icons";
import { CustomColorContainer } from "../../customColorContainer/CustomColorContainer";

const addProductIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";

const Products = ({ viewMode, setViewMode, selectedProduct, setSelectedProduct, setShowTabs }) => {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const blackAlpha20 = useCSSVar('--black-alpha-20');
    const redIntense = useCSSVar('--red-intense');
    const brightOrange = useCSSVar('--bright-orange');
    const greenDark = useCSSVar('--green-dark');
    const grayDark = useCSSVar('--gray-dark');
    const blueMediumSoft = useCSSVar('--blue-medium-soft');
    const blueDesaturedDark = useCSSVar('--blue-desatured-dark');

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshCount, setRefreshCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(8, 5);

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const stockColorMap = (stock) => {
        const n = Number(stock);
        if (isNaN(n)) return grayDark;
        if (n === 0) return redIntense;
        if (n >= 1 && n <= 5) return brightOrange;
        if (n > 5) return greenDark;
        return grayDark;
    };

    const columns = React.useMemo(
        () => [
            { Header: "Número de serie", accessor: "sku" },
            {
                Header: "Nombre de Producto",
                accessor: "product",
                Cell: ({ row }) => {
                    const { product_picture, title } = row.original;

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {product_picture ? (
                                <img
                                    src={`data:image/jpeg;base64,${product_picture}`}
                                    alt={title || "Producto"}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '10%',
                                        border: `1px solid ${blackAlpha20}`,
                                        padding: '5px',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <Icon
                                    name="productDefault"
                                    className="default-icon-table"
                                    style={{ width: 20, height: 20, padding: 4 }}
                                />
                            )}

                            <div style={{ alignItems: "center" }}>
                                {title && title !== 'NULL' ? title : '-'}
                            </div>
                        </div>
                    );
                }
            },
            {
                Header: "Categoría",
                accessor: "category",
                Cell: ({ value }) => (
                    <div>
                        {value !== 'NULL' ? value : '-'}
                    </div>
                )
            },
            {
                Header: "Precio",
                accessor: "price",
                Cell: ({ value }) => (
                    <div style={{ fontWeight: "bold", fontSize: "19px" }}>
                        {value !== 'NULL' ? `$ ${parseFloat(value).toFixed(2)}` : '-'}
                    </div>
                )
            },
            {
                Header: "Stock",
                accessor: "stock",
                Cell: ({ value }) => {
                    const displayValue =
                        value === 'NULL' || value === null || isNaN(Number(value)) ? '-' : value;

                    return (
                        <CustomColorContainer
                            value={displayValue}
                            color={stockColorMap}
                        />
                    )
                }

            },
            {
                Header: "Columna",
                accessor: "column",

                Cell: ({ value }) => {
                    const displayValue =
                        value === 'NULL' || value === null ? '-' : value;
                    return (
                        <CustomColorContainer
                            value={displayValue}
                            color={blueMediumSoft}
                        />
                    )
                }
            },
            {
                Header: "Fila",
                accessor: "row",
                Cell: ({ value }) => {
                    const displayValue =
                        value === 'NULL' || value === null || isNaN(Number(value)) ? '-' : value;
                    return (
                        <CustomColorContainer
                            value={displayValue}
                            color={blueDesaturedDark}
                        />
                    )
                }
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <button className="button-edit-product" onClick={(event) => handleEditProducts(event, product)}>
                            <Icon name="eye" className="edit-product-icon" />
                        </button>
                    );
                },
                id: 'edit-product-button'
            },
        ],
        [blackAlpha20]
    );

    const handleShowAddProducts = (event) => {
        event.stopPropagation();
        setViewMode('add');
    };

    const handleEditProducts = (event, product) => {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        setViewMode('edit');
        setSelectedProduct(product);
    };

    const handleNewProduct = () => {
        fetchData();
        setViewMode('general');
        setRefreshCount(refreshCount + 1);

    };

    const handleUpdateProduct = () => {
        fetchData();
        setViewMode('general');

    };

    const handleSuspendProduct = () => {
        fetchData();
        setViewMode('general');
        setRefreshCount(refreshCount + 1);

    };

    //Función que permite obtener todos los productos
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {

        setLoading(true);

        let endpoint = '/products/all';
        const searchPerSku = "sku";
        const searchPerSupplier = "supplier_name";
        const searchPerTitle = "title";
        const searchPerCategory = "category";
        const searchPerBrand = "brand";

        if (searchTerm) {
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
        }
        try {
            const response = await apiClient.get(endpoint);
            setAllProducts(response.data);
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                showToastOnce("error", "La solicitd ha superado el tiempo límite ");
            } else {
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm, refreshCount]);

    useEffect(() => {
        if (setShowTabs) {
            setShowTabs(viewMode === 'general');
        }
    }, [viewMode]);

    return (
        <div className="container-general-information">
            {viewMode === 'general' && (
                <>
                    <div className="container-information-title">

                        <div className="left-title-box">
                            <div className="title-box">
                                <label>{String(allProducts.length).padStart(4, '0')}</label>
                                <span>Items</span>
                            </div>


                        </div>

                        <div className="right-title-box">
                            <button className="add-product-button" onClick={handleShowAddProducts}>
                                <img src={addProductIcon} alt="Add Product Icon" className="add-product-icon" />
                            </button>
                        </div>

                    </div>

                    <SearchBar onFilter={handleFilter} />
                    {loading ? (
                        <div className="spinner-container-general">
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>

                    ) : (
                        <div className="container-table-general">
                            <DataTable data={allProducts} columns={columns} highlightRows={false} initialPageSize={responsivePageSize} />
                        </div>

                    )
                    }

                </>
            )}

            {viewMode === 'add' && (
                <ProductForm
                    mode="add"
                    onSubmit={handleNewProduct}
                    onBack={() => setViewMode('general')}
                    onProductChange={fetchData} />
            )}

            {viewMode === 'edit' && selectedProduct && (
                <ProductForm
                    mode="edit"
                    productData={selectedProduct}
                    onSubmit={handleUpdateProduct}
                    onSuspendSuccess={handleSuspendProduct}
                    onBack={() => setViewMode('general')}
                    onProductChange={fetchData}
                />
            )}

        </div>

    )

};

export default Products;