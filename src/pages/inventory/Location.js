import "../../Location.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import { selectStyles } from "../../styles/selectStyles";

const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

const customStyles = {
    ...selectStyles,
    control: (base, state) => ({
        ...selectStyles.control(base, state),
        width: '300px',
        border: '1.5px solid rgba(0,0,0,0.35)'
    }),
    menu: (base, state) => ({
        ...selectStyles.menu(base, state),
        width: '300px'
    })
};

const Location = () => {

    const PRODUCTS_PAGE_SIZE = 500;

    const [allProducts, setAllProducts] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedProductRow, setSelectedProductRow] = useState("");
    const [selectedProductColumn, setSelectedProductColumn] = useState("");
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [rowUpdate, setRowUpdate] = useState(null);
    const [columnUpdate, setColumnUpdate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tablePage, setTablePage] = useState(0);
    const [resetPageToken, setResetPageToken] = useState(0);
    const responsivePageSize = usePageSizeForTabletLandscape(8, 4, 13);

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const handleRowProductClick = (row, index) => {
        setSelectedProductId(row.original.id);
        setSelectedProductRow(row.original.row);
        setSelectedProductColumn(row.original.column);
        setSelectedRowIndex(index);
        setRowUpdate(null);
        setColumnUpdate(null);
    };

    const handleEditOrSave = async (event) => {
        event.preventDefault();
    
        if (isEditing) {
            const formData = new FormData();
    
         
            if (rowUpdate !== null) {
                formData.append('row', rowUpdate);
            } else {
                formData.append('row', selectedProductRow); 
            }
    
            if (columnUpdate !== null) {
                formData.append('column', columnUpdate);
            } else {
                formData.append('column', selectedProductColumn); 
            }
    
            console.log("datos a enviar", rowUpdate, columnUpdate);
    
            try {
                const response = await apiClient.put(`/products/update-location/${selectedProductId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                if (response.status === 200) {
                    toast.success('Ubicación actualizada', {
                        position: toast.POSITION.TOP_RIGHT
                    });
    
            
                    if (rowUpdate !== null) {
                        setSelectedProductRow(rowUpdate);
                    }
    
                    if (columnUpdate !== null) {
                        setSelectedProductColumn(columnUpdate);
                    }
    
                    fetchData();
                } else {
                    toast.error('Ha ocurrido un error al actualizar la ubicación del producto', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
    
            } catch (error) {
                console.log("error ubicacion", error)
                toast.error('Error al actualizar la ubicación del producto. Por favor, inténtalo de nuevo..', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
    
            setRowUpdate(null);
            setColumnUpdate(null);
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



    const fetchData = async () => {
        setLoading(true);
        let endpoint = `/products/list/1/${PRODUCTS_PAGE_SIZE}`;
        const searchPerSku = "sku";
        const searchPerSupplier = "supplier_name";
        const searchPerTitle = "title";
        const searchPerCategory = "category";
        const searchPerBrand = "brand";

        if (searchTerm && searchTerm.trim().length >= 3) {
            const criteria = encodeURIComponent(searchTerm);
            switch (selectedOption.value) {

                case 'sku':
                    endpoint = `/products/search/1/${PRODUCTS_PAGE_SIZE}?search_type=${searchPerSku}&criteria=${criteria}`;

                    break;
                case 'supplier_name':
                    endpoint = `/products/search/1/${PRODUCTS_PAGE_SIZE}?search_type=${searchPerSupplier}&criteria=${criteria}`;
                    break;
                case 'title':
                    endpoint = `/products/search/1/${PRODUCTS_PAGE_SIZE}?search_type=${searchPerTitle}&criteria=${criteria}`;
                    break;
                case 'category':
                    endpoint = `/products/search/1/${PRODUCTS_PAGE_SIZE}?search_type=${searchPerCategory}&criteria=${criteria}`;
                    break;
                case 'brand':
                    endpoint = `/products/search/1/${PRODUCTS_PAGE_SIZE}?search_type=${searchPerBrand}&criteria=${criteria}`;
                    break;
                default:
                    break;
            }
        }
        try {
            const response = await apiClient.get(endpoint);
            setAllProducts(response.data.values || []);
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('La solicitud ha superado el tiempo límite.');
            } else {
                console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    useEffect(() => {
        setResetPageToken(prev => prev + 1);
    }, [selectedOption, searchTerm]);

    return (

        <div className="location-container">
            <ToastContainer />
            <div className="content-location-wrapper">
                <SearchBar onFilter={handleFilter} customSelectStyles={customStyles} classNameSuffix="inventory"/>
                {loading ? (
                    <div className="spinner-container-products ">
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>

                ) : (
                    <DataTable
                        data={allProducts}
                        columns={columns}
                        onRowClick={handleRowProductClick}
                        highlightRows={true}
                        selectedRowIndex={selectedRowIndex}
                        initialPageSize={responsivePageSize}
                        initialPageIndex={tablePage}
                        onPageChange={setTablePage}
                        resetPageToken={resetPageToken} />
                )
                }

            </div>

            <div className="input-location-container">
                <div className="label-input-location-container">
                    <label>Columna</label>
                    <input
                        type="text"
                        style={{ color: "#5a98cb" }}
                        value={(isEditing ? columnUpdate : selectedProductRow) === "NULL" ? "-" : (isEditing ? columnUpdate : selectedProductColumn)}
                        readOnly={!isEditing}
                        onChange={e => setColumnUpdate(e.target.value)}
                    />

                </div>

                <div className="label-input-location-container">
                    <label>Fila</label>
                    <input
                        type="text"
                        style={{ color: "#255177" }}
                        value={(isEditing ? rowUpdate : selectedProductRow) === "NULL" ? "-" : (isEditing ? rowUpdate : selectedProductRow)}
                        readOnly={!isEditing}
                        onChange={e => setRowUpdate(e.target.value)}
                    />


                    <button className="location-button" onClick={handleEditOrSave}>
                        <span className="span-location-button">
                            {isEditing ? 'Guardar' : 'Editar'}
                        </span>
                    </button>
                </div>
            </div>


        </div>

    )
};

export default Location;