import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaAdminsitradorDigesto from '../../Pages/SDIN/AdministradorDigesto';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN, rutasDJ } from '../../routes';


const AdministradorDigesto = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Digesto Jurídico</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header className="d-flex flex-row justify-content-between">
                    <h1>Digesto Jurídico</h1>
                    <button className="btn btn-primary" onClick={() => navigate(rutasDJ.nueva_ley)}>Nueva Ley Digesto &nbsp;<FaPlus /></button>
                </header>
                <hr />
            </div>
            <VistaAdminsitradorDigesto />
        </Layout>

    );
};

export default AdministradorDigesto;