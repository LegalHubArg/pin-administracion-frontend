import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaMisNormas from '../../Pages/SDIN/MisNormas';
import { Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';

const MisNormasController = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Mis Normas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Mis Normas</h1>
                </header>
                <hr />
            </div>
            <VistaMisNormas />
        </Layout>

    );
};

export default MisNormasController;