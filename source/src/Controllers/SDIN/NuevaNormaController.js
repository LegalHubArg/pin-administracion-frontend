import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaNuevaNorma from '../../Pages/SDIN/NuevaNorma';
import { Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';

const NuevaNorma = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Alta de Norma</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Alta de Norma</h1>
                </header>
                <hr />
            </div>
            <VistaNuevaNorma />
        </Layout>

    );
};

export default NuevaNorma;