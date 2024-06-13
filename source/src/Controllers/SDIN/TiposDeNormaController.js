import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import TipoDeNormasABM from '../../Pages/SDIN/ABM/TiposDeNorma';
import { useNavigate, Link } from 'react-router-dom';
import { rutasAdmin } from '../../routes';


const TiposDeNorma = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li className="breadcrumb-item">Tipos de Norma</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container reponsive mb-5">
                <header>
                    <h1>Tipos de Norma</h1>
                </header>
                <hr />
                <TipoDeNormasABM/>
            </div>
        </Layout>

    );
};

export default TiposDeNorma;