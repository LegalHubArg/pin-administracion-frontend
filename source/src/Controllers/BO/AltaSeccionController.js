import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaAltaSeccion from '../../Pages/BO/AltaSeccion';
import { useNavigate, Link } from 'react-router-dom';
import { rutasBO } from '../../routes';


const AltaSeccion = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasBO.home}>Home </Link></li>
                            <li className="breadcrumb-item"><Link to={"../" + rutasBO.bm_seccion}>Administrar Secciones</Link></li>
                            <li className="breadcrumb-item">Alta Sección</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Crear Sección</h1>
                </header>
                <hr />
            </div>
            <VistaAltaSeccion />
        </Layout>

    );
};

export default AltaSeccion;