import React from 'react';

import Layout  from '../../../Components/Layout/Layout';
import VistaEditarTemas from '../../../Pages/SDIN/MiNorma/EditarTemas';
import { Link } from 'react-router-dom';

const EditarTemas = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={'/home-sdin'}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={'/nomenclatura'} state={{idNorma: 1}}>Nomenclatura</Link></li>
                            <li className="breadcrumb-item">Editar Temas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">EDITAR TEMAS</h1>
                </header>
                <hr />
            </div>
            <VistaEditarTemas />
        </Layout>

    );
};

export default EditarTemas;