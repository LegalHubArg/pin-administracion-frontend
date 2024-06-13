import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaAbrogacion from '../../Pages/DJ/Abrogacion';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const Abrogacion = props => {
    const navigate = useNavigate();
    const { idNormaSDIN } = useParams();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home + `/${rutasSDIN.ficha_norma.replace(':idNormaSDIN', idNormaSDIN)}`}>Ficha de la Norma</Link></li>
                            <li className="breadcrumb-item">Abrogación</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Abrogación</h1>
                </header>
                <hr />
            </div>
            <VistaAbrogacion />
        </Layout>

    );
};

export default Abrogacion;