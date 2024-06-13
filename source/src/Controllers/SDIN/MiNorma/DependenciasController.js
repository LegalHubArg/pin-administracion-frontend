import React from 'react';

import Layout  from '../../../Components/Layout/Layout';
import VistaDependencias from '../../../Pages/SDIN/MiNorma/Dependencias';
import { Link } from 'react-router-dom';

const Dependencias = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={'/home-sdin'}>Home</Link></li>
                            <li className="breadcrumb-item"><Link to={'/mis-normas'}>Mis Normas</Link></li>
                            <li className="breadcrumb-item"><Link to={'/nomenclatura'} state={{idNorma: 1}}>Nomenclatura</Link></li>
                            <li className="breadcrumb-item"><Link to={'/editar-datos-basicos'}>Editar Norma</Link></li>
                            <li className="breadcrumb-item">Editar Dependencias</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">EDITAR DEPENDENCIAS</h1>
                </header>
                <hr />
            </div>
            <VistaDependencias />
        </Layout>

    );
};

export default Dependencias;