import React from 'react';

import Layout from '../../Components/Layout/Layout';
import VistaCuenta from '../../Pages/BO/Administracion/Cuenta';
import { rutasAdmin } from '../../routes';
import { Link } from 'react-router-dom';

const Feriados = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header class="pt-4 pb-3 mb-4">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                        <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li class="breadcrumb-item">Cuentas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div class="container reponsive mb-5">
                <header>
                    <h1 class="mb-3">Información de la Cuenta</h1>
                </header>
                <hr />
                <VistaCuenta />
            </div>
        </Layout>

    );
};

export default Feriados;