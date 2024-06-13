import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaReportes from '../../Pages/SDIN/Reportes';
import { Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';

const Reportes = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Reportes</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Reportes</h1>
                </header>
                <hr />
            </div>
            <VistaReportes />
        </Layout>

    );
};

export default Reportes;