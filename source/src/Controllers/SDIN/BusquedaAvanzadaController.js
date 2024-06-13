import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaBusquedaAvanzada from '../../Pages/SDIN/BusquedaAvanzada';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const BusquedaAvanzada = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Busqueda Avanzada y Operaciones</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header className="d-flex flex-row justify-content-between">
                    <h1>Búsqueda Avanzada y Operaciones</h1>
                    <button className="btn btn-primary" onClick={() => navigate('../' + rutasSDIN.nueva_norma)}>Nueva Norma &nbsp;<FaPlus /></button>
                </header>
                <hr />
            </div>
            <VistaBusquedaAvanzada />
        </Layout>

    );
};

export default BusquedaAvanzada;