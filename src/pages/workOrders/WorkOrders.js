import React, { useState, useEffect } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Icon from "../../components/Icons";
import AllWorkOrders from "./AllWorkOrders";

const WorkOrders = () => {

    const [activeTab, setActiveTab] = React.useState(0);
    const [viewMode, setViewMode] = useState('general');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [showTabs, setShowTabs] = useState(true);

    useEffect(() => {
        if (activeTab === 0) {
            setSelectedWorkOrder(null);
        }
        setViewMode('general');
    }, [activeTab])

    /*
    
    
        const handleAddNewWorkOrder = () => {
            navigate("/workOrders/newWorkOrder");
        };
    
        const handleShowInformationWorkOrderClick = (workOrderId) => {
            navigate(`/workOrders/detailWorkOrder/${workOrderId}`, {
                state: { currentPage: 'workOrders' }
            });
        };
    
    */
    return (

        <div>
            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu onWorkOrderClick={() => {
                setActiveTab(0);
                setViewMode('general');
            }} />

            <div className="container-general-tabs">
                <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>

                    {showTabs && (
                        <TabList>
                            <Tab>
                                <Icon name="assignment" className="icon-tabs" />
                                Todas las Órdenes
                            </Tab>
                            <Tab>
                                <Icon name="carServiceSchedule" className="icon-tabs" />
                                Por Iniciar
                            </Tab>
                            <Tab>
                                <Icon name="carRepair" className="icon-tabs" />
                                Activas
                            </Tab>
                            <Tab>
                                <Icon name="receipt" className="icon-tabs" />
                                Por Facturar
                            </Tab>
                        </TabList>
                    )}

                    <TabPanel>
                        <AllWorkOrders
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            selectedWorkOrder={selectedWorkOrder}
                            setSelectedWorkOrder={setSelectedWorkOrder}
                            setShowTabs={setShowTabs}
                        />
                    </TabPanel>

                </Tabs>

            </div>





        </div>

    );

};

export default WorkOrders;