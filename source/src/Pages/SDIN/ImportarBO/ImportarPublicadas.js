import { FaEye, FaPaperclip, FaRegWindowRestore } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import moment from "moment";
import { Modal } from 'react-bootstrap';
import { arrayToTag } from '../../../Helpers/Obelisco';
//API PIN
import './ImportarBO.css';
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { decode } from 'html-entities'
var b64toBlob = require('b64-to-blob');

const ImportarPublicadas = ({ props }) => {

    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [loadingNormas, setLoadingNormas] = useState(false)
    const [secciones, setSecciones] = useState([])
    const [normas, setNormas] = useState([])
    const [anexos, setAnexos] = useState([])
    const [checkedNormas, setCheckedNormas] = useState([])
    const [organismos, setOrganismos] = useState(null);
    const [estados, setEstados] = useState([]);
    const [normaTipos, setNormaTipos] = useState([]);
    const [normaSubtipos, setNormaSubtipos] = useState([]);
    const [errorImportacion, setErrorImportacion] = useState(false)
    const [importacionExitosa, setImportacionExitosa] = useState(false)
    const [showModalNorma, setShowModalNorma] = useState(false)
    const [normaSeleccionada, setNormaSeleccionada] = useState({})
    const [repas, setRepas] = useState()
    const [analistas, setAnalistas] = useState()
    const [totalResultados, setTotalResultados] = useState(null)
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNorma',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 100,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getNormas()
        }
    }, [paginacion])

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    function checkNorma(e, norma) {
        e.preventDefault();
        if (checkedNormas.includes(norma.idNorma)) {
            setCheckedNormas(checkedNormas.filter(p => p !== norma.idNorma))
        }
        else {
            setCheckedNormas([...checkedNormas, norma.idNorma])
        }
    }

    function checkAll(e, normas) {
        e.preventDefault();
        if (checkedNormas.length < normas.length) {
            setCheckedNormas(normas.map(n => n.idNorma))
        }
        else {
            setCheckedNormas([])
        }
    }

    const obtenerColor = (n) => {
        if (n.importadaBO && n.idNormasEstadoTipoSDIN != 0) {
            return { backgroundColor: "rgba(38, 135, 74, 0.8)", borderRadius: "5px", color: "white", borderRadius: 0 } //verde
        }
        return {}

    }

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const initForm = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit"),
        normaAcronimoReferencia: '',
        idBoletin: '',
        boletinNumero: '',
        idReparticionOrganismo: null,
        idReparticion: null,
        idSeccion: null,
        normaNumero: '',
        normaAnio: '',
        fechaPublicacion: '',
        idNormasEstadoTipo: null,
        idNorma: '',
        idNormaTipo: null,
        idNormaSubtipo: null,
    }
    const [form, setForm] = useState(initForm);

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'boletinNumero':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['boletinNumero']: value
                })
                break;
            case 'idSeccion':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idSeccion']: value
                })
                break;
            case 'normaNumero':
                if (e.target.validity.valid) {
                    value = parseInt(e.target.value);
                    if (isNaN(value)) {
                        value = ''
                    }
                    setForm({
                        ...form,
                        ['normaNumero']: value
                    })
                }
                break;
            case 'fechaPublicacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaPublicacion']: value
                })
                break;
            case 'idNormasEstadoTipo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNormasEstadoTipo']: value
                })
                break;
            case 'analista':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['analista']: value
                })
                break;
            case 'idNormaTipo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNormaTipo']: value
                })
                break;
            case 'idNormaSubtipo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNormaSubtipo']: value
                })
                break;
        }
    }

    const getNormas = async () => {
        setLoadingNormas(true);

        try {
            let body = { ...form, ...paginacion, ...ordenamiento };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/sdin/normas/bo/publicadas', body, token).then((res) => {
                setNormas(res.data.normas)
                setAnexos(Array.from(res.data.anexos))
                setTotalResultados(res.data.totalNormas)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalNormas / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({ ...auxPaginacion });

            }).catch(function (error) {
                //console.log(error);
            });

            setLoadingNormas(false)
        }
        catch (error) {
            setLoadingNormas(false)
            //console.log(error);
            linkToParams('/', {}, navigate)
        }
    }
    async function getNormaPDF() {
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: normaSeleccionada.normaArchivoOriginalS3Key }, token).then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
        })
            .catch(e => { /* console.log(e) */ })
    }
    async function getArchivoAnexo(key) {
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: key }, token).then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
        })
            .catch(e => { /* console.log(e) */ })
    }
    const TablaPublicadas = ({ normas }) => {
        return (
            <table class="table table-bordered table-hover table-striped" >
                <thead>
                    <tr>
                        <th scope="col">id BO</th>
                        <th scope="col">id SDIN</th>
                        <th scope="col">N° Boletín</th>
                        <th scope="col">Seccion</th>
                        <th scope="col">Org.&nbsp;&nbsp;</th>
                        <th scope="col">Repart.</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Número</th>
                        <th scope="col">Subtipo</th>
                        <th scope="col">F. Publicación</th>
                        <th scope="col">Analista</th>
                        <th scope="col">Estado SDIN</th>
                        <th scope="col"></th>
                        <th scope="col">
                            <input type="checkbox" aria-label="checkbox" checked={checkedNormas.length === normas.length}
                                onClick={(e) => { checkAll(e, normas) }} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        normas.length > 0 ? (
                            normas.map(n => (<>
                                <tr style={obtenerColor(n)}>
                                    <td>{n.idNorma}</td>
                                    <td>{n.idNormaSDIN && n.idNormasEstadoTipoSDIN ? <Link to={'../ficha-norma/' + n.idNormaSDIN} target="_blank">{n.idNormaSDIN}</Link> : '-'}</td>
                                    <td>{n.boletinNumero}</td>
                                    <td>{n.seccionSigla}</td>
                                    <td>{n.siglaOrganismo}</td>
                                    <td>{n.siglaReparticion}</td>
                                    <td>{n.normaTipo}</td>
                                    <td>{n.normaNumero}</td>
                                    <td>{n.normaSubtipo}</td>
                                    <td>{(n?.fechaPublicacion) ? moment(n?.fechaPublicacion).format('DD/MM/YYYY') : "-"}</td>
                                    <td>{n.analista}</td>
                                    <td>{n.idNormasEstadoTipoSDIN !== 0 && decode(n.normasEstadoTipoSDIN)}</td>
                                    <td title="Ir a la Norma">
                                        <button className="btn btn-link btn-sm" onClick={() => { setShowModalNorma(true); setNormaSeleccionada(n) }}>
                                            <FaEye />
                                        </button>
                                    </td>
                                    <td><input checked={checkedNormas.includes(n.idNorma)} type="checkbox" aria-label="checkbox" onClick={(e) => checkNorma(e, n)} /></td>
                                </tr>
                                <tr style={obtenerColor(n)}><td className="sintesis" colspan={100}>{n.normaSumario}</td></tr>
                            </>
                            ))
                        )
                            : (<tr><td>Sin normas...</td></tr>)
                    }
                </tbody>
            </table>
        )
    }

    async function mostrarAnexo(anexo) {
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: anexo.normaAnexoArchivoS3Key }, token).then((res) => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
        }).catch(e => { /* console.log(e) */ })
    }

    function borrarFiltros(e) {
        e.preventDefault()
        setForm({ ...initForm })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log('SUBMIT')
        await getNormas();
        // document.getElementById('boton2').click()
    }

    const handleCantidadNormas = (e) => {
        let auxPaginacion = paginacion;
        auxPaginacion.limite = e;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })

    }

    const handleOrdenamiento = (e) => {
        e.preventDefault();
        let auxOrdenamiento = ordenamiento;
        if (e.target.id === 'campoOrdenar') {
            auxOrdenamiento.campo = String(e.target.value);
            auxOrdenamiento.cambiarOrdenamiento = true;
            setOrdenamiento({ ...auxOrdenamiento })
        }
        else {
            auxOrdenamiento.orden = String(e.currentTarget.value);
            auxOrdenamiento.cambiarOrdenamiento = true;
            setOrdenamiento({ ...auxOrdenamiento })
        }
    }

    const handleImportarNormas = async (e) => {
        e.preventDefault();
        setImportacionExitosa(false);
        setErrorImportacion(false);
        let body = {
            normas: [...checkedNormas],
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            usuario: localStorage.getItem("user_cuit"),
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/sdin/normas/bo/publicadas/importar', body, token).then(_ => {
            setImportacionExitosa(true);
            setCheckedNormas([])
        }).catch(e => { setErrorImportacion(true); return; })
        await getNormas();
        setCheckedNormas([])
    }

    const [puedoGuardar, setPuedoGuardar] = useState(false);

    const descargarDigitalizacion = async (e) => {

        e.preventDefault();
        setPuedoGuardar(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idNorma: normaSeleccionada.idNorma
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/norma/vista-previa', body, token)
                .then(res => {
                    let blob = b64toBlob(res.data, 'application/pdf')
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `${normaSeleccionada.normaAcronimoReferencia}_vistaprevia.pdf`
                    link.click()
                    setPuedoGuardar(false);

                })
                .catch(function (error) {
                    // console.log(error);
                    setPuedoGuardar(false);
                });
        }
        catch (error) {
            // console.log(error);
            setPuedoGuardar(false);
        }

    }

    const mostrarEditor = () => {
        // console.log('EL DOC')
        //console.log(content.normaDocumento)
        return (<>

            {parseInt(JSON.parse(localStorage.getItem("vistas"))[0].idPerfil) === 9 && (normaSeleccionada.normaDocumento !== null && normaSeleccionada.normaDocumento !== '') ? <div className="botones">
                <button className="btn btn-link btn-sm m-2" id="boton-descargar-pdf" onClick={(e) => descargarDigitalizacion(e)} >
                    Archivo Digitalizado
                </button>
            </div> : <div>Esta Norma no tiene digitalización</div>}
        </>)
    }

    useEffect(async () => {
        //console.log(ordenamiento)
        if (ordenamiento.cambiarOrdenamiento) {
            await getNormas();
            setOrdenamiento({
                ...ordenamiento,
                ['cambiarOrdenamiento']: false
            })
        }
    }, [ordenamiento])

    useEffect(() => {
        //console.log(form)
    }, [form])

    useEffect(() => {
        if (props && props.secciones) setSecciones(props.secciones)
        if (props && props.organismos) setOrganismos(props.organismos)
        if (props && props.estados) setEstados(props.estados)
        if (props && props.normaTipos) setNormaTipos(props.normaTipos)
        if (props && props.repas) setRepas(props.organismos)
        if (props && props.normaSubtipos) setNormaSubtipos(props.normaSubtipos)
        if (props && props.analistas) setAnalistas(props.analistas)
    }, [props])

    //Hook inicial
    useEffect(async () => {
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5 pt-1" id="pagina-importar-BO">
                    <div className="accordion" id="accordion">
                        <div className="card">
                            <button
                                id="boton2"
                                className="card-header card-link"
                                data-toggle="collapse"
                                data-target="#collapse1"
                            >
                                PUBLICADAS
                            </button>
                            <div id="collapse1" className="collapse show" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                        <form className="form" onSubmit={e => handleSubmit(e)}>
                                            <div className="form-group">
                                                <label for="boletinNumero">Número de Boletín</label>
                                                <input type="text" className="form-control" id="boletinNumero" name="boletinNumero" pattern="[0-9]*"
                                                    onChange={e => handleFormChange(e)} value={form.boletinNumero} />
                                            </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Sección</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                ><option selected value=""></option>
                                                    {secciones && (secciones.length > 0) ? (
                                                        secciones.filter(p => p.esImportablePorSDIN === 1).map((p, index) => (
                                                            <option value={p.idSeccion} key={'opt-sec-' + index}>{p.seccion}</option>
                                                        ))
                                                    ) : (
                                                        <option selected disabled>No hay secciones para mostrar</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idNormaTipo">Tipo de Norma</label>
                                                <select className="custom-select" id="idNormaTipo" name="idNormaTipo"
                                                    onChange={e => handleFormChange(e)} value={(form.idNormaTipo != null) ? form.idNormaTipo : -1}
                                                ><option selected value=""></option>
                                                    {normaTipos && (normaTipos.length > 0) ? (
                                                        normaTipos.map((p, index) => (

                                                            <option value={p.idNormaTipo} key={'opt-sec-' + index}>{p.normaTipo}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay organismos para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idNormaSubtipo">Subtipo</label>
                                                <select className="custom-select" id="idNormaSubtipo" name="idNormaSubtipo"
                                                    onChange={e => handleFormChange(e)} value={(form.idNormaSubtipo != null) ? form.idNormaSubtipo : -1}
                                                ><option selected value=""></option>
                                                    {normaSubtipos && (normaSubtipos.length > 0) ? (
                                                        normaSubtipos.map((p, index) => (

                                                            <option value={p.idNormaSubtipo} key={'opt-sec-' + index}>{p.normaSubtipo}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay organismos para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaPublicacion">Fecha Publicación</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaPublicacion"
                                                    name="fechaPublicacion"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaPublicacion}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label for="">Número Norma</label>
                                                <input type="text" className="form-control" id="normaNumero" name="normaNumero" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.normaNumero} />
                                            </div>
                                            <div className="form-group">
                                                <label for="analista">Analista</label>
                                                <select className="form-control" id="analista" name="analista"
                                                    onChange={e => handleFormChange(e)} value={form.analista ? form.analista : ''}>
                                                    <option value={''}></option>
                                                    {analistas?.length > 0 && analistas.map(n =>
                                                        <option value={n.idUsuario} key={'analista-' + n.idUsuario}>
                                                            {n.apellidoNombre ? decode(n.apellidoNombre) : n.mig_nombre}
                                                        </option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idNormasEstadoTipo">Estado SDIN</label>
                                                <select className="custom-select" id="idNormasEstadoTipo" name="idNormasEstadoTipo" onChange={e => handleFormChange(e)} value={(form.idNormasEstadoTipo != null) ? form.idNormasEstadoTipo : -1}
                                                ><option selected value=""></option>
                                                    {estados && (estados.length > 0) ? (
                                                        estados.map((p, index) =>
                                                            <option value={p.idNormasEstadoTipo} key={'opt-sec-' + index}>{decode(p.normasEstadoTipo)}</option>
                                                        )

                                                    ) : (<option selected disabled>No hay estados para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div class="btn btn-link" onClick={(e) => borrarFiltros(e)} id="boton-borrar-filtros">Borrar Filtros</div>
                                            <button className="btn btn-primary" type="submit" id="boton-buscar">Buscar</button>
                                        </form>
                                    </div>
                                    {normas && (normas.length > 0) ? (
                                        (loadingNormas) ? (<Spinner />) : (
                                            <div class="resultados">
                                                <hr />
                                                <div class="titulo">
                                                    <h3>Resultados de la búsqueda ({totalResultados}):</h3>
                                                    <div>
                                                        <label for="idNorma">Mostrar: </label>
                                                        &nbsp;&nbsp;
                                                        <select value={paginacion.limite} className="custom-select" id="cantidadNormas" name="cantidadNormas" onChange={(e) => { handleCantidadNormas(e.target.value) }}>
                                                            <option value={100}>{100}</option>
                                                            <option value={300}>{300}</option>
                                                            <option value={500}>{500}</option>
                                                            <option value={1000}>{1000}</option>

                                                        </select>
                                                    </div>
                                                </div>
                                                <TablaPublicadas normas={normas} />
                                                <br />
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
                                            </div>
                                        )) : (totalResultados === 0 ? <span className="alert alert-primary">No se encontraron resultados...</span> : '')}
                                    <div class="row justify-content-center">
                                        <button className="btn btn-lg btn-success" hidden={!checkedNormas.length > 0}
                                            disabled={normas.filter(n => checkedNormas.includes(n.idNorma) && (n.importadaBO === 1 && n.idNormasEstadoTipoSDIN)).length > 0}
                                            onClick={(e) => handleImportarNormas(e)}>Importar Seleccionadas</button>
                                    </div>
                                    <div className="alert alert-success mt-1" hidden={!importacionExitosa}>Las normas seleccionadas fueron importadas correctamente.</div>
                                    <div className="alert alert-danger mt-1" hidden={!errorImportacion}>Ocurrió un error.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {normaSeleccionada && <Modal show={showModalNorma} onHide={() => setShowModalNorma(false)}>
                    <Modal.Header>
                        <Modal.Title>Detalles BO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="datos">
                            <h4 className="dato">Id Norma: <span class="badge badge-success">{normaSeleccionada.idNorma}</span></h4>
                            <h4 className="dato">Nombre: <span class="badge badge-success">{normaSeleccionada.normaAcronimoReferencia}</span></h4>
                            <h4 className="dato">Número:<span class="badge badge-secondary">{normaSeleccionada.normaNumero}</span> </h4>
                            <h4 className="dato">Año: <span class="badge badge-secondary">{normaSeleccionada.normaAnio}</span></h4>
                            <h4 className="dato">Tipo de Norma: <span class="badge badge-secondary">{normaSeleccionada.normaTipo}</span></h4>
                            <h4 className="dato">Subtipo: <span class="badge badge-secondary">{normaSeleccionada.normaSubtipo}</span></h4>
                            {normaSeleccionada.fechaDesde && <h4 className="dato">Fecha Desde: <span class="badge badge-secondary">{normaSeleccionada.fechaDesde}</span></h4>}
                            {normaSeleccionada.fechaHasta && <h4 className="dato">Fecha Hasta: <span class="badge badge-danger">{normaSeleccionada.fechaHasta}</span></h4>}
                            {normaSeleccionada.fechaSugerida && <h4 className="dato">Fecha Sugerida: <span class="badge badge-secondary">{moment(normaSeleccionada.fechaSugerida).format('DD/MM/YYYY')}</span></h4>}
                            {normaSeleccionada.fechaLimite && <h4 className="dato">Fecha Limite: <span class="badge badge-danger">{moment(normaSeleccionada.fechaLimite).format('DD/MM/YYYY')}</span></h4>}
                            {normaSeleccionada.fechaPublicacion && <h4 className="dato">Fecha de Publicacion: <span class="badge badge-danger">{moment(normaSeleccionada.fechaPublicacion).format('DD/MM/YYYY')}</span></h4>}
                            <h4 className="dato">Fecha Carga: <span class="badge badge-secondary">{normaSeleccionada.fechaCarga}</span></h4>
                            <h4 className="dato">Usuario de Carga: <span class="badge badge-secondary">{normaSeleccionada.apellidoNombre}</span></h4>
                            <h4 className="dato">Reparticion:<span class="badge badge-secondary">{normaSeleccionada.reparticion}</span> </h4>
                            <h4 className="dato">Organismo:<span class="badge badge-secondary">{normaSeleccionada.organismo}</span> </h4>
                            <h4 className="dato">Sección:<span class="badge badge-secondary">{normaSeleccionada.seccion}</span> </h4>
                            <h4 className="dato">Tags: {(normaSeleccionada.tags != '') ? arrayToTag(normaSeleccionada.tags) : <></>}</h4>
                        </div>
                        <h4><u>Documento: </u></h4><div className="btn btn-link btn-sm m-2" onClick={() => getNormaPDF()}>
                            Ver Documento
                            <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                        </div>
                        {anexos && (anexos.filter(n => n.idNorma === normaSeleccionada.idNorma)).length > 0 &&
                            <>
                                <h4><u>Anexos</u></h4>
                                <ul>
                                    {(anexos.filter(n => n.idNorma === normaSeleccionada.idNorma)).map((anexo, index) => (
                                        <li><div
                                            className="btn btn-link btn-sm m-2"
                                            onClick={() => getArchivoAnexo(anexo.normaAnexoArchivoS3Key)}>
                                            {anexo.normaAnexoArchivo}
                                            <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                        </div></li>
                                    ))}
                                </ul>
                            </>}
                        <h4><u>Digitalización: </u></h4>
                        {
                            mostrarEditor()
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-link" onClick={() => setShowModalNorma(false)}>
                            Volver
                        </button>
                    </Modal.Footer>
                </Modal>}
            </>
        );

    }

};



export default ImportarPublicadas;

