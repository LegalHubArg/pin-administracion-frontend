import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa'
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import './GenerarBoletin.css';
import config from '../../config.js'
import { Modal } from 'react-bootstrap';
import { rutasBO } from '../../routes';
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import { ExportarExcel } from '../../Components/Dropdown/ExportarExcel';
import { Pagination } from '@gcba/obelisco'

const b64toBlob = require('b64-to-blob');

const BoletinesPublicados = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [loadingBoletines, setLoadingBoletines] = useState(false)
    const [boletinesPublicados, setBoletinesPublicados] = useState([])
    const [totalResultados, setTotalResultados] = useState(0)

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getBoletinesPublicados()
        }
    }, [paginacion])

    const [puedoGuardar, setPuedoGuardar] = useState(false);

    const AccionesBoletin = ({ boletin }) => {
        return (
            <>
                <a class="btn btn-success btn-sm mr-2" href={boletin.documento_publico} target="_blank" disabled={puedoGuardar}>Ir al Boletín</a>
                <button type="button" class="btn btn-link btn-sm mr-2" onClick={() => navigate(rutasBO.ver_documentos_bo, { state: boletin })} disabled={puedoGuardar}>Ver Documentos</button>
            </>
        )
    }

    const getBoletinesPublicados = async () => {
        let body = {
            ...paginacion
        }
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerBoletinesPublicados', body, token).then(res => {
                setBoletinesPublicados(res.data.data)
                setTotalResultados(res.data.totalBoletines)
                setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
            })
        }
        catch (error) {
        }
    }

    const handlePaginacion = (page) => {
        setPaginacion((prevPaginacion) => ({
            ...prevPaginacion,
            paginaActual: page + 1,
            cambiarPagina: true
        }));
    };

    useEffect(() => {
        setLoading(true)
        getBoletinesPublicados()
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <div id="pagina-crear-boletin">
                <header className="pt-4 pb-3 mb-4">
                    <div className="container">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                                <li className="breadcrumb-item">Boletines Publicados</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Boletines Publicados</h1>
                    </header>
                    <hr class="mb-4" />
                    <div className="d-flex justify-content-between">
                        <h3 className="mb-3">Boletines Oficiales ({totalResultados}):</h3>
                        <ExportarExcel ruta="/api/v1/boletin-oficial/boletin/publicados/exportar" className="align-self-top" />
                    </div>
                    {boletinesPublicados && boletinesPublicados.length > 0 ? (<><table class="table mb-3">
                        <thead>
                            <tr>
                                <th scope="col">idBoletin</th>
                                <th scope="col">Fecha De Publicación</th>
                                <th scope="col">Nro</th>
                                <th scope="col">Estado</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {boletinesPublicados.map(b => (
                                <tr>
                                    <td>{b.idBoletin}</td>
                                    <td>{moment(b.fechaPublicacion).format('DD/MM/YYYY')}</td>
                                    <td>{b.numero}</td>
                                    <td><span class="badge badge-info">{b.estado}</span></td>
                                    <td class="text-right">
                                        <AccionesBoletin boletin={b} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => handlePaginacion(page)} />
                    </>) : ('')}
                </div>
            </div>
        );

    }

};

export default BoletinesPublicados;
