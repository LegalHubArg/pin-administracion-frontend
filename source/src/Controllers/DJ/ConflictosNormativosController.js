import React from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaConflictosNormativos from '../../Pages/DJ/ConflictosNormativos';
import { useNavigate, Link } from 'react-router-dom';
import { rutasSDIN } from '../../routes';


const ConflictosNormativos = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home </Link></li>
                            <li className="breadcrumb-item">Existencia de Conflictos Normativos</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1>Existencia de Conflictos Normativos</h1>
                </header>
                <hr />
            </div>
            <VistaConflictosNormativos />
        </Layout>

    );
};

export default ConflictosNormativos;