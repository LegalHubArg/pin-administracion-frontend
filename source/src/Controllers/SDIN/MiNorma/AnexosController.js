import React from 'react';

import Layout  from '../../../Components/Layout/Layout';
import VistaAnexos from '../../../Pages/SDIN/MiNorma/Anexos';
import { Link, Navigate } from 'react-router-dom';

const Anexos = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={'/home-sdin'}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={'/nomenclatura'} state={{idNorma: 1}}>Nomenclatura</Link></li>
                            <li className="breadcrumb-item">Editar Anexos</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">EDITAR ANEXOS</h1>
                </header>
                <hr />
            </div>
            <VistaAnexos />
        </Layout>

    );
};

export default Anexos;