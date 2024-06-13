import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaNuevaLey from '../../Pages/DJ/NuevaLey';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const NuevaLey = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Nueva Ley Digesto</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Nueva Ley Digesto</h1>
                </header>
                <hr />
            </div>
            <VistaNuevaLey />
        </Layout>

    );
};

export default NuevaLey;