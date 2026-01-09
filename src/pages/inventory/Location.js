import React, { useState, useCallback, useEffect } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import SearchBar from "../../searchBar/SearchBar";
import DataTable from "../../dataTable/DataTable";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";
import { showToastOnce } from "../../utils/toastUtils";
import Icon from "../../components/Icons";

const columnIcon = process.env.PUBLIC_URL + "/images/icons/column.png";
const rowIcon = process.env.PUBLIC_URL + "/images/icons/row.png";

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

            try {
                const response = await apiClient.put(`/products/update-location/${selectedProductId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {

                    showToastOnce("success", "Ubicación actualizada");

                    if (rowUpdate !== null) {
                        setSelectedProductRow(rowUpdate);
                    }

                    if (columnUpdate !== null) {
                        setSelectedProductColumn(columnUpdate);
                    }

                    fetchData();
                }

            } catch (error) {
                showToastOnce("error", "Ha ocurrido un error al actualizar la ubicación del producto");
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

    useEffect(() => {
        fetchData();
    }, [selectedOption, searchTerm]);

    return (

        <div className="container-general-information">

            <div className="label-input-container">

                <div className="field-row-location">

                    <div className="field-group-information">
                        <label>Columna</label>

                        <div className="input-with-icon">

                            <input
                                type="text"
                                style={{ color: blueMediumSoft }}
                                value={(isEditing ? columnUpdate : selectedProductRow) === "NULL" ? "-" : (isEditing ? columnUpdate : selectedProductColumn)}
                                readOnly={!isEditing}
                                onChange={e => setColumnUpdate(e.target.value)}
                            />
                            <Icon name="column" className="input-product-icon" />
                        </div>
                    </div>

                    <div className="field-group-information">
                        <label>Fila</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                style={{ color: blueDesaturedDark }}
                                value={(isEditing ? rowUpdate : selectedProductRow) === "NULL" ? "-" : (isEditing ? rowUpdate : selectedProductRow)}
                                readOnly={!isEditing}
                                onChange={e => setRowUpdate(e.target.value)}
                            />
                            <Icon name="row" className="input-product-icon" />
                        </div>
                    </div>

                </div>

                <div className="container-section-button">
                    <button className="location-button" onClick={handleEditOrSave}>
                        <span className="span-location-button">
                            {isEditing ? 'Guardar' : 'Editar'}
                        </span>
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
                    <DataTable
                        data={allProducts}
                        columns={columns}
                        onRowClick={handleRowProductClick}
                        highlightRows={true}
                        selectedRowIndex={selectedRowIndex}
                        initialPageSize={responsivePageSize} />
                </div>

            )
            }

        </div>

    )
};

export default Location;