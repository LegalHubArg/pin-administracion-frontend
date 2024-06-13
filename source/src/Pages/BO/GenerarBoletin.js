import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa'
import { linkToParams } from "../../Helpers/Navigation";
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
import { FiX } from 'react-icons/fi';

const b64toBlob = require('b64-to-blob');

const CrearBoletin = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [loadingBoletines, setLoadingBoletines] = useState(false)
    const [validaForm, setValidaForm] = useState(false)
    const [boletinCreado, setBoletinCreado] = useState(false)
    const [boletinesEnEdicion, setBoletinesEnEdicion] = useState([])
    const [boletinExistente, setBoletinExistente] = useState({})
    const [boletinBorrar, setBoletinBorrar] = useState({})
    const [modalConfirmarDescarga, setModalConfirmarDescarga] = useState({ show: false, idBoletin: null })
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false)
    const [totalResultados, setTotalResultados] = useState(0)
    const [errorBoletin, setErrorBoletin] = useState({ show: false, error: '' })
    const [usuarioFirma, setUsuarioFirma] = useState(false)

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getBoletinesEnEdicion()
        }
    }, [paginacion])

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    const [puedoGuardar, setPuedoGuardar] = useState(false);

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const [form, setForm] = useState({
        usuario: localStorage.idUsuarioBO,
        fechaPublicacion: null,
        confirmaFecha: false
    })

    const confirmarFechaCreacion = (e) => {
        e.preventDefault();
        setForm({
            ...form,
            ['confirmaFecha']: true
        })
        setShowModalConfirmacion(false)
    }

    const ModalBorrarBoletin = () => {
        let fechaPublicacion = moment(boletinBorrar.fechaPublicacion).format('DD/MM/YYYY')
        return (
            <div class="modal fade" tabIndex="-1" role="dialog" id="modalBorrarBoletin">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                Advertencia
                            </h4>
                        </div>
                        <div class="modal-body">
                            <p>
                                Está seguro que quiere borrar este Boletin?
                            </p>
                            <table class="table" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>idBoletin</th>
                                        <th>Fecha de Publicación</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{boletinBorrar.idBoletin}</td>
                                        <td>{fechaPublicacion}</td>
                                        <td><span class="badge badge-info">{boletinBorrar.estado}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-link"
                                data-dismiss="modal"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger"
                                onClick={(e) => handleBorrar(e, boletinBorrar.idBoletin)}>
                                Sí, borrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )

    }

    const AccionesBoletin = ({ boletin }) => {
        switch (boletin.idBoletinEstadoTipo) {
            case 1:
                return (
                    <>
                        <button type="button" class="btn btn-success btn-sm mr-2" onClick={() => { navigate(rutasBO.diseniador_bo, { state: { idBoletin: boletin.idBoletin } }) }} disabled={puedoGuardar}>Ir al Boletín</button>
                        <button type="button" class="btn btn-primary btn-sm mr-2" onClick={(e) => handlePDF(e, boletin.idBoletin, boletin.fechaPublicacion)} disabled={puedoGuardar}>Vista Previa</button>
                        {/* <button type="button" class="btn btn-primary btn-sm mr-2" onClick={(e) => handleDOC(e, boletin.idBoletin, boletin.fechaPublicacion)} disabled={puedoGuardar}>Guardar DOC</button> */}
                        <button type="button" class="btn btn-link btn-sm mr-2" onClick={(e) => handleDownload(e, boletin.idBoletin)} disabled={puedoGuardar}>Descargar</button>
                        <button type="button" class="btn btn-danger btn-sm"
                            data-toggle="modal"
                            data-target="#modalBorrarBoletin"
                            onClick={() => setBoletinBorrar(boletin)}
                            disabled={puedoGuardar}
                        >
                            Borrar <FaTrashAlt />
                        </button>
                    </>
                )
            case 2:
                return (
                    <>
                        <button type="button" class="btn btn-success btn-sm mr-2" onClick={() => { navigate(rutasBO.diseniador_bo, { state: { idBoletin: boletin.idBoletin } }) }} disabled={puedoGuardar}>Ir al Boletín</button>
                        <button type="button" class="btn btn-secondary btn-sm mr-2" onClick={(e) => anularDescargaBoletin(e, boletin.idBoletin)} disabled={puedoGuardar}>Anular Descarga</button>
                        <button type="button" class="btn btn-link btn-sm mr-2" onClick={(e) => handleFormDescarga(e, boletin.idBoletin, boletin.fechaPublicacion, boletin.numero)} disabled={puedoGuardar}>Detalle de Boletin</button>
                        {usuarioFirma && <button type="button" class="btn firmar-boletin btn-sm" onClick={() => navigate(rutasBO.firmar_bo, { state: { boletin } })} disabled={puedoGuardar}>Firmar Boletin</button>
                        }
                    </>
                )
            case 3:
                return (
                    <>
                        <button type="button" class="btn btn-success btn-sm mr-2" onClick={() => { navigate(rutasBO.diseniador_bo, { state: { idBoletin: boletin.idBoletin } }) }} disabled={puedoGuardar}>Ir al Boletín</button>
                        {/* <button type="button" class="btn btn-secondary btn-sm mr-2" onClick={(e) => anularFirmaBoletin(e, boletin.idBoletin)} >Anular Firma</button> */}
                        <button type="button" class="btn btn-link btn-sm mr-2" onClick={() => navigate(rutasBO.ver_documentos_bo, { state: boletin })} disabled={puedoGuardar}>Ver Documentos</button>
                        {usuarioFirma && <button type="button" class="btn firmar-boletin btn-sm" onClick={(e) => handlePublicar(e, boletin.idBoletin)} disabled={puedoGuardar}>Publicar Boletin</button>}
                    </>
                )
            case 4:
            case 6:
                return (
                    <>
                        <button type="button" class="btn btn-success btn-sm mr-2" onClick={() => { window.open('http://api-restboletinoficial.buenosaires.gob.ar/download/' + boletin.mig_fileserver_id) }} disabled={puedoGuardar}>Ir al Boletín</button>
                        <button type="button" class="btn btn-link btn-sm mr-2" onClick={() => navigate(rutasBO.ver_documentos_bo, { state: boletin })} disabled={puedoGuardar}>Ver Documentos</button>
                    </>
                )
            default:
                return (<></>);
        }
    }

    const nuevoBoletin = async () => {
        setBoletinCreado(false)
        setLoading(true)
        try {
            let body = form
            //console.log(body)
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/crear', body, token).then(async (res) => {
                setForm({
                    ...form,
                    ['confirmaFecha']: false
                })
                setLoading(false)
                setBoletinCreado(true)
            }).catch(e => { throw e })
        }
        catch (err) {
            setLoading(false)
            //console.log(error)
            if (err.data.existeBoletin) {
                setBoletinExistente(err.data.boletin)
            }
            else {
                setBoletinCreado()
                setErrorBoletin({ show: true, error: err.data.mensaje })
            }
        }
    }
    //Hook para abrir el modal de confirmación
    useEffect(() => {
        if (Object.keys(boletinExistente).length > 0) {
            setShowModalConfirmacion(true)
        }
    }, [boletinExistente])

    const getBoletinesEnEdicion = async () => {
        setLoadingBoletines(true)
        let body = {
            ...paginacion
        }
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerBoletinesEnEdicion', body, token).then(res => {
                setBoletinesEnEdicion(res.data.data)
                setTotalResultados(res.data.totalBoletines)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalBoletines / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({ ...auxPaginacion });
                //console.log(res)
                setLoadingBoletines(false)
            }).catch(e => { throw e })
            await ApiPinGet('/api/v1/auth/usuario-firma', localStorage.getItem('token'))
                .then(_ => setUsuarioFirma(true))
                .catch(_ => setUsuarioFirma(false))

        }
        catch (error) {
            setLoadingBoletines(false)
            //console.log(error)
        }
    }

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'fechaPublicacion':
                value = (e.target.value);
                setForm({
                    ...form,
                    ['fechaPublicacion']: value
                });
                break;
        }
    }

    useEffect(async () => {
        //console.log(form)
        if (form &&
            form.fechaPublicacion !== null &&
            form.fechaPublicacion !== '') {
            setValidaForm(true)
        }
        else {
            setValidaForm(false)
        }
        if (form && form.confirmaFecha === true) {
            await nuevoBoletin();
            await getBoletinesEnEdicion();

        }
    }, [form])

    useEffect(() => {
        getBoletinesEnEdicion()
        setLoading(false)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidaForm(false);
        await nuevoBoletin();
        //console.log('SUBMIT')
        setValidaForm(true);
        await getBoletinesEnEdicion();

    }

    const handleDownload = async (e, idBoletin, confirmaDescarga) => {
        e.preventDefault();
        if ((boletinesEnEdicion.filter(boletin => boletin.idBoletinEstadoTipo === 2 || boletin.idBoletinEstadoTipo === 3).length === 0) || confirmaDescarga) {
            setLoading(true)
            setModalConfirmarDescarga({ show: false, idBoletin: null })
            try {
                let body = {
                    usuario: localStorage.idUsuarioBO,
                    idBoletin: idBoletin
                }
                let token = localStorage.getItem("token");
                await ApiPinPost('/api/v1/boletin-oficial/boletin/descargar', body, token)
                    .then(res => {
                        //console.log(res)
                        window.location.reload();
                    })
                    .catch(function (error) {
                        throw error
                    });
            }
            catch (error) {
                const mensaje = error?.data?.mensaje ? error.data.mensaje : "Ocurrió un error al intentar descargar el Boletín."
                setModalError({ show: true, mensaje })
            }
            setLoading(false)
        }
        else {
            setModalConfirmarDescarga({ show: true, idBoletin })
        }
    }

    const handleBorrar = async (e, idBoletin) => {
        e.preventDefault();
        try {
            let body = {
                usuario: parseInt(localStorage.idUsuarioBO),
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/borrar', body, token)
                .then(res => {
                    //console.log(res)
                    window.location.reload();
                })
                .catch(function (error) {
                    //console.log(error);
                });
        }
        catch (error) {
            //console.log(error);
        }
    }

    const handlePublicar = async (e, idBoletin) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.idUsuarioBO,
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/publicar', body, token)
                .then(res => {
                    //console.log(res)
                    window.location.reload();
                })
                .catch(function (error) {
                    //console.log(error);
                });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            //console.log(error);
        }
    }

    const handleFormDescarga = (e, idBoletin, fechaPublicacion, numero) => {
        e.preventDefault();
        navigate(rutasBO.detalle_boletin, { state: { idBoletin: idBoletin, fechaPublicacion: fechaPublicacion, boletinNumero: numero } })

    };

    const [modalError, setModalError] = useState({ show: false, mensaje: '' })
    const handlePDF = async (e, idBoletin, fechaPublicacion) => {
        e.preventDefault();
        setPuedoGuardar(true)
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/vista-previa', body, token)
                .then(res => {
                    let blob = b64toBlob(res.data, 'application/pdf')
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    const today = moment(fechaPublicacion)
                    let mes = today.format('MM');
                    let dia = today.format('DD');
                    let anio = today.format('YYYY');
                    link.target = '_blank'
                    /* link.download = `${anio}${mes}${dia}.pdf` */
                    link.click()
                    setPuedoGuardar(false)

                })
                .catch(function (error) {
                    throw error
                });
        }
        catch (error) {
            let mensajeError = error?.data?.data && typeof error?.data?.data === "string" ? error?.data?.data
                : 'Ocurrió un error al generar la vista previa del boletín.';
            setPuedoGuardar(false)
            setModalError({ show: true, mensaje: mensajeError })
        }
    }

    const handleDOC = async (e, idBoletin, fechaPublicacion) => {
        e.preventDefault();
        setPuedoGuardar(true)
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/vista-previa-doc', body, token)
                .then(res => {
                    let blob = b64toBlob(res.data, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    const today = moment(fechaPublicacion)
                    let mes = today.format('MM');
                    let dia = today.format('DD');
                    let anio = today.format('YYYY');

                    link.download = `${anio}${mes}${dia}.docx`
                    link.click()
                    setPuedoGuardar(false)

                })
                .catch(function (error) {
                    //console.log(error);
                    setPuedoGuardar(false)
                });
        }
        catch (error) {
            setPuedoGuardar(false)
            //console.log(error);
        }
    }

    const anularDescargaBoletin = async (e, idBoletin) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.idUsuarioBO,
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/anularDescarga', body, token)
                .then(res => {
                    //console.log(res)
                    window.location.reload();
                })
            setLoading(false)
        }
        catch (error) {
            setModalError({ show: true, mensaje: error?.data?.mensaje })
            setLoading(false)
        }
    }


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
                                <li className="breadcrumb-item">Generar BO</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Generar BO</h1>
                    </header>
                    <hr class="mb-4" />
                    <div className="container responsive">
                        <form className="form form-creacion mb-4" onSubmit={e => handleSubmit(e)}>
                            <div>
                                <label for="fechaPublicacion"><strong>Fecha de Publicación</strong></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="fechaPublicacion"
                                    name="fechaPublicacion"
                                    aria-describedby="date-help"
                                    value={form.fechaPublicacion}
                                    onChange={(e) => handleFormChange(e)}
                                    required
                                />
                            </div>
                            <div style={{ marginBlock: "2em" }}>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={!validaForm} id="crear-boletin">
                                    Crear
                                </button>
                            </div>
                        </form>
                        <div class="alert alert-success" role="alert" hidden={!boletinCreado}>
                            <p>Boletin Oficial creado correctamente.</p>
                        </div>
                        {errorBoletin?.show && <div class="alert alert-danger" role="alert">
                            <p>{errorBoletin.error}</p>
                        </div>}
                        <hr class="mb-4" />
                        {loadingBoletines ? <Spinner /> : <>
                            <div className="d-flex justify-content-between">
                                <h3 className="mb-3">Boletines Oficiales ({totalResultados}):</h3>
                                <ExportarExcel ruta="/api/v1/boletin-oficial/boletin/exportar" className="align-self-top" />
                            </div>
                            <table class="table mb-3">
                                <thead>
                                    <tr>
                                        <th scope="col">id</th>
                                        <th scope="col">Fecha De Publicación</th>
                                        <th scope="col">Nro</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boletinesEnEdicion && boletinesEnEdicion.length > 0 ? (
                                        boletinesEnEdicion.map(b => (
                                            <tr>
                                                <td>{b.idBoletin}</td>
                                                <td>{moment(b.fechaPublicacion).format('DD/MM/YYYY')}</td>
                                                <td>{b.numero}</td>
                                                <td><span class="badge badge-info">{b.estado}</span></td>
                                                <td class="text-right">
                                                    <AccionesBoletin boletin={b} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : ('')}
                                </tbody>
                            </table>
                            {(paginacion) ? (
                                <nav aria-label="Paginacion" className="d-flex justify-content-center">
                                    <ul class="pagination">
                                        {(paginacion.paginaActual === 1) ? (
                                            <>
                                                <li class="page-item disabled">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, 1)}>
                                                        <span class="page-previous-text"><BiFirstPage size="2em" title="Primera Página" /></span>
                                                    </a>
                                                </li>
                                                <li class="page-item disabled">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.paginaActual - 1)}>
                                                        <span class="page-previous-text">Anterior</span>
                                                        <span class="page-previous-icon" aria-hidden="true"></span>
                                                    </a>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li class="page-item">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, 1)}>
                                                        <span class="page-previous-text"><BiFirstPage size="2em" title="Primera Página" /></span>
                                                    </a>
                                                </li>
                                                <li class="page-item">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.paginaActual - 1)}>
                                                        <span class="page-previous-text">Anterior</span>
                                                        <span class="page-previous-icon" aria-hidden="true"></span>
                                                    </a>
                                                </li>
                                            </>
                                        )}
                                        {(paginacion.totalPaginas < 5) ? (paginacion.botones.map(btn =>
                                            (paginacion.paginaActual === btn) ? (
                                                <li class="page-item active">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, btn)}>{btn}</a>
                                                </li>
                                            ) : (
                                                <li class="page-item">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, btn)}>{btn}</a>
                                                </li>
                                            )
                                        )
                                        ) : (
                                            (paginacion.botones.filter(b =>
                                            (b >= (paginacion.paginaActual - 4) &&
                                                b < (paginacion.paginaActual + 4))))
                                                .map(btn =>
                                                    (paginacion.paginaActual === btn) ? (
                                                        <li class="page-item active">
                                                            <a class="page-link" onClick={(e) => cambiarPagina(e, btn)}>{btn}</a>
                                                        </li>
                                                    ) : (
                                                        <li class="page-item">
                                                            <a class="page-link" onClick={(e) => cambiarPagina(e, btn)}>{btn}</a>
                                                        </li>
                                                    )
                                                )
                                        )}
                                        {(paginacion.paginaActual === paginacion.totalPaginas) ? (
                                            <>
                                                <li class="page-item disabled">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.paginaActual + 1)}>
                                                        <span class="page-next-text">Siguiente</span>
                                                        <span class="page-next-icon" aria-hidden="true"></span>
                                                    </a>
                                                </li>
                                                <li class="page-item disabled">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.totalPaginas)}>
                                                        <span class="page-next-text"><BiLastPage size="2em" title="Última Página" /></span>
                                                    </a>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li class="page-item">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.paginaActual + 1)}>
                                                        <span class="page-next-text">Siguiente</span>
                                                        <span class="page-next-icon" aria-hidden="true"></span>
                                                    </a>
                                                </li>
                                                <li class="page-item">
                                                    <a class="page-link" onClick={(e) => cambiarPagina(e, paginacion.totalPaginas)}>
                                                        <span class="page-next-text"><BiLastPage size="2em" title="Última Página" /></span>
                                                    </a>
                                                </li>
                                            </>
                                        )
                                        }
                                    </ul>
                                </nav>)
                                : ('')}
                        </>}
                        <ModalBorrarBoletin />
                    </div>
                </div>

                {boletinExistente && form && showModalConfirmacion && <Modal show={showModalConfirmacion} onHide={() => setShowModalConfirmacion(false)}>
                    <Modal.Header>
                        <Modal.Title>Advertencia</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Ya existe un Boletín creado para la fecha <strong>{moment(form.fechaPublicacion).format('DD/MM/YYYY')}</strong>
                        </p>
                        {boletinExistente && <table class="table" style={{ fontSize: 12 }}>
                            <thead>
                                <tr>
                                    <th>idBoletin</th>
                                    <th>Fecha de Publicación</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{boletinExistente.idBoletin}</td>
                                    <td>{moment(boletinExistente.fechaPublicacion).format('DD/MM/YYYY')}</td>
                                    <td><span class="badge badge-info">{boletinExistente.boletinEstadoTipo}</span></td>
                                </tr>
                            </tbody>
                        </table>}
                        <br />
                        <h4>Desea crear uno nuevo de todas formas?</h4>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-link" onClick={() => setShowModalConfirmacion(false)}>
                            Cerrar
                        </button>
                        <button className="btn btn-primary" onClick={(e) => confirmarFechaCreacion(e)}>
                            Confirmar
                        </button>
                    </Modal.Footer>
                </Modal>}
                <Modal show={modalError.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
                    <Modal.Header>
                        <Modal.Title>Error</Modal.Title>
                        <FiX type="button" style={{ alignSelf: "center" }} onClick={() => setModalError({ show: false, mensaje: '' })} />
                    </Modal.Header>
                    <Modal.Body>
                        <div className="alert alert-danger mb-4 mt-3" >{modalError.mensaje}</div>
                    </Modal.Body>
                </Modal>
                <Modal show={modalConfirmarDescarga.show} onHide={() => setModalConfirmarDescarga({ show: false, idBoletin: null })}>
                    <Modal.Header>
                        <Modal.Title>Advertencia</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Ya existe otro Boletín Descargado o Firmado en este momento,
                            si continúa con la descarga ambos tendrán el mismo número.</p>
                        <table class="table" style={{ fontSize: 11 }}>
                            <thead>
                                <tr>
                                    <th>idBoletin</th>
                                    <th>Fecha de Publicación</th>
                                    <th>Nro</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boletinesEnEdicion && boletinesEnEdicion.map(boletin =>
                                    (boletin.idBoletinEstadoTipo === 2 || boletin.idBoletinEstadoTipo === 3) ? (
                                        <tr>
                                            <td>{boletin.idBoletin}</td>
                                            <td>{moment(boletin.fechaPublicacion).format("DD/MM/YYYY")}</td>
                                            <td>{boletin.numero}</td>
                                            <td><span class="badge badge-info">{boletin.estado}</span></td>
                                        </tr>
                                    ) : ('')
                                )}
                            </tbody>
                        </table>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-link" onClick={() => setModalConfirmarDescarga({ show: false, idBoletin: null })}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary" onClick={(e) => handleDownload(e, modalConfirmarDescarga.idBoletin, true)}> {/* tercer param: confirmaDescarga */}
                            Descargar
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

    }

};

export default CrearBoletin;
