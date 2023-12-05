import "../../Stock.css";
import React, { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";

const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

const Stock = () => {

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductStock, setSelectedProductStock] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [stockToUpdate, setStockToUpdate] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(8, 6); 

    //Función que permite obtener todos los productos
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {
        setLoading(true);
        //Endpoint por defecto
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
        // Aquí obtienes el stock del producto seleccionado y lo actualizas en el estado
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
                    toast.success('Stock actualizado', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setSelectedProductStock(stockToUpdate);
                    fetchData();

                } else {
                    toast.error('Ha ocurrido un error al actualizar el stock el producto', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }

            } catch (error) {
                toast.error('Error actualizar el stock del producto Por favor, inténtalo de nuevo..', {
                    position: toast.POSITION.TOP_RIGHT
                });
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
            { Header: "Número de serie", accessor: "sku" },
            { Header: "Título", accessor: "title" },
        ],
        []
    );

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);


    return (

        <div className="stock-container">
            <ToastContainer />
            <div className="content-wrapper">
                <SearchBar onFilter={handleFilter} />
                {loading ? (
                    <div className="spinner-container-stock">
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>

                ) : (
                    <DataTable
                        data={allProducts}
                        columns={columns}
                        onRowClick={handleRowClick}
                        highlightRows={true}
                        selectedRowIndex={selectedRowIndex}
                        initialPageSize={responsivePageSize}
                    />
                )
                }

            </div>

            <div className="label-input-container">
                <label>Stock Total</label>
                <input
                    type="number"
                    value={isEditing ? stockToUpdate : selectedProductStock}
                    readOnly={!isEditing}
                    style={{
                        color: (selectedProductStock <= 5 ? 'red' : 'green')
                    }}
                    onChange={e => setStockToUpdate(e.target.value)}
                />
                <button className="stock-button" onClick={handleEditOrSave}>
                    <span className="span-stock-button">
                        {isEditing ? 'Guardar' : 'Editar'}
                    </span>
                </button>
            </div>
        </div>
    )
};

export default Stock;