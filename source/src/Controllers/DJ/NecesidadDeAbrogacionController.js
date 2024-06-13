import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaNecesidadDeAbrogacion from '../../Pages/DJ/NecesidadDeAbrogacion';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const NecesidadDeAbrogacion = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Necesidad de abrogación, derogación o caducidad expresa</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Necesidad de abrogación, derogación o caducidad expresa</h1>
                </header>
                <hr />
            </div>
            <VistaNecesidadDeAbrogacion />
        </Layout>

    );
};

export default NecesidadDeAbrogacion;