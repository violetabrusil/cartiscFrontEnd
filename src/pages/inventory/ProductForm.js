import "../../Products.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify'
import apiClient from "../../services/apiClient";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

export function ProductForm({
    mode = "add",
    productData = {
        id: null,
        title: "",
        product_picture: "",
        supplier: { supplier_code: "", name: "" },
        description: "",
        category: "",
        brand: "",
        price: 0.00,
        stock: "",
        row: "",
        column: "",
        compatibility_notes: ""
    },
    onSubmit,
    onSuspendSuccess }) {

    const [suppliers, setSuppliers] = useState([]);
    const [selectedOptionSupplier, setSelectedOptionSupplier] = useState("");
    const [searchTermSupplier, setSearchTermSupplier] = useState("");
    const [searchType, setSearchType] = useState('Código');  // Por defecto buscará por código
    const [isEditable, setIsEditable] = useState(mode === "add");
    const [isAlertProductSuspend, setIsAlertProductSuspend] = useState(false);

    //Variables para guardar los datos de entrada de producto
    const [productId, setProductId] = useState(productData.id);
    const [titleProduct, setTitleProduct] = useState(productData.title);
    const [imageBase64, setImageBase64] = useState(productData.product_picture);
    const [selectedSupplier, setSelectedSupplier] = useState({ value: productData.supplier.supplier_code, label: `${productData.supplier.name} (${productData.supplier.supplier_code})` });
    const [description, setDescription] = useState(productData.description);
    const [category, setCategory] = useState(productData.category);
    const [brand, setBrand] = useState(productData.brand);
    const [price, setPrice] = useState(productData.price);
    const [stock, setStock] = useState(productData.stock);
    const [row, setRow] = useState(productData.row);
    const [column, setColumn] = useState(productData.column);
    const [compatibility, setCompatibility] = useState(productData.compatibility_notes);

    const options = [
        { value: 'search_by_code', label: 'Buscar por Código' },
        { value: 'search_by_name', label: 'Buscar por Nombre' },
        ...suppliers
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control-supplier',
            width: '474px', // Estilo personalizado para el ancho
            height: '50px', // Estilo personalizado para la altura
            minHeight: '50px',
            border: '1px solid rgb(0 0 0 / 34%)', // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px', // Estilo personalizado para el borde redondeado
            padding: '4px',

            marginLeft: '-2px'
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            padding: '4px', // Ajusta según sea necesario
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        singleValue: (provided, state) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '474px', // puedes ajustar el ancho del menú aquí
        }),
        menuList: (provided, state) => ({
            ...provided,
            maxHeight: '200px', // puedes ajustar la altura máxima del menú desplegable aquí
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-supplier',
            height: '40px',  // ajusta la altura de cada opción aquí
            lineHeight: '40px', // alinea el texto verticalmente en el medio de la opción
            fontSize: '16px', // ajusta el tamaño de la fuente de cada opción aquí
            // otros estilos personalizados si los necesitas
        }),

    };

    const getSuppliers = async (event) => {
        //Endpoint por defecto
        let endpoint = '/suppliers/all';
        const searchPerSupplierCode = "supplier_code";
        const searchPerName = "name";
        //Si hay un filtro de búsqueda
        console.log("selectedoption", selectedOptionSupplier)
        console.log("console", searchTermSupplier)

        if (searchTermSupplier) {
            switch (selectedOptionSupplier) {
                case 'Código':
                    endpoint = `/suppliers/search?search_type=${searchPerSupplierCode}&criteria=${searchTermSupplier}`;
                    break;
                case 'Nombre':
                    endpoint = `/suppliers/search?search_type=${searchPerName}&criteria=${searchTermSupplier}`;
                    break;
                default:
                    break;
            }
        }
        try {
            const response = await apiClient.get(endpoint);
            console.log("response", response.data);
            const supplierOptions = response.data.map(supplier => ({
                value: supplier.id,
                label: `${supplier.name} (${supplier.supplier_code})`
            }));

            setSuppliers(supplierOptions);

        } catch (error) {
            console.log("Error al obtener los datos de las operaciones");
        }

    };

    const handleStockChange = (e) => {
        const value = e.target.value;
        // Usar una regex para verificar si el valor es un número o una cadena vacía.
        if (/^\d*$/.test(value)) {
            setStock(value);
        }
    }

    const handleImageUpload = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        console.log("entro")

        reader.onloadend = () => {
            let result = reader.result;

            // Eliminar el prefijo
            const regex = /^data:image\/[a-z]+;base64,/i;
            result = result.replace(regex, "");
            console.log("imagen", result)
            setImageBase64(result);

        }

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const product = {
            title: titleProduct,
            product_picture: imageBase64,
            supplier_id: selectedSupplier.value,
            description,
            category,
            brand,
            price,
            stock: Number(stock) || 0,
            row,
            column,
            compatibility_notes: compatibility
        };

        if (productId) {
          updateProduct(productId, product);
          onSubmit();
        } else {
          createProduct(product);
          onSubmit();
        }
        
    };

    const createProduct = async (product) => {
        console.log("product", product, suppliers)
        try {
            const response = await apiClient.post('/products/create', product)
            toast.success('Producto creado', {
                position: toast.POSITION.TOP_RIGHT
            });
            return response.data;
        } catch (error) {
            toast.error('Hubo un error al crear el producto', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.error(error);
        }
    };

    const updateProduct = async (id, product) => {
        try {
            const response = await apiClient.put(`products/update/${id}`, product);
            toast.success('Producto actualizado con éxito!', {
                position: toast.POSITION.TOP_RIGHT
            });
            return response.data;
        } catch (error) {
            toast.error('Hubo un error al actualizar el producto', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.error(error);
        }
    };

    const openAlertModalProductSuspend = () => {
        setIsAlertProductSuspend(true);
    };

    const closeAlertModalProductSuspend = () => {
        setIsAlertProductSuspend(false);
    };

    //Función para suspender un producto
    const handleUnavailableProduct = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertProductSuspend(false);

        try {

            const response = await apiClient.put(`/products/change-status/${productData.id}?product_status=suspended`)

            if (response.status === 200) {
                toast.success('Producto suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });
                onSuspendSuccess();
                return response.data;
            
            } else {
                toast.error('Ha ocurrido un error al suspender el producto', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            console.log('Error al suspender el producto', error);
            toast.error('Error al suspender el producto. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    useEffect(() => {
        getSuppliers();
    }, [searchTermSupplier, selectedOptionSupplier, searchType]);

    useEffect(() => {
        if (mode === "edit") {
            setProductId(productData.id);
            setTitleProduct(productData.title);
            setImageBase64(productData.product_picture);
            setSelectedSupplier({
                value: productData.supplier.id,
                label: `${productData.supplier.name} (${productData.supplier.supplier_code})`
            });
            console.log("proveedor edit", selectedSupplier)
            setDescription(productData.description);
            setCategory(productData.category);
            setBrand(productData.brand);
            setPrice(productData.price);
            setStock(productData.stock);
            setRow(productData.row);
            setColumn(productData.column);
            setCompatibility(productData.compatibility_notes);
        }
    }, [productData, mode]);

    return (
        <div>
            <ToastContainer />

            <div className="form-scroll-products">
                {mode === 'edit' && (
                    <CustomTitleSection
                        title="Información del Producto"
                        showDisableIcon={true}
                        onDisable={openAlertModalProductSuspend}
                        showEditIcon={true}
                        onEdit={handleEditClick}
                    />

                )}

                <div className="product-container-image">
                    <div className="left-side">
                        <label>Imagen</label>
                        {imageBase64 && <img src={`data:image/png;base64,${imageBase64}`} alt="Actual" style={{ width: '100px', height: '100px' }} />}
                        <input
                            className="input-image"
                            type="file"
                            onChange={handleImageUpload}
                            accept=".jpg, .jpeg, .png"
                            disabled={!isEditable} />
                    </div>

                    <div className="right-side">
                        <div className="label-input-pair">
                            <label>Título</label>
                            <input
                                className="input-title-product"
                                type="text"
                                value={titleProduct}
                                onChange={e => setTitleProduct(e.target.value)}
                                disabled={!isEditable} />
                        </div>
                        <div className="label-input-pair">
                            <label>Proveedor</label>
                            <Select
                                value={options.find(option => option.value === selectedSupplier.value)}
                                options={options}
                                onInputChange={(inputValue) => {
                                    setSearchTermSupplier(inputValue);
                                }}
                                onChange={(selectedOption) => {
                                    if (selectedOption.value === 'search_by_code') {
                                        setSearchType('Código');
                                    } else if (selectedOption.value === 'search_by_name') {
                                        setSearchType('Nombre');
                                    } else {
                                        console.log("proveedor seleccionado", selectedOption)
                                        setSelectedSupplier(selectedOption);
                                    }
                                }}
                                isSearchable={true}
                                placeholder="Buscar..."
                                styles={customStyles}
                                disabled={!isEditable}
                            />
                        </div>
                        <div className="label-input-pair">
                            <label>Categoría</label>
                            <input
                                className="input-category-product"
                                type="text"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                disabled={!isEditable} />
                        </div>

                    </div>
                </div>

                <div className="form-container-products" >

                    <div className="input-group">
                        <label>Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={!isEditable} />
                    </div>

                    <div className="input-group">
                        <label>Marca</label>
                        <input
                            type="text"
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                            disabled={!isEditable} />
                    </div>
                    <div className="input-group">
                        <label>Precio</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            disabled={!isEditable} />
                    </div>
                    <div className="input-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            value={stock}
                            onChange={handleStockChange}
                            disabled={!isEditable} />
                    </div>
                    <div className="input-group">
                        <label>Fila</label>
                        <input
                            type="text"
                            value={row}
                            onChange={e => setRow(e.target.value)}
                            disabled={!isEditable} />
                    </div>
                    <div className="input-group">
                        <label>Columna</label>
                        <input
                            type="text"
                            value={column}
                            onChange={e => setColumn(e.target.value)}
                            disabled={!isEditable} />
                    </div>
                    <div className="input-group">
                        <label>Compatibilidad</label>
                        <input
                            type="text"
                            value={compatibility}
                            onChange={e => setCompatibility(e.target.value)}
                            disabled={!isEditable} />
                    </div>

                </div>
            </div>

            <div className="container-button-save-product">
                <button
                    className={isEditable ? "button-save-product button-active" : "button-save-product button-disabled"}
                    onClick={handleFormSubmit}
                    disabled={!isEditable}>
                    GUARDAR
                </button>

            </div>

            {isAlertProductSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender el producto?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlertModalProductSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableProduct}  >
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}
        </div>
    )


}