import React from 'react';
import { FaPlus } from "react-icons/fa";
import Layout from '../../Components/Layout/Layout';
import VistaTemas from '../../Pages/SDIN/TemasFront';
import { useNavigate, Link } from 'react-router-dom';
import { rutasAdmin } from '../../routes';


const Temas = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li className="breadcrumb-item">Temas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Editor de Árbol Temático</h1>
                </header>
                <hr />
            </div>
            <VistaTemas />
        </Layout>

    );
};

export default Temas;