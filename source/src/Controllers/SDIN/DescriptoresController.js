import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaDescriptores from '../../Pages/SDIN/Descriptores';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN, rutasAdmin } from '../../routes';


const Descriptores = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li className="breadcrumb-item">Descriptores</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Descriptores</h1>
                </header>
                <hr />
            </div>
            <VistaDescriptores />
        </Layout>

    );
};

export default Descriptores;