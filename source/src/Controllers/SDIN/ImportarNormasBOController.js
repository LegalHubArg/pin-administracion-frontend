import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../Components/Layout/Layout';
import VistaImportarPublicadas from '../../Pages/SDIN/ImportarBO/ImportarPublicadas';
import VistaImportarNoPublicadas from '../../Pages/SDIN/ImportarBO/ImportarNoPublicadas';
import { Link } from 'react-router-dom';
import { getSecciones, getNormaTipos, getNormaSubtipos, getOrganismos } from '../../Helpers/consultas'
import { rutasSDIN } from '../../routes';
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator';

const ImportarBO = props => {

    const [dataFiltros, setDataFiltros] = useState();

    async function getAnalistas() {
        try {
            let body = { usuario: localStorage.getItem("user_cuit") }
            let token = localStorage.getItem("token")
            const { data: { data } } = await ApiPinPost('/api/v1/usuarios/sdin', body, token)
            return data
        }
        catch (e) { }
    }

    async function getEstados() {
        try {
            let token = localStorage.getItem("token")
            const { data: { data } } = await ApiPinGet('/api/v1/sdin/normas/estados', token)
            return data
        }
        catch (e) { }
    }

    //Hook inicial. Trae la data para los filtros de búsqueda.
    useEffect(async () => {
        const secciones = await getSecciones().catch((error) => { /* console.log(error) */ });
        const normaTipos = await getNormaTipos().catch((error) => { /* console.log(error) */ });
        const normaSubtipos = await getNormaSubtipos().catch((error) => { /* console.log(error) */ });
        const estados = await getEstados().catch((error) => { /* console.log(error) */ });
        const organismos = await getOrganismos().catch((error) => { /* console.log(error) */ });
        const analistas = await getAnalistas();
        setDataFiltros({ secciones, normaTipos, normaSubtipos, estados, organismos, analistas })
    }, [])

    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to={rutasSDIN.home}>Home</Link></li>
                            <li className="breadcrumb-item">Importar Normas de BO</li>
                        </ol>
                    </nav>
                </div>
            </header>
            <div className="container">
                <header>
                    <h1 className="mb-3">Importar Normas de BO</h1>
                </header>
                <hr />
            </div>
            {/* Pasa la data para los filtros de búsqueda por "props". */}
            <VistaImportarNoPublicadas props={dataFiltros} />
            <VistaImportarPublicadas props={dataFiltros} />
        </Layout>

    );
};

export default ImportarBO;