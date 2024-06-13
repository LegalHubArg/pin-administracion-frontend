import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaBMSeccion from '../../Pages/BO/BMSeccion';
import { useNavigate, Link } from 'react-router-dom';
import { rutasAdmin } from '../../routes';


const BMSeccion = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li className="breadcrumb-item">Secciones</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Secciones</h1>
                </header>
                <hr />
            </div>
            <VistaBMSeccion />
        </Layout>

    );
};

export default BMSeccion;