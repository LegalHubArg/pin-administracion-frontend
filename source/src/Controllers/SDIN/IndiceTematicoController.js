import React, { useState } from 'react';

import Layout from '../../Components/Layout/Layout';
import VistaIndice from '../../Pages/SDIN/IndiceTematico';
import { rutasAdmin } from '../../routes';
import { Link } from 'react-router-dom';

const Indice = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header class="pt-4 pb-3 mb-4">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li class="breadcrumb-item">Índice Temático</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container reponsive mb-5">
                <header>
                    <h1>Índice Temático</h1>
                </header>
                <hr />
                <VistaIndice />
            </div>
        </Layout>

    );
};

export default Indice;