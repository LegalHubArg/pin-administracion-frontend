import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaAnexos from '../../Pages/SDIN/Anexos';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const Anexos = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Generación de Anexos</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Generación de Anexos</h1>
                </header>
                <hr />
            </div>
            <VistaAnexos />
        </Layout>

    );
};

export default Anexos;