import React from 'react';

import Layout  from '../../../Components/Layout/Layout';
import VistaObservaciones from '../../../Pages/SDIN/MiNorma/Observaciones';
import { Link, Navigate } from 'react-router-dom';

const Observaciones = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={'/home-sdin'}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={'/mis-normas'}>Mis Normas</Link></li>
                            <li className="breadcrumb-item"><Link to={'/nomenclatura'} state={{idNorma: 1}}>Nomenclatura</Link></li>
                            <li className="breadcrumb-item">Observaciones</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Observaciones</h1>
                </header>
                <hr />
            </div>
            <VistaObservaciones />
        </Layout>

    );
};

export default Observaciones;