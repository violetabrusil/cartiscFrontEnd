import React, { useState, useCallback, useEffect } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";
import { showToastOnce } from "../../utils/toastUtils";
import Icon from "../../components/Icons";

const Stock = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const blackAlpha20 = useCSSVar('--black-alpha-20');
    const redIntense = useCSSVar('--red-intense');
    const yellowWarm = useCSSVar('--yellow-warm');
    const greenDark = useCSSVar('--green-dark');

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductStock, setSelectedProductStock] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [stockToUpdate, setStockToUpdate] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(8, 5);

    const currentValue = isEditing ? stockToUpdate : selectedProductStock;
    const numericStock = currentValue !== null && currentValue !== '' ? Number(currentValue) : null;


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
                console.error('La solicitud ha superado el tiempo límite.');
            } else {
                console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
            }
        }
        setLoading(false);
    };

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const handleRowClick = (row, index) => {
        setSelectedProductStock(row.original.stock);
        setSelectedProductId(row.original.id);
        setSelectedRowIndex(index);
    };

    const handleEditOrSave = async (event) => {
        event.preventDefault();
        if (isEditing) {
            const formData = new FormData();
            formData.append('stock', stockToUpdate);
            try {

                const response = await apiClient.put(`/products/update-stock/${selectedProductId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (response.status === 200) {
                    showToastOnce("success", "Stock actualizado.");
                    setSelectedProductStock(stockToUpdate);
                    fetchData();

                }

            } catch (error) {
                showToastOnce("error", "Error al actualizar el stock del producto. Por favor, inténtelo de nuevo.");
            }

        }
        setIsEditing(!isEditing);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Imagen",
                accessor: "product_picture",
                Cell: ({ value }) => {
                    return value ? (
                        <img
                            src={`data:image/jpeg;base64,${value}`}
                            alt="Product"
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '10%',
                                border: `1px solid ${blackAlpha20}`,
                                padding: '4px'
                            }}
                        />
                    ) : (
                        <Icon
                            name="productDefault"
                            className="default-icon-table"
                        />
                    );
                }
            },
            { Header: "Número de serie", accessor: "sku" },
            { Header: "Título", accessor: "title" },
        ],
        []
    );

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    let inputColor;

    if (numericStock === 0) {
        inputColor = redIntense;
    } else if (numericStock > 0 && numericStock <= 5) {
        inputColor = yellowWarm;
    } else {
        inputColor = greenDark;
    }

    return (

        <div className="container-general-information">

            <div className="label-input-container">

                <div className="field-row-location">

                    <div className="field-group-information">
                        <label>Stock Total</label>

                        <div className="input-with-icon">

                            <input
                                type="number"
                                value={isEditing ? stockToUpdate : selectedProductStock}
                                readOnly={!isEditing}
                                style={{
                                    color: inputColor
                                }}
                                onChange={e => setStockToUpdate(e.target.value)}
                            />
                            <Icon name="stock" className="input-product-icon" />
                        </div>
                    </div>

                    <div className="field-group-information">
                        <label>Precio</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                value="$ 50.23"
                                readOnly={!isEditing}
                            />
                            <Icon name="dollar" className="input-product-icon" />
                        </div>
                    </div>

                </div>

                <div className="container-section-button">
                    <button className="stock-button" onClick={handleEditOrSave}>
                        <span className="span-stock-button">
                            {isEditing ? 'Guardar' : 'Editar'}
                        </span>
                    </button>

                </div>

            </div>

            <SearchBar onFilter={handleFilter} />
            {loading ? (
                <div className="spinner-container-stock">
                    <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                </div>

            ) : (
                <div className="container-table-general">
                    <DataTable
                        data={allProducts}
                        columns={columns}
                        onRowClick={handleRowClick}
                        highlightRows={true}
                        selectedRowIndex={selectedRowIndex}
                        initialPageSize={responsivePageSize}
                    />
                </div>
            )
            }

        </div>
    )
};

export default Stock;