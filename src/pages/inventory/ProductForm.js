import React, { useState, useEffect } from "react";
import Select from 'react-select';
import apiClient from "../../services/apiClient";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { CustomValueContainer } from "../../customSingleValue/CustomValueContainer";
import useCSSVar from "../../hooks/UseCSSVar";
import { showToastOnce } from "../../utils/toastUtils";
import Icon from "../../components/Icons";
import CustomModal from "../../modal/customModal/CustomModal";

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
    onSuspendSuccess,
    onBack,
    onProductChange
}) {

    const [isEditing, setIsEditing] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedOptionSupplier, setSelectedOptionSupplier] = useState("");
    const [searchTermSupplier, setSearchTermSupplier] = useState("");
    const [searchType, setSearchType] = useState('Código');
    const [isAlertProductSuspend, setIsAlertProductSuspend] = useState(false);

    //Variables para guardar los datos de entrada de producto
    const [productId, setProductId] = useState(productData.id);
    const [nameProduct, setNameProduct] = useState(productData.title);
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

    const isReadOnly = mode === "edit" && !isEditing;

    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const options = [
        { value: 'search_by_code', label: 'Buscar por Código' },
        { value: 'search_by_name', label: 'Buscar por Nombre' },
        ...suppliers
    ];

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control-supplier',
            width: isTabletLandscape ? '80%' : '100%',
            height: '50px',
            minHeight: '50px',
            border: `1px solid ${blackAlpha34}`,
            borderRadius: '4px',
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            paddingLeft: '40px',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingRight: '4px',
        }),
        singleValue: (provided, state) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '100%',
        }),
        menuList: (provided, state) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-supplier',
            height: '50px',
            lineHeight: '40px',
            fontSize: '16px',
        }),
        input: (provided) => ({
            ...provided,
            paddingLeft: '8px'
        }),

    };

    const getSuppliers = async () => {

        let endpoint = '/suppliers/all';
        const searchPerSupplierCode = "supplier_code";
        const searchPerName = "name";

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
            const supplierOptions = response.data.map(supplier => ({
                value: supplier.id,
                label: `${supplier.name} (${supplier.supplier_code})`
            }));

            setSuppliers(supplierOptions);

        } catch (error) {
            showToastOnce("error", "Error al obtener los datos de las operaciones.");
        }

    };

    const handleStockChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setStock(value);
        }
    };

    const handleImageUpload = event => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            let result = reader.result;
            const regex = /^data:image\/[a-z]+;base64,/i;
            result = result.replace(regex, "");
            setImageBase64(result);
        }

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const product = {
            title: nameProduct,
            product_picture: imageBase64,
            supplier_id: selectedSupplier.value || 0,
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
        try {
            const response = await apiClient.post('/products/create', product)
            showToastOnce("success", "Producto creado");
            onProductChange();
            return response.data;
        } catch (error) {
            showToastOnce("error", "Hubo un error al crear el producto");
        }
    };

    const updateProduct = async (id, product) => {
        try {
            const response = await apiClient.put(`products/update/${id}`, product);
            showToastOnce("success", "Producto actualizado con éxito!");
            onProductChange();
            return response.data;
        } catch (error) {
            showToastOnce("error", "Hubo un error al actualizar el producto");
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

        event.preventDefault();
        setIsAlertProductSuspend(false);

        try {

            const response = await apiClient.put(`/products/change-status/${productData.id}?product_status=suspended`)

            if (response.status === 200) {
                showToastOnce("success", "Producto suspendido");
                onSuspendSuccess();
                onProductChange();
                return response.data;

            }

        } catch (error) {
            showToastOnce("error", "Error al suspender el producto. Por favor, inténtalo de nuevo.");
        }
    };

    useEffect(() => {
        getSuppliers();
    }, [searchTermSupplier, selectedOptionSupplier, searchType]);

    useEffect(() => {
        if (mode === "edit" && productData) {
            setProductId(productData.id);
            setNameProduct(productData.title);
            setImageBase64(productData.product_picture);
            setSelectedSupplier({
                value: productData.supplier.id,
                label: `${productData.supplier.name} (${productData.supplier.supplier_code})`
            });
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

    if (!productData) {
        return null;
    }

    return (
        <div className="general-information-inventory">
            <CustomTitleSection
                onBack={() => {
                    setIsEditing(false);
                    onBack?.();
                }}
                titlePrefix="Lista de Productos"
                title={mode === "add" ? "Nuevo Producto" : "Información del producto"}
                onCustomButtonClick={(mode === "add" || (mode === "edit" && isEditing)) ? handleFormSubmit : undefined}
                customButtonLabel={(mode === "add" || (mode === "edit" && isEditing)) ? "GUARDAR" : undefined}
                showCustomButton={(mode === "add" || (mode === "edit" && isEditing))}
                showDisableIcon={mode === "edit"}
                onDisable={mode === "edit" ? openAlertModalProductSuspend : undefined}
                showEditIcon={mode === "edit"}
                onEdit={mode === "edit" ? () => setIsEditing(true) : undefined}
            />

            <div className="information-product-container">

                <div className="container-section-product">

                    <div className="product-column-information">
                        <span className="section-product-title ">Información General</span>

                        <div className="field-group-information">
                            <label>Nombre de Producto</label>
                            <div className="input-with-icon">
                                <input
                                    value={nameProduct}
                                    className="name-product"
                                    onChange={(e) => setNameProduct(e.target.value)}
                                    readOnly={isReadOnly}
                                />
                                <Icon name="text" className="input-product-icon" />
                            </div>
                        </div>

                        <div className="field-group-information">
                            <label>Proveedor</label>
                            <Select
                                value={options.find(option => option.value === selectedSupplier?.value) || ""}
                                options={options}
                                onInputChange={(inputValue) => setSearchTermSupplier(inputValue)}
                                onChange={(selectedOption) => {
                                    if (selectedOption.isType) {
                                        setSearchType(selectedOption.label.split(' ')[2]);
                                        setSelectedSupplier(null);
                                    } else {
                                        setSelectedSupplier(selectedOption);
                                    }
                                }}
                                isSearchable={true}
                                placeholder={searchType ? `Buscar por ${searchType}` : "Buscar..."}
                                styles={customStyles}
                                isDisabled={isReadOnly}
                                components={{ ValueContainer: CustomValueContainer }}
                            />
                        </div>

                        <div className="field-group-information">
                            <label>Descripción</label>
                            <div className="input-with-icon">
                                <input
                                    value={description}
                                    className="description-product"
                                    onChange={(e) => setDescription(e.target.value)}
                                    readOnly={isReadOnly}
                                />
                                <Icon name="text" className="input-product-icon" />
                            </div>
                        </div>

                    </div>

                    <div className="product-column-image">
                        <div className="title-with-edit">
                            <span className="section-product-title">Cargar Imagen</span>
                            <div className="action-icon-container" onClick={() => document.getElementById('fileInput').click()}>
                                <Icon
                                    name={
                                        mode === "add"
                                            ? "upload"
                                            : mode === "edit" && !isEditing
                                                ? "edit"
                                                : "upload"
                                    }
                                    className="action-icon"
                                />

                            </div>
                        </div>

                        <div className="container-product-image">
                            {imageBase64 ? (
                                <img src={`data:image/png;base64,${imageBase64}`} alt="Actual" className="product-image" />
                            ) : (
                                <Icon name="productDefault" className="default-icon" />
                            )}
                        </div>

                        <input
                            id="fileInput"
                            className="input-image"
                            type="file"
                            onChange={handleImageUpload}
                            accept=".jpg, .jpeg, .png"
                            readOnly={isEditing}
                            style={{ display: 'none' }}
                        />
                    </div>

                </div>

                <div class="outer-container">

                    <div class="below-product-container">
                        <div class="left-right-group">
                            <div class="below-box left-box">
                                <span className="section-product-title">Precio y Stock</span>
                                <div className="field-row">

                                    <div className="field-group-information">
                                        <label>Precio</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={price}
                                                className="price-product"
                                                onChange={(e) => setPrice(e.target.value.trim())}
                                                readOnly={isReadOnly}
                                            />
                                            <Icon name="dollar" className="input-product-icon" />
                                        </div>
                                    </div>

                                    <div className="field-group-information">
                                        <label>Stock</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                value={stock}
                                                className="stock-product"
                                                onChange={handleStockChange}
                                                readOnly={isReadOnly}
                                            />
                                            <Icon name="stock" className="input-product-icon" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="below-box right-box">
                                <span className="section-product-title">Localización</span>
                                <div className="field-row">

                                    <div className="field-group-information">
                                        <label>Columna</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                value={column}
                                                className="column-product"
                                                onChange={(e) => setColumn(e.target.value)}
                                                readOnly={isReadOnly}
                                            />
                                            <Icon name="column" className="input-product-icon" />
                                        </div>
                                    </div>

                                    <div className="field-group-information">
                                        <label>Fila</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                value={row}
                                                className="row-product"
                                                onChange={(e) => setRow(e.target.value)}
                                                readOnly={isReadOnly}
                                            />
                                            <Icon name="row" className="input-product-icon" />
                                        </div>
                                    </div>


                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="image-extra-container">
                        <span className="section-product-title">Categoría y Marca</span>

                        <div className="field-row">

                            <div className="field-group-information">
                                <label>Categoría del Producto</label>
                                <div className="input-with-icon">
                                    <input
                                        type="text"
                                        value={category}
                                        className="category-product"
                                        onChange={(e) => setCategory(e.target.value)}
                                        readOnly={isReadOnly}
                                    />
                                    <Icon name="category" className="input-product-icon" />
                                </div>
                            </div>

                            <div className="field-group-information">
                                <label>Marca</label>
                                <div className="input-with-icon">
                                    <input
                                        type="text"
                                        value={brand}
                                        className="brand-product"
                                        onChange={(e) => setBrand(e.target.value)}
                                        readOnly={isReadOnly}
                                    />
                                    <Icon name="brand" className="input-product-icon" />
                                </div>
                            </div>

                        </div>


                    </div>

                </div>

                <div className="last-container">
                    <div className="last-information-container">
                        <span className="section-product-title">Información Adicional</span>

                        <div className="field-group-information">
                            <label>Compatibilidad del Producto</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    value={compatibility}
                                    className="compatibility-product"
                                    onChange={(e) => setCompatibility(e.target.value)}
                                    readOnly={isReadOnly}
                                />
                                <Icon name="text" className="input-product-icon" />
                            </div>
                        </div>


                    </div>


                </div>

            </div>

            {isAlertProductSuspend && (

                <CustomModal
                    isOpen={isAlertProductSuspend}
                    type="confirm-suspend"
                    subTitle="¿Está seguro de suspender el producto?"
                    description="Al suspender el producto, se ocultará temporalmente del sistema.
                    Podrá volver a activarlo desde Configuración en cualquier momento."
                    onCancel={closeAlertModalProductSuspend}
                    onConfirm={handleUnavailableProduct}
                    showCloseButton={false}
                />

            )}
        </div>
    )


}