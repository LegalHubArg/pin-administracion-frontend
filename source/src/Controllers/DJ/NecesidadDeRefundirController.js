import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaNecesidadDeRefundir from '../../Pages/DJ/NecesidadDeRefundir';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const NecesidadDeRefundir = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Necesidad de refundir en uno o más textos legales</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Necesidad de refundir en uno o más textos legales</h1>
                </header>
                <hr />
            </div>
            <VistaNecesidadDeRefundir />
        </Layout>

    );
};

export default NecesidadDeRefundir;