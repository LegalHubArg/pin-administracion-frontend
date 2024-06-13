import React from 'react';

import Layout from '../../Components/Layout/Layout';
import VistaOrgEmisor from '../../Pages/BO/OrganismoEmisor';
import { rutasAdmin } from '../../routes';
import { Link } from 'react-router-dom';

const OrganismoEmisorControlles = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header class="pt-4 pb-3 mb-4">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                        <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li class="breadcrumb-item">Organismo Emisor</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div class="container reponsive mb-5">
                <header>
                    <h1 class="mb-3">Organismo Emisor</h1>
                </header>
                <hr />
                <VistaOrgEmisor />
            </div>
        </Layout>

    );
};

export default OrganismoEmisorControlles;