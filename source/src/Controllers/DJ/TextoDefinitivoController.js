import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaTextoDefinitivo from '../../Pages/DJ/TextoDefinitivo';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const TextoDefinitivo = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Elaboración de texto definitivo</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Elaboración de texto definitivo</h1>
                </header>
                <hr />
            </div>
            <VistaTextoDefinitivo />
        </Layout>

    );
};

export default TextoDefinitivo;