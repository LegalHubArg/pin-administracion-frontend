import React, { useState } from 'react';

import Layout from '../../Components/Layout/Layout';
import VistaJerarquia from '../../Pages/SDIN/JerarquiaTemas';
import { rutasAdmin } from '../../routes';
import { Link } from 'react-router-dom';

const Jerarquia = props => {
    const [verTabla, setVerTabla] = useState(false)
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header class="pt-4 pb-3 mb-4">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li class="breadcrumb-item">Jerarquía de Temas</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container reponsive mb-5">
                <header className="d-flex justify-content-between mb-0">
                    <h1 class="mb-0">Jerarquía de Temas</h1>
                    <button className="btn btn-link mb-0" onClick={() => setVerTabla(!verTabla)}>{verTabla ? "Ver Organigrama" : "Ver Tabla"}</button>
                </header>
                <hr />
                <VistaJerarquia verTabla={verTabla} />
            </div>
        </Layout>

    );
};

export default Jerarquia;