import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import DependenciasABM from '../../Pages/SDIN/ABM/Dependencias';
import { useNavigate, Link } from 'react-router-dom';
import { rutasAdmin } from '../../routes';


const Dependencias = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li className="breadcrumb-item">Dependencias</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container reponsive mb-5">
                <header>
                    <h1>Dependencias</h1>
                </header>
                <hr />
                <DependenciasABM/>
            </div>
        </Layout>

    );
};

export default Dependencias;