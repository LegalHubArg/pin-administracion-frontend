import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaHomeAdmin from '../../Pages/Administracion/Home';
import AdminBO from '../../Pages/BO/Administracion/Home';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN, rutasAdmin, rutasBO } from '../../routes';


const HomeAdmin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item">Administración</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Administración</h1>
                </header>
                <hr />
            </div>
            {JSON.parse(localStorage.getItem('perfiles')).some(n => n.idPerfil === 5) ? <AdminBO /> : <VistaHomeAdmin />}
        </Layout>

    );
};

export default HomeAdmin;