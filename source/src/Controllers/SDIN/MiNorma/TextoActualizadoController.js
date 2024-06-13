import React from 'react';

import Layout  from '../../../Components/Layout/Layout';
import VistaTextoActualizado from '../../../Pages/SDIN/MiNorma/TextoActualizado';
import { Link, Navigate } from 'react-router-dom';

const TextoActualizado = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={'/home-sdin'}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={'/nomenclatura'} state={{idNorma: 1}}>Nomenclatura</Link></li>
                            <li className="breadcrumb-item">Editar Texto Actualizado</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">EDITAR TEXTO ACTUALIZADO</h1>
                </header>
                <hr />
            </div>
            <VistaTextoActualizado />
        </Layout>

    );
};

export default TextoActualizado;