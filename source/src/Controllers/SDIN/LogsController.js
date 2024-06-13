import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaLogs from '../../Pages/SDIN/Logs';
import { Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const LogsController = (props) => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li class="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Logs</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Logs</h1>
                </header>
                <hr />
                <VistaLogs/>
            </div>
        </Layout>

    );
};

export default LogsController;