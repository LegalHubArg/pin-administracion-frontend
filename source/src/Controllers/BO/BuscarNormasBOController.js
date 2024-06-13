import React from 'react';

import Layout from '../../Components/Layout/Layout';
import VistaBuscarNormasBO from '../../Pages/BO/BuscarNormasBO';
import VistaBuscarNormasExternos from '../../Pages/BO/BuscarNormasExternos';
import { Link } from 'react-router-dom';
import { rutasBO } from '../../routes';

const BuscarNormasBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                            <li className="breadcrumb-item">Buscar Normas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Buscar Normas</h1>
                </header>
                <hr />
            </div>
            {JSON.parse(localStorage.getItem('perfiles')).some(n => n.idPerfil === 5) ? <VistaBuscarNormasBO /> : <VistaBuscarNormasExternos />}
        </Layout>

    );
};

export default BuscarNormasBO;