import React from 'react';
import { useNavigate } from 'react-router-dom'
import Layout from '../../Components/Layout/Layout';
import VistaSumarioBO from '../../Pages/BO/SumarioBO';
import { rutasAdmin } from '../../routes';
import { Link } from 'react-router-dom';

const SumarioBO = props => {
    const navigate = useNavigate();
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header class="pt-4 pb-3 mb-4">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><Link to={'/'}>Home</Link></li>
                            <li class="breadcrumb-item"><Link to={rutasAdmin.home}>Administración</Link></li>
                            <li class="breadcrumb-item">Sumario</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container reponsive mb-5">
                <header className="d-flex justify-content-between align-items-end">
                    <h1 class="mb-0">BO - Sumario</h1>
                    {/* <div className="mb-0">
                        <Link to={'../' + rutasBO.bm_seccion}><button type="button" className="btn btn-link btn-sm ml-2 mb-0">Secciones</button></Link>
                        <Link to={'../' + rutasBO.tipos_normas}><button type="button" className="btn btn-link btn-sm ml-2 mb-0">Tipos de Normas</button></Link>
                        <Link to={'../' + rutasBO.subtipos_normas}><button type="button" className="btn btn-link btn-sm ml-2 mb-0" >Subtipos de Norma</button></Link>
                        <Link to={'../' + rutasBO.reparticiones}><button type="button" className="btn btn-link btn-sm ml-2 mb-0" >Reparticiones</button></Link>
                    </div> */}
                </header>
                <hr />
                <VistaSumarioBO />
            </div>
        </Layout>

    );
};

export default SumarioBO;