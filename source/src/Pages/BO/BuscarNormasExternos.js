import { FaEye, FaPaperclip, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import './BuscarNormasBO.css';
import ModalFechaLimite from '../../Components/Modales/ModalFechaLimite'
import ModalAsociarAviso from '../../Components/Modales/ModalAsociarAviso'
import { rutasBO } from "../../routes";
import { SiMicrosoftexcel } from 'react-icons/si'
import { Pagination } from "@gcba/obelisco"
var b64toBlob = require('b64-to-blob');

const BuscarNormasBO = props => {

    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [totalResultados, setTotalResultados] = useState(0)
    const [loadingNormas, setLoadingNormas] = useState(false)
    const [reparticion, setReparticion] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [cuenta, setCuenta] = useState([])
    const [secciones, setSecciones] = useState([])
    const [normas, setNormas] = useState([])
    const [anexos, setAnexos] = useState([])
    const [organismos, setOrganismos] = useState(null);
    const [tipos, setTipos] = useState(null)
    const [subtipos, setSubtipos] = useState(null)
    const [estados, setEstados] = useState([]);
    const [exportacion, setExportacion] = useState({ registroDesde: 1, registroHasta: 10000 })
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNorma',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })
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
            await getNormas()
        }
    }, [paginacion])

    const [error, setError] = useState(false)
    if (error) { throw error }

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const initForm = {
        idUsuario: localStorage.getItem('idUsuarioBO'),
        usuario: localStorage.getItem("user_cuit"),
        normaAcronimoReferencia: '',
        idBoletin: '',
        boletinNumero: '',
        idReparticionOrganismo: null,
        idReparticion: null,
        idSeccion: null,
        normaNumero: '',
        normaAnio: '',
        fechaCarga: '',
        fechaLimite: '',
        fechaSugerida: '',
        fechaAprobacion: '',
        idNormasEstadoTipo: null,
        idNorma: '',
        userCarga: null
    }
    const [form, setForm] = useState(initForm);
    const [normaCambiarFechaLimite, setNormaCambiarFechaLimite] = useState(null)
    const [normaAsociarAviso, setNormaAsociarAviso] = useState(null)

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'idBoletin':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idBoletin']: value
                })
                break;
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
            case 'idNorma':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNorma']: value
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
            case 'normaAnio':
                if (e.target.validity.valid) {
                    value = parseInt(e.target.value);
                    if (isNaN(value)) {
                        value = ''
                    }
                    setForm({
                        ...form,
                        ['normaAnio']: value
                    })
                }
                break;
            case 'fechaSugerida':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaSugerida']: value
                })
                break;
            case 'fechaLimite':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaLimite']: value
                })
                break;
            case 'fechaCarga':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaCarga']: value
                })
                break;
            case 'fechaAprobacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaAprobacion']: value
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
            case 'idReparticionOrganismo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idReparticionOrganismo']: value
                })
                break;
            case 'userCarga':
                value = e.target.value;
                setForm({
                    ...form,
                    ['userCarga']: parseInt(value)
                })
                break;
            case 'organismoEmisor':
                value = e.target.value;
                setForm({
                    ...form,
                    ['organismoEmisor']: value
                })
                break;
            case 'tipoNorma':
                value = e.target.value;
                setForm({
                    ...form,
                    ['idNormaTipo']: parseInt(value)
                })
                break;
            case 'subtipoNorma':
                value = e.target.value;
                setForm({
                    ...form,
                    ['idNormaSubtipo']: parseInt(value)
                })
                break;
        }
    }

    const getSecciones = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/boletin-oficial/sumario/secciones', body, token).then((res) => {
                setSecciones(res.data.data)
            }).catch(function (error) {
                setLoading(false)
                throw error
            });
            setLoading(false)
        }
        catch (error) {
            setError(error.data.mensaje)
        }
    }
    const getEstados = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/estados', body, token).then((res) => {
                setEstados(Array.from(res.data.estados))
            }).catch(function (error) {
                setLoading(false)
                throw error
            });
            setLoading(false)
        }
        catch (error) {
            setError(error?.data?.mensaje ? error.data.mensaje : error)
        }
    }

    const getReparticion = async () => {
        await ApiPinGet('/api/v1/organismos/reparticiones', localStorage.getItem("token"))
            .then((res) => {
                setReparticion(res.data.data)
            })
            .catch()
    }

    const getUsuarios = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idCuenta: JSON.parse(localStorage.getItem("perfiles"))[0].idCuenta
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/usuarios', body, token).then((res) => {
                console.log("USUARIOS", res.data.usuarios)
                setUsuarios(Array.from(res.data.usuarios))
            }).catch(function (error) {
                setLoading(false)
                throw error
            });
            setLoading(false)
        }
        catch (error) {
            setError(error?.data?.mensaje ? error.data.mensaje : error)
        }
    }


    const getNormas = async () => {
        setLoadingNormas(true);

        try {
            let body = { ...form, ...paginacion, ...ordenamiento };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/normas/externos', body, token).then((res) => {
                //setCuenta(res.data.normas[0].nombreCuenta)
                setNormas(Array.from(res.data.normas))
                setAnexos(Array.from(res.data.anexos))
                setTotalResultados(res.data.totalNormas)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalNormas / auxPaginacion.limite);
                setPaginacion({ ...auxPaginacion });

            }).catch(function (error) {
                throw error
            });

            setLoadingNormas(false)
        }
        catch (error) {
            setError(error?.data?.mensaje ? error.data.mensaje : error)
        }
    }

    const getCuenta = async () => {
        setLoadingNormas(true);

        try {
            let body = { ...form, ...paginacion, ...ordenamiento };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/normas/externos', body, token).then((res) => {
                setCuenta(res.data.normas[0].nombreCuenta)
            }).catch(function (error) {
                throw error
            });

            setLoadingNormas(false)
        }
        catch (error) {
            setError(error?.data?.mensaje ? error.data.mensaje : error)
        }
    }

    const getOrganismos = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            let body = {
                idUsuario: localStorage.getItem('idUsuarioBO'),
                idCuenta : JSON.parse(localStorage.perfiles)[0].idCuenta
            }
            await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores-externo',body, token)
                .then((res) => {
                    setOrganismos(Array.from(res.data.data))
                }).catch(function (error) {
                    setLoading(false)
                    throw error;
                });
            setLoading(false)
        }
        catch (error) {
            setError(error)
        }
    }
    const getTipos = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/tipos', body, token)
                .then((res) => {
                    setTipos(Array.from(res.data.data))
                }).catch(function (error) {
                    setLoading(false)
                    throw error;
                });
            setLoading(false)
        } catch (error) {
            setError(error)
        }
    }

    const getSubTipos = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos', body, token)
                .then((res) => {
                    console.log(res.data)
                    setSubtipos(Array.from(res.data.data))
                }).catch(function (error) {
                    setLoading(false)
                    throw error;
                });
            setLoading(false)
        } catch (error) {
            setError(error)
        }
    }

    const TablaNormas = ({ normas }) => {
        return (
            <table class="table table-bordered table-hover" >
                <thead>
                    <tr>
                        <th scope="col">idNorma</th>
                        <th scope="col">Sección</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Subtipo</th>
                        <th scope="col">Organismo</th>
                        <th scope="col">Reparticion</th>
                        <th scope="col">Cuenta</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Número</th>
                        <th scope="col">Año</th>
                        <th scope="col">Fecha Carga</th>
                        <th scope="col">Fecha Sugerida</th>
                        <th scope="col">Fecha Límite</th>
                        <th scope="col">Cotización</th>
                        <th scope="col">Asociación</th>
                        <th scope="col">Estado</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        normas.length > 0 ? (
                            normas.map(n => (
                                <tr>
                                    <td>{n.idNorma}</td>
                                    <td>{n.seccionSigla}</td>
                                    <td>{n.normaTipoSigla}</td>
                                    <td>{n?.normaSubtipoSigla}</td>
                                    <td>{n.organismoEmisor}</td>
                                    <td>{n.siglasReparticiones}</td>
                                    <td>{n.nombreCuenta}</td>
                                    <td>{n.apellidoNombre}</td>
                                    <td>{n.normaNumero}</td>
                                    <td>{n.normaAnio}</td>
                                    <td>{(n.fechaCarga !== null) ? (moment(n.fechaCarga).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{(n.fechaSugerida !== null) ? (moment(n.fechaSugerida).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{(n.fechaLimite !== null) ? (moment(n.fechaLimite).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{n.valorCotizacion}</td>
                                    <td>{n.idNormaAviso}</td>
                                    <td>{n.normasEstadoTipo}</td>
                                    <td title="Ir a la Norma">
                                        <Link target="_blank" to={`${rutasBO.home}/${rutasBO.normas}/${n.idNorma}`}>
                                            <button className="btn btn-link btn-sm">
                                                <FaEye />
                                            </button>
                                        </Link>
                                    </td>
                                    <td title="Ver anexos">
                                        <div class="dropdown-container">
                                            <div class="drowdown">
                                                <button className="btn btn-link btn-sm"
                                                    data-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                >
                                                    <FaPaperclip />
                                                </button>
                                                <div class="dropdown-menu">
                                                    {anexos && (anexos.length > 0) ? (
                                                        (anexos.filter(a => a.idNorma === n.idNorma).length > 0) ? (
                                                            (anexos.filter(a => a.idNorma === n.idNorma)).map(a =>
                                                                <button class="dropdown-item btn-sm"
                                                                    type="button"
                                                                    onClick={() => mostrarAnexo(a)}
                                                                >{a.normaAnexoArchivo}
                                                                </button>
                                                            ))
                                                            : ('No hay anexos disponibles.'))
                                                        : ('')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                            : (<tr><td>Sin normas...</td></tr>)
                    }
                </tbody>
            </table>
        )
    }

    async function mostrarAnexo(anexo) {
        document.body.style.cursor = "wait"
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: anexo.normaAnexoArchivoS3Key }, token).then((res) => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
            document.body.style.cursor = "default"
        }).catch(e => {
            //console.log(e)
            document.body.style.cursor = "default"
        })
    }

    function borrarFiltros(e) {
        e.preventDefault()
        setForm({ ...initForm })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log('SUBMIT')
        await getNormas();
        document.getElementById('boton1').click()
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

    //Hook inicial
    useEffect(async () => {
        await Promise.all([await getSecciones(), await getOrganismos(), await getEstados(), await getReparticion(), await getUsuarios(), await getCuenta(), await getTipos(), await getSubTipos()])
        getNormas()
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-buscar-normas">
                    <div className="accordion" id="accordionExample">
                        <div className="card">
                            <button
                                id="boton1"
                                className="card-header card-link"
                                data-toggle="collapse"
                                data-target="#collapse1"
                            >
                                Filtros de Búsqueda
                            </button>
                            <div id="collapse1" className="collapse show" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                        <form className="form" onSubmit={e => handleSubmit(e)} id="form-buscar-normas">
                                            <div className="form-group">
                                                <label for="idNorma">Id Norma</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form-group">
                                                <label for="boletinNumero">Boletin Nro</label>
                                                <input type="text" className="form-control" id="boletinNumero" name="boletinNumero" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.boletinNumero} />
                                            </div>
                                            <div className="form-group">
                                                <label for="idBoletin">Id Boletin</label>
                                                <input type="text" className="form-control" id="idBoletin" name="idBoletin" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idBoletin} />
                                            </div>
                                            <div className="form-group row-2">
                                                <label for="idSeccion">Sección</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                ><option selected value=""></option>
                                                    {secciones && (secciones.length > 0) ? (
                                                        secciones.map((p, index) => (
                                                            <option value={p.idSeccion} key={'opt-sec-' + index}>{p.seccion}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay secciones para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group row-2">
                                                <label for="organismoEmisor">Organismo</label>
                                                <select className="custom-select" id="organismoEmisor" name="organismoEmisor" onChange={e => handleFormChange(e)} value={(form.organismoEmisor != null) ? form.organismoEmisor : -1}
                                                ><option selected value=""></option>
                                                    {organismos && (organismos.length > 0) ? (
                                                        organismos.map((p, index) => (

                                                            <option value={p.sigla} key={'opt-sec-' + index}>{p.nombre}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay organismos para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group row-2">
                                                <label for="idNormasEstadoTipo">Estado</label>
                                                <select className="custom-select" id="idNormasEstadoTipo" name="idNormasEstadoTipo" onChange={e => handleFormChange(e)} value={(form.idNormasEstadoTipo != null) ? form.idNormasEstadoTipo : -1}
                                                ><option selected value=""></option>
                                                    {estados && (estados.length > 0) ? (
                                                        estados.map((p, index) => (
                                                            <option value={p.idNormasEstadoTipo} key={'opt-sec-' + index}>{p.normasEstadoTipo}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay Estados para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="normaNumero">Número</label>
                                                <input type="text" className="form-control" id="normaNumero" name="normaNumero" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.normaNumero} />
                                            </div>
                                            <div className="form-group row-2">
                                                <label for="normaAnio">Año</label>
                                                <input type="text" className="form-control" id="normaAnio" name="normaAnio" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.normaAnio} />
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="tipoNorma">Tipo</label>
                                                <select id="tipoNorma" name="tipoNorma" className="custom-select" onChange={e => handleFormChange(e)} value={(form.idNormaTipo != null) ? form.idNormaTipo : -1}>
                                                    <option selected value=""></option>
                                                    {tipos && tipos.length > 0 ? (
                                                        tipos.map((t, index) => (
                                                            <option value={t.idNormaTipo} key={'opt-sec' + index}>{t.normaTipo}</option>
                                                        ))
                                                    ) : (<option selected disabled>No hay Tipos para mostrar.</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="subtipoNorma">Subtipo</label>
                                                <select id="subtipoNorma" name="subtipoNorma" className="custom-select" onChange={e => handleFormChange(e)} value={(form.idNormaSubtipo != null) ? form.idNormaSubtipo : -1}>
                                                    <option selected value="null"></option>
                                                    {subtipos && subtipos.length > 0 ? (
                                                        subtipos.map((s, index) => (
                                                            <option value={s.idNormaSubtipo} key={'opt-sec' + index}>{s.normaSubtipo}</option>
                                                        ))
                                                    ) : (<option selected disabled>No hay Subtipos para mostrar.</option>)}

                                                </select>
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaCarga">Fecha Carga</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaCarga"
                                                    name="fechaCarga"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaCarga}
                                                />
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaLimite">Fecha Límite</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaLimite"
                                                    name="fechaLimite"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaLimite}
                                                />
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaSugerida">Fecha Sugerida</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaSugerida"
                                                    name="fechaSugerida"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaSugerida}
                                                />
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaAprobacion">Fecha Aprobación</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaAprobacion"
                                                    name="fechaAprobacion"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaAprobacion}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label for="cuenta">Cuenta</label>
                                                <select className="custom-select" id="cuenta" name="cuenta" onChange={e => handleFormChange(e)} value={(form.cuenta != null) ? form.cuenta : -1}
                                                    disabled
                                                ><option selected value="">{cuenta ? cuenta : ''}</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="userCarga">Usuario Carga</label>
                                                <select className="custom-select" id="userCarga" name="userCarga" onChange={e => handleFormChange(e)} value={(form.userCarga != null) ? form.userCarga : -1}
                                                ><option selected value=""></option>
                                                    {usuarios && (usuarios.length > 0) ? (
                                                        usuarios.map((n, index) => (
                                                            <option value={n.idUsuario} key={'opt-sec-' + index}>{n.usuario}</option>
                                                        ))
                                                    ) : null}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idReparticionOrganismo">Repartición</label>
                                                <select className="custom-select" id="idReparticionOrganismo" name="idReparticionOrganismo" onChange={e => handleFormChange(e)} value={(form.idReparticionOrganismo != null) ? form.idReparticionOrganismo : -1}
                                                >
                                                    <option selected value=""></option>
                                                    {reparticion && (reparticion.length > 0) ? (
                                                        reparticion.map((n, index) => (
                                                            <option value={n.idReparticion} key={'opt-sec-' + index}>{n.reparticion}</option>
                                                        ))
                                                    ) : null}
                                                </select>
                                            </div>
                                            <div className="form-group"></div>
                                            <div class="btn btn-link" onClick={(e) => borrarFiltros(e)} id="boton-borrar-filtros">Borrar Filtros</div>
                                            <button className="btn btn-primary" type="submit" id="boton-buscar">Buscar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(loadingNormas) ? (<Spinner />) :
                        normas && (normas.length > 0) ? (
                            <div class="resultados">
                                <div class="titulo">
                                    <h3>Resultados de la búsqueda ({totalResultados}):</h3>
                                    <div>
                                        <div id="div-ordenamiento">
                                            <label for="campoOrdenar">Ordenar por: </label>
                                            &nbsp;&nbsp;
                                            <select value={ordenamiento.campo}
                                                className="custom-select" id="campoOrdenar" name="campoOrdenar"
                                                onChange={(e) => { handleOrdenamiento(e) }}>
                                                {Array.from(document.getElementById("form-buscar-normas")).map(elem =>
                                                    elem.localName !== "button"
                                                    && elem.id !== 'idBoletin'
                                                    && elem.id !== 'boletinNumero'
                                                    && elem.id !== 'fechaAprobacion'
                                                    && elem.id !== 'registroHasta'
                                                    && elem.id !== 'registroDesde'
                                                    && <option value={elem.id} key={'option-ord-' + elem.id}>{[...elem.labels][0].innerText}</option>)}
                                            </select>
                                            {ordenamiento.orden && ordenamiento.orden === 'ASC' ?
                                                <button type="button" className="btn btn-link btn-sm" id="boton-ordenar-desc" title="Descendente"
                                                    value="DESC" onClick={(e) => { handleOrdenamiento(e) }}>
                                                    <FaSortAmountDown />
                                                </button>
                                                : <button type="button" className="btn btn-link btn-sm" id="boton-ordenar-asc" title="Ascendente"
                                                    value="ASC" onClick={(e) => { handleOrdenamiento(e) }}>
                                                    <FaSortAmountUp />
                                                </button>
                                            }
                                        </div>
                                        <div>
                                            <label for="cantidadNormas">Mostrar: </label>
                                            &nbsp;&nbsp;
                                            <select value={paginacion.limite} className="custom-select" id="cantidadNormas" name="cantidadNormas"
                                                onChange={(e) => { handleCantidadNormas(e.target.value) }}>
                                                <option value={15}>{15}</option>
                                                <option value={25}>{25}</option>
                                                <option value={35}>{35}</option>

                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <TablaNormas normas={normas} />
                                <br />
                            </div>
                        ) : (<div>
                            <h3>No hay datos para el/los filtro/s aplicado/s</h3>
                        </div>)
                    }
                    {paginacion && normas?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => { setPaginacion((prevPaginacion) => ({ ...prevPaginacion, paginaActual: page + 1, cambiarPagina: true })) }} />
                    </div>}
                </div>
            </>
        );

    }

};

export default BuscarNormasBO;
