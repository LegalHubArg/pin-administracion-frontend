import React from 'react';

import Layout from '../../../Components/Layout/Layout';
import VistaNomenclatura from '../../../Pages/SDIN/MiNorma/Nomenclatura';
import { Link, useParams } from 'react-router-dom';
import { rutasSDIN } from '../../../routes';

const Nomenclatura = props => {
    let { idNormaSDIN } = useParams();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Ficha de la Norma</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3 d-flex justify-content-between">Ficha de la Norma {/* <div style={{fontSize: 20}}>id: {idNormaSDIN}</div> */}</h1>
                </header>
                <hr />
            </div>
            <VistaNomenclatura />
        </Layout>

    );
};

export default Nomenclatura;