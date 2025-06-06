import "../../Location.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";

const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

const Location = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const blueMediumSoft = useCSSVar('--blue-medium-soft');
    const blueDesaturedDark = useCSSVar('--blue-desatured-dark');
    const blackAlpha20 = useCSSVar('--black-alpha-20');

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
    const responsivePageSize = usePageSizeForTabletLandscape(8, 5);

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const handleRowProductClick = (row, index) => {
        // Se obtiene la fila y la columna de  producto seleccionado y se lo actualiza 
        setSelectedProductId(row.original.id);
        setSelectedProductRow(row.original.row);
        setSelectedProductColumn(row.original.column);
        setSelectedRowIndex(index);
        // Restablecer los valores de edición
        setRowUpdate(null);
        setColumnUpdate(null);
    };

    const handleEditOrSave = async (event) => {
        event.preventDefault();
    
        if (isEditing) {
            const formData = new FormData();
    
            // Añadir a formData solo si hay cambios
            if (rowUpdate !== null) {
                formData.append('row', rowUpdate);
            } else {
                formData.append('row', selectedProductRow); // Mantener el valor actual
            }
    
            if (columnUpdate !== null) {
                formData.append('column', columnUpdate);
            } else {
                formData.append('column', selectedProductColumn); // Mantener el valor actual
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
    
                    // Actualizar solo los valores editados
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
    
            // Restablecer los valores de edición
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
                                border: `1px solid ${blackAlpha20}`,
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

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    return (

        <div className="location-container">
            <ToastContainer />
            <div className="content-location-wrapper">
                <SearchBar onFilter={handleFilter} />
                {loading ? (
                    <div className="spinner-container-products ">
                        <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                    </div>

                ) : (
                    <DataTable
                        data={allProducts}
                        columns={columns}
                        onRowClick={handleRowProductClick}
                        highlightRows={true}
                        selectedRowIndex={selectedRowIndex}
                        initialPageSize={responsivePageSize} />
                )
                }

            </div>

            <div className="input-location-container">
                <div className="label-input-location-container">
                    <label>Columna</label>
                    <input
                        type="text"
                        style={{ color: blueMediumSoft }}
                        value={(isEditing ? columnUpdate : selectedProductRow) === "NULL" ? "-" : (isEditing ? columnUpdate : selectedProductColumn)}
                        readOnly={!isEditing}
                        onChange={e => setColumnUpdate(e.target.value)}
                    />

                </div>

                <div className="label-input-location-container">
                    <label>Fila</label>
                    <input
                        type="text"
                        style={{ color: blueDesaturedDark }}
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