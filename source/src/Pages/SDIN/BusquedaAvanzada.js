import React, { useState, useEffect } from 'react';
import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaEye, FaTimes, FaTrashAlt } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";
import { Modal } from 'react-bootstrap';
//HTML decode
import { decode } from 'html-entities';
import './BusquedaAvanzada.css';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File


import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { getNormaTipos } from "../../Helpers/consultas";
import { ExportarExcel } from "../../Components/Dropdown/ExportarExcel";
import { Autocomplete } from '../../Components/Autocomplete/Autocomplete';
import { Pagination } from '@gcba/obelisco'
var b64toBlob = require('b64-to-blob');

const BusquedaAvanzada = props => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true)
    const [loadingNormas, setLoadingNormas] = useState(false)
    const [secciones, setSecciones] = useState([])
    const [normas, setNormas] = useState([])
    const [organismos, setOrganismos] = useState(null);
    const [dependencias, setDependencias] = useState(null);
    const [estados, setEstados] = useState([]);
    const [tiposNorma, setTiposNorma] = useState([]);
    const [tiposPublicaciones, setTiposPublicaciones] = useState();
    const [checkedNormas, setCheckedNormas] = useState([])
    const [totalResultados, setTotalResultados] = useState(null);
    const [ramas, setRamas] = useState(null);
    const [descriptores, setDescriptores] = useState(null);
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNormaSDIN',
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
    const [anexosDJ,setAnexosDJ] = useState([])

    const [tab, setTab] = useState("Normativo")
    const [showModalAnalistas, setShowModalAnalistas] = useState(false)
    const [showModalCambiarEstado, setShowModalCambiarEstado] = useState(false)
    const [showModalBorrar, setShowModalBorrar] = useState(false)
    const [modalFechaSancion, setModalFechaSancion] = useState({ show: false, fechaSancion: '' })
    const [modalAlcance, setModalAlcance] = useState({ show: false, alcance: 0 })
    const [modalRepa, setModalRepa] = useState({ show: false, idDependencia: null })
    const [jerarquia, setJerarquia] = useState(null);
    const [jerarquiaId, setJerarquiaId] = useState({ idReparticion: null });
    const [modalFirmantes, setModalFirmantes] = useState({ show: false, firmantes: null })
    const [modalDescriptores, setModalDescriptores] = useState({ show: false, id: null, descriptores: [] })
    const [modalRama, setModalRama] = useState({ show: false, idRama: null })
    const [modalTema, setModalTema] = useState({ show: false, idTema: null })
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null)
    const [analistas, setAnalistas] = useState([])
    const [gestiones, setGestiones] = useState([])
    const [temas, setTemas] = useState([])
    const [clases, setClases] = useState([])
    const [relaciones,setRelaciones] = useState([])
    const [causales,setCausales] = useState([])
    const [descriptor, setDescriptor] = useState({ id: null, descriptor: '' });
    const [error, setError] = useState(false) //Flag de error de la página
    if (error) throw error //Lo catchea el ErrorBoundary

    const [calcularTotal, setCalcularTotal] = useState(true)

    const ContenidoTab = ({ }) => {
        if (tab) {
            switch (tab) {
                case "Normativo":
                    return <div>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2"
                            onClick={() => setShowModalAnalistas(true)} disabled={!(checkedNormas.length > 0)}>ASIGNAR A ANALISTA</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2"
                            onClick={() => setShowModalCambiarEstado(true)} disabled={!(checkedNormas.length > 0)}>CAMBIAR ESTADO NORMA</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalRepa({ ...modalRepa, show: true })}>AGREGAR DEPENDENCIA</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalAlcance({ show: true, alcance: 0 })}>CAMBIAR ALCANCE</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalFechaSancion({ show: true, fechaSancion: '' })}>MODIFICAR FECHA DE SANCIÓN</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalFirmantes({ ...modalFirmantes, show: true })}>MODIFICAR FIRMANTES</button>
                    </div>
                    break;
                case "Documental":
                    return <div>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalDescriptores({ ...modalDescriptores, show: true })}>AGREGAR DESCRIPTOR</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalRama({ ...modalRama, show: true })}>AGREGAR/QUITAR RAMA</button>
                        <button type="button" class="btn btn-success btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                            onClick={() => setModalTema({ ...modalTema, show: true })}>AGREGAR TEMA</button>
                    </div>
                    break;
                case "Otros":
                    return <div className="d-flex">
                        <ExportarExcel className="mr-2" form={form} ruta={'/api/v1/sdin/normas/exportar'} /* disabled={!(checkedNormas.length > 0)} */ />
                        {JSON.parse(localStorage.getItem("perfiles"))[0].idPerfil === 9 &&
                            <button type="button" class="btn btn-danger btn-sm mr-2 mb-2" disabled={!(checkedNormas.length > 0)}
                                onClick={() => setShowModalBorrar(true)}>BORRAR NORMAS <FaTrashAlt /></button>}
                    </div>
                    break;
                default: return;
            }
        }
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getNormas(form)
        }
    }, [paginacion])

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    const [contentEditor, setContentEditor] = useState("");
    const editorOptions = {
        buttonList: [
            ["undo", "redo"],
            ["removeFormat"],
            ["font", "fontSize", "formatBlock", "bold", "underline", "italic"],
            ["fontColor", "hiliteColor"],
            ["align", "horizontalRule", "list"],
            ["table", "link"],
            ["showBlocks", "codeView"]
        ],
        imageRotation: false,
        font: [
            'Arial'
        ],
        defaultStyle: 'font-family: Arial; font-size: 10px;',
        fontSize: [10, 12, 14, 16, 18, 20],
        colorList: [
            [
                "#828282",
                "#FF5400",
                "#676464",
                "#F1F2F4",
                "#FF9B00",
                "#F00",
                "#fa6e30",
                "#000",
                "rgba(255, 153, 0, 0.1)",
                "#FF6600",
                "#0099FF",
                "#74CC6D",
                "#FF9900",
                "#CCCCCC"
            ]
        ]
    };
    useEffect(() => {
        //console.log(contentEditor)
    }, [contentEditor])

    const handleEditorChange = (e) => {
        setContentEditor(e)
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
        idGestion: '',
        idOrganismo: null,
        idDependencia: null,
        idSeccion: null,
        tiposPalabras: null,
        palabras: '',
        normaNumero: '',
        normaNumero_desde: '',
        normaNumero_hasta: '',
        normaAnio: '',
        fechaCarga: '',
        fechaLimite: '',
        fechaSugerida: '',
        fechaAprobacion: '',
        fechaDesde: '',
        fechaHasta: '',
        idNormasEstadoTipo: null,
        idNormaTipo: null,
        idNormaSDIN: '',
        observaciones: '',
        alcance: null,
        dependencias: { dependencias: [] },
        idClase: '',
        temas: [],
        idRama: null,
        descriptores: { descriptores: [] },
        usuarioAsignado: null,
        checkDigesto: false,
        checkVigenciaEspecial: false,
        checkPlazoDeterminado: false,
        checkConsolidado: false,
        tipoFecha: null,
        vigente: null,
        idRelacion:null,
        idCausal:null,
        tieneFormulario:null,
        idAnexoDJ:null
    }
    const [form, setForm] = useState({ ...initForm });

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'tipoFecha':
                value = e.target.value
                setForm({
                    ...form,
                    ['tipoFecha']: value
                })
                break;
            case 'dependencias':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    break;
                }
                setForm({
                    ...form,
                    ['dependencias']: { dependencias: [...form.dependencias.dependencias, value] }
                })
                break;
            case 'usuarioAsignado':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    break;
                }
                setForm({ ...form, usuarioAsignado: value })
                break;
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
            case 'idNormaSDIN':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNormaSDIN']: value
                })
                break;
            case 'idSeccion':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idSeccion']: value
                })
                break;
            case 'idTema':
                value = parseInt(e.target.value);
                if (!isNaN(value) && !form.temas.includes(value)) {
                    setForm({
                        ...form,
                        ['temas']: [...form.temas, value]
                    });
                }
                break;
            case 'idRama':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idRama']: value
                })
                break;
            case 'idNormaTipo':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idNormaTipo']: value
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
            case 'observaciones':
                value = e.target.value;
                setForm({
                    ...form,
                    ['observaciones']: value
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
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = null
                }
                setForm({
                    ...form,
                    ['idNormasEstadoTipo']: value
                })
                break;
            case 'idOrganismo':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idOrganismo']: value
                })
                break;
            case 'idDependencia':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idDependencia']: value
                })
                break;
            case 'normaNumero_desde':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['normaNumero_desde']: value
                })
                break;
            case 'normaNumero_hasta':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = null
                }
                setForm({
                    ...form,
                    ['normaNumero_hasta']: value
                })
                break;
            case 'idTipoPublicacion':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idTipoPublicacion']: value
                })
                break;
            case 'alcance':
                value = e.target.value;
                if (value == '') {
                    value = null
                }
                setForm({
                    ...form,
                    ['alcance']: value
                })
                break;
            case 'checkDigesto':
                setForm({
                    ...form,
                    ['checkDigesto']:e.target.checked
                })
                break;
            case 'checkVigenciaEspecial':
                setForm({
                    ...form,
                    ['checkVigenciaEspecial']: e.target.checked
                })
                break;
            case 'checkPlazoDeterminado':
                setForm({
                    ...form,
                    ['checkPlazoDeterminado']: e.target.checked
                })
                break;
            case 'checkConsolidado':
                setForm({
                    ...form,
                    ['checkConsolidado']: e.target.checked
                })
                break;
            case 'idGestion':
                value = e.target.value
                setForm({
                    ...form,
                    ['idGestion']: value
                })
                break;
            case 'tiposPalabras':
                value = parseInt(e.target.value)
                if (isNaN(value)) {
                    value = null
                }
                setForm({
                    ...form,
                    ['tiposPalabras']: value
                })
                break;
            case 'vigente':
                value = e.target.value
                setForm({
                    ...form,
                    ['vigente']: parseInt(value)
                })
                break;
            case 'palabras':
                value = e.target.value
                setForm({
                    ...form,
                    ['palabras']: value
                })
                break;
            case 'idClase':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    break;
                }
                setForm({
                    ...form,
                    ['idClase']: value
                })
                break;
            case 'fechaDesde':
                value = e.target.value
                setForm({
                    ...form,
                    ['fechaDesde']: value
                })
                break;
            case 'fechaHasta':
                value = e.target.value
                setForm({
                    ...form,
                    ['fechaHasta']: value
                })
                break;
            case 'idRelacion':
                value = parseInt(e.target.value)
                // console.log(value)
                if (isNaN(value)){
                    break;
                }
                setForm({...form,
                    ['idRelacion']:value})
                break;
            case 'idCausal':
                value = parseInt(e.target.value)
                if (isNaN(value)){
                    setForm({...form,
                        ['idCausal']:null})
                    break;
                }
                if (value > 0){
                    setForm({...form,
                        ['idCausal']:value
                        })
                    break;
                }
            case 'tieneFormulario':
                value = parseInt(e.target.value)
                if (isNaN(value)){
                    setForm({
                        ...form,
                        ['tieneFormulario']:null
                    })
                    break;
                }
                setForm({
                    ...form,
                    ['tieneFormulario']:value
                })
                break;
            case 'idAnexoDJ':
                value = parseInt(e.target.value)
                if (isNaN(value)){
                    setForm({...form,['idAnexoDJ']:null})
                    break;
                }
                setForm({
                    ...form,['idAnexoDJ']:value
                })
                break;
            default:
                setForm({
                    ...form,
                    [e.target.name]: e.target.value
                })
                break;
        }
    }

    useEffect(() => {
        setCalcularTotal(true)
    }, [form])

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
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            setError(error?.data?.mensaje)
        }
    }

    const getRelaciones = async ()=>{
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token")
            await ApiPinPost('/api/v1/sdin/relaciones',body,token)
            .then((res)=>{
                setRelaciones(res.data.relaciones)
            })
            .catch((err)=>{
                setLoading(false)
            })
            setLoading(false)
            
        } catch (error) {
            setLoading(false)
            setError(error?.data?.mensaje)
        }
    }
    const getCausales = async ()=>{
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token")
            await ApiPinPost('/api/v1/sdin/abm/causales/traer',body,token)
            .then((res)=>{
                setCausales(res.data.data)
            })
            .catch((err)=>{
                setLoading(false)
            })
            setLoading(false)
            
        } catch (error) {
            setLoading(false)
            setError(error?.data?.mensaje)
        }
    }

    async function getEstados() {
        try {
            let token = localStorage.getItem("token")
            const { data: { data } } = await ApiPinGet('/api/v1/sdin/normas/estados', token)
            setEstados(data)
        }
        catch (e) { }
    }

    const getAnalistas = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/usuarios/sdin', body, token).then((res) => {
                let auxArray = Array.from(res.data.data).sort((a, b) => {
                    const nameA = a.apellidoNombre.toUpperCase(); // Convert names to uppercase for case-insensitive sorting
                    const nameB = b.apellidoNombre.toUpperCase();
                    if (nameA < nameB) {
                        return -1; // a comes before b
                    }
                    if (nameA > nameB) {
                        return 1; // a comes after b
                    }
                    return 0; // names are equal
                });
                setAnalistas(auxArray)
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }
    const getGestiones = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/sdin/gestiones', body, token).then((res) => {
                setGestiones(Array.from(res.data.nombre))
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getNormas = async (filtros) => {
        setLoadingNormas(true);

        try {
            let body = {
                ...filtros, ...paginacion, ...ordenamiento, calcularTotal,
                user: ''
            };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/sdin/normas', body, token).then((res) => {
                // console.log(res.data)
                setNormas(Array.from(res.data.normas))
                if (calcularTotal) {
                    setTotalResultados(res.data.totalNormas)
                    /* setAnexos(Array.from(res.data.anexos)) */
                    let auxPaginacion = paginacion;
                    auxPaginacion.totalPaginas = Math.ceil(res.data.totalNormas / auxPaginacion.limite);
                    setPaginacion({ ...auxPaginacion });
                    setCalcularTotal(false)
                }
            }).catch(function (error) {
                // console.log(error);
                throw error
            });

            setLoadingNormas(false)
        }
        catch (error) {
            setLoadingNormas(false)
            setError(error?.data?.data)
        }
    }

    const getOrganismos = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/sdin/organismos', token).then((res) => {
                setOrganismos(Array.from(res.data.data))
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getDependencias = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/sdin/dependencias', token).then((res) => {
                setDependencias(Array.from(res.data.data))
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getAnexos = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/dj/anexos', token).then((res) => {
                setAnexosDJ(res.data.data)
            }).catch(function (error) {
                setLoading(false)
                setAnexosDJ([])
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getJerarquia = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/organismos/jerarquia', token).then((res) => {
                setJerarquia(Array.from(res.data.data))
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getTemas = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/sdin/temas', { usuario: localStorage.getItem("user_cuit") }, token).then((res) => {
                setTemas(Array.from(res.data.temas))
            }).catch(function (error) {
                setLoading(false)
                // console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    function checkAll(e, normas) {
        e.preventDefault();
        if (checkedNormas.length < normas.length) {
            setCheckedNormas(normas.map(n => n.idNormaSDIN))
        }
        else {
            setCheckedNormas([])
        }
    }

    function checkNorma(e, norma) {
        e.preventDefault();
        if (checkedNormas.includes(norma.idNormaSDIN)) {
            setCheckedNormas(checkedNormas.filter(p => p !== norma.idNormaSDIN))
        }
        else {
            setCheckedNormas([...checkedNormas, norma.idNormaSDIN])
        }
    }

    const colorNormaTipo = { color: 'blue' };
    const colorNormaNumero = { color: 'red' };
    const colorOrganismo = { color: 'green' };
    const colorDependencia = { color: 'purple' };
    const colorAnio = { color: 'blue' };

    const TablaNormas = ({ normas }) => {
        return (
            <table class="table table-bordered table-hover" >
                <thead>
                    <tr>
                        <th className="col-1">id</th>
                        <th className="col-4">Norma</th>
                        <th className="col-4">Sintesis</th>
                        <th className="col-1">Sanción</th>
                        {/*                         <th scope="col-1">Fecha Ratificación</th>
                        <th scope="col-1">Fecha Promulgación</th> */}
                        <th className="col-1">Analista</th>
                        <th className="col-1">Estado</th>
                        <th className="col-1"></th>
                        <th className="col-1">
                            <input type="checkbox" aria-label="checkbox" checked={checkedNormas.length === normas.length}
                                onClick={(e) => { checkAll(e, normas) }} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        normas.length > 0 ? (
                            normas.filter(nor => nor.normasEstadoTipo !== "Eliminada").map(n => (
                                <tr>
                                    <td>{n.idNormaSDIN}</td>
                                    <td> <Link to={"/sdin/ficha-norma/" + String(n.idNormaSDIN)}><b style={colorNormaTipo}>{decode(n.normaTipo)}</b> N° <b style={colorNormaNumero}>{n.normaNumero}</b> / <b style={colorOrganismo}>{n.siglaOrganismo}</b> / <b style={colorDependencia}>{n.siglaDependencia ? n.siglaDependencia : ''}</b> / <b style={colorAnio}>{n.fechaSancion ? moment(n.fechaSancion).format('YY') : ''}</b></Link></td>
                                    <td>{decode(n.normaSumario)}{(decode(n.firmantes)) ? <> <br></br>firmada por <b>{decode(n.firmantes)} </b></> : ''}</td>
                                    <td>{(n.fechaSancion !== null) ? (moment(n.fechaSancion).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    {/* <td>{(n.fechaSancion !== null) ? (moment(n.fechaSancion).format('DD/MM/YYYY')) : ('N/A')}</td> */}
                                    {/*  <td>{(n.fechaRatificacion !== null) ? (moment(n.fechaRatificacion).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{(n.fechaPromulgacion !== null) ? (moment(n.fechaPromulgacion).format('DD/MM/YYYY')) : ('N/A')}</td> */}
                                    <td>{n.analista ?? '---'}</td>
                                    <td>{decode(n.normasEstadoTipo)}</td>

                                    <td>
                                        <Link to={"/sdin/ficha-norma/" + String(n.idNormaSDIN)} target="_blank" rel="noopener noreferrer">
                                            <button className="btn btn-link btn-sm">
                                                <FaEye />
                                            </button>
                                        </Link></td>
                                    <td >
                                        <input checked={checkedNormas.includes(n.idNormaSDIN)} type="checkbox" aria-label="checkbox" onClick={(e) => checkNorma(e, n)} />
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

    async function cambiarEstadoNormas(e) {
        e.preventDefault()
        document.getElementsByClassName("botones-modal").disabled = true;
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            normas: checkedNormas,
            idNormasEstadoTipo: estadoSeleccionado
        }
        await ApiPinPost('/api/v1/sdin/normas/editar/estado', body, token).then((res) => {
            window.location.reload()
        }).catch(e => { /* console.log(e) */ })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('SUBMIT')
        await getNormas(form)
            .then(() => {
                document.getElementById('resultados-busqueda')?.scrollIntoView({
                    behavior: 'smooth'
                });
            })
    }

    const asignarNormas = async (e, idUsuario) => {
        e.preventDefault();
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            normas: checkedNormas,
            usuarioAsignado: idUsuario
        }
        await ApiPinPost('/api/v1/sdin/normas/asignar', body, token)
            .then(() => {
                window.location.reload();
            })
            .catch(err => {
                //console.log(err)
            })
    }

    const borrarNormas = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            let token = localStorage.getItem("token");
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                normas: checkedNormas
            }
            await ApiPinPost('/api/v1/sdin/normas/borrar', body, token)
                .then(() => {
                    window.location.reload();
                })
        }
        catch (e) { }
        finally { setLoading(false) }
    }

    const editarNormas = async (e, metadato) => {
        e.preventDefault();
        setLoading(true)
        try {
            let token = localStorage.getItem("token");
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                normas: checkedNormas,
                metadatos: metadato
            }
            await ApiPinPost('/api/v1/sdin/normas/editar', body, token)
                .then(() => {
                    window.location.reload();
                })
        }
        catch (e) { setLoading(false) }
    }

    const agregarDependencias = async (e, idDependencia) => {
        e.preventDefault();
        setLoading(true)
        try {
            let token = localStorage.getItem("token");
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                normas: checkedNormas,
                idDependencia
            }
            await ApiPinPost('/api/v1/sdin/normas/dependencias/agregar', body, token)
                .then(() => {
                    window.location.reload();
                })
        }
        catch (e) { setLoading(false) }
    }

    const handleCantidadNormas = (e) => {
        let auxPaginacion = paginacion;
        auxPaginacion.limite = e;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })

    }

    async function borrarFiltros(e) {
        e.preventDefault()
        setForm({ ...initForm })
        getNormas(initForm)
    }

    const getDescriptores = async (textInput) => {
        if (textInput.length < 3 && descriptor.descriptor.length > 2) {
            setDescriptores([])
        }
        setDescriptor({ ...descriptor, descriptor: textInput })
        if (textInput && textInput.length > 2) {
            let body = {
                textInput,
                usuario: localStorage.getItem('user_cuit')
            }
            try {
                let token = localStorage.getItem("token");
                await ApiPinPost('/api/v1/sdin/descriptores', body, token).then((res) => {
                    setDescriptores(res.data.descriptores);
                    //return (res.data.descriptores.map(n => ({ label: n.descriptor, value: n.id })))
                }).catch(function (error) {
                    throw error
                });
            }
            catch (error) {
                //console.log(error);
            }
        }
    }

    const getDescriptoresModal = async (textInput) => {
        if (textInput.length < 3 && descriptor.descriptor.length > 2) {
            setModalDescriptores({ ...modalDescriptores, descriptores: [], descriptorSeleccionado: textInput })
        }
        if (textInput && textInput.length > 2) {
            let body = {
                textInput,
                usuario: localStorage.getItem('user_cuit')
            }
            try {
                let token = localStorage.getItem("token");
                await ApiPinPost('/api/v1/sdin/descriptores', body, token).then((res) => {
                    setModalDescriptores({ ...modalDescriptores, descriptores: res.data.descriptores, descriptorSeleccionado: textInput });
                    //return (res.data.descriptores.map(n => ({ label: n.descriptor, value: n.id })))
                }).catch(function (error) {
                    throw error
                });
            }
            catch (error) {
                //console.log(error);
            }
        }
    }

    const agregarDescriptor = async (id) => {
        setLoading(true)
        for (const norma of checkedNormas) {
            let body = {
                descriptor: id,
                usuario: localStorage.getItem('user_cuit'),
                idNormaSDIN: norma,
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
            }
            let token = localStorage.getItem("token");
            try {
                await ApiPinPost('/api/v1/sdin/norma/descriptores/crear', body, token)
                    .catch((err) => {
                        throw err
                    })
            }
            catch (e) {
                setLoading(false)
                break;
                //console.log(e)
            }
        }
        window.location.reload()
    }

    const agregarTema = async (id) => {
        setLoading(true)
        for (const norma of checkedNormas) {
            let body = {
                idTema: id,
                usuario: localStorage.getItem('user_cuit'),
                idNormaSDIN: norma,
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
            }
            let token = localStorage.getItem("token");
            try {
                await ApiPinPost('/api/v1/sdin/norma/temas/crear', body, token)
                    .catch((err) => {
                        throw err
                    })
            }
            catch (e) {
                setLoading(false)
                break;
                //console.log(e)
            }
        }
        window.location.reload()
    }

    useEffect(() => {
    }, [form])

    //Hook inicial
    useEffect(async () => {
        await Promise.all([await getSecciones(),
        await getOrganismos(),
        await getDependencias(),
        await getJerarquia(),
        await getEstados(),
        await getAnalistas(),
        await getGestiones(),
        await getTemas(),
        await getRelaciones(),
        await getCausales(),
        await getAnexos()]);

        await ApiPinGet('/api/v1/sdin/normas/tipos', localStorage.getItem('token')).then((res) => setTiposNorma(res.data.data));
        await ApiPinPost('/api/v1/sdin/ramas', { usuario: localStorage.getItem('user_cuit') }, localStorage.getItem('token')).then((res) => setRamas(res.data.ramas));
        await ApiPinPost('/api/v1/sdin/tipos-publicaciones', { usuario: localStorage.getItem('user_cuit') }, localStorage.getItem('token')).then((res) => setTiposPublicaciones(res.data.tiposPublicaciones));
        await ApiPinPost('/api/v1/sdin/temas', { usuario: localStorage.getItem('user_cuit') }, localStorage.getItem('token')).then((res) => setTemas(res.data.temas));
        await ApiPinPost('/api/v1/sdin/clases', { usuario: localStorage.getItem('user_cuit') }, localStorage.getItem('token')).then((res) => setClases(res.data.clases));
        // await getNormas({ ...initForm, idNormasEstadoTipo: 2 })
        setLoading(false)
    }, [])

    if (loading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-consultas">
                    <div className="accordion" id="accordion">
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
                                        <form className="form" onSubmit={e => handleSubmit(e)}>
                                            <div className="form-group">
                                                <label for="idNormaSDIN">ID</label>
                                                <input className="form-control" id="idNormaSDIN" name="idNormaSDIN"
                                                    onChange={e => handleFormChange(e)} value={form.idNormaSDIN}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label for="idNormaTipo">Tipo de Norma</label>
                                                <select className="custom-select" id="idNormaTipo" name="idNormaTipo"
                                                    onChange={e => handleFormChange(e)} value={(form.idNormaTipo != null) ? form.idNormaTipo : -1}
                                                ><option selected value=""></option>
                                                    {tiposNorma && (tiposNorma.length > 0) ? (
                                                        tiposNorma.map((p, index) => (
                                                            <option value={p.idNormaTipo} key={'opt-sec-' + index}>{decode(p.normaTipo)}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay tipos de norma.</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="normaNumero_desde">Número</label>
                                                <div class="d-flex justify-items-around">
                                                    <input type="number" className="form-control campo-numero-norma" id="normaNumero_desde"
                                                        name="normaNumero_desde" min={1} pattern="[0-9]*" onChange={e => handleFormChange(e)}
                                                        value={form.normaNumero_desde} placeholder="Desde" />&nbsp;-&nbsp;
                                                    <input type="number" className="form-control campo-numero-norma" id="normaNumero_hasta"
                                                        name="normaNumero_hasta" min={1} pattern="[0-9]*" onChange={e => handleFormChange(e)}
                                                        value={form.normaNumero_hasta} placeholder="Hasta" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label for="idNormasEstadoTipo">Estado Norma</label>
                                                <select className="custom-select" id="idNormasEstadoTipo" name="idNormasEstadoTipo" onChange={e => handleFormChange(e)} value={(form.idNormasEstadoTipo != null) ? form.idNormasEstadoTipo : -1}>
                                                    <option selected value={null}></option>
                                                    {estados && estados.length > 0 ? (
                                                        estados.map(estado => {
                                                            return (
                                                                <option value={estado.idNormasEstadoTipo}>{decode(estado.normasEstadoTipo)}</option>
                                                            )
                                                        })

                                                    ) : (<option selected disabled>No hay estados para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="tipoPublicacion">Tipo de Publicación</label>
                                                <select className="custom-select" id="idTipoPublicacion" name="idTipoPublicacion"
                                                    onChange={e => handleFormChange(e)} value={form.idTipoPublicacion ? form.idTipoPublicacion : -1}
                                                ><option selected value={-1}></option>
                                                    {tiposPublicaciones && (tiposPublicaciones.length > 0) ? (
                                                        tiposPublicaciones.map((p, index) => (
                                                            <option value={p.idTipoPublicacion} key={'opt-sec-' + index}>{p.tipoPublicacion}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay tipos de publicaciones</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="">Número de Boletín</label>
                                                <input type="text" className="form-control" id="boletinNumero" name="boletinNumero" pattern="[0-9]*"
                                                    onChange={e => handleFormChange(e)} value={form.boletinNumero} />
                                            </div>
                                            <div className="form-group">
                                                <label for="tipoFecha">Tipo de Fecha</label>
                                                <select className="custom-select" id="tipoFecha" name="tipoFecha"
                                                    onChange={e => handleFormChange(e)} value={form.tipoFecha}>
                                                    <option></option>
                                                    <option>Publicación</option>
                                                    <option>Sanción</option>
                                                    <option>Promulgación</option>
                                                    <option>Ratificación</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="fechaDesde">Rango de Fechas</label>
                                                <div className="rango-fechas">
                                                    <input type="date"
                                                        className="form-control"
                                                        id="fechaDesde"
                                                        name="fechaDesde"
                                                        aria-describedby="date-help"
                                                        onChange={e => handleFormChange(e)} value={form.fechaDesde}
                                                    />
                                                    -
                                                    <input type="date"
                                                        className="form-control"
                                                        id="fechaHasta"
                                                        name="fechaHasta"
                                                        min={form.fechaDesde}
                                                        aria-describedby="date-help"
                                                        onChange={e => handleFormChange(e)} value={form.fechaHasta}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label for="idGestion">Gestión</label>
                                                <select className="custom-select" id="idGestion" name="idGestion"
                                                    onChange={e => handleFormChange(e)} value={form.idGestion}
                                                ><option selected></option>
                                                    {gestiones && (gestiones.length > 0) ? (
                                                        gestiones.map((p, index) => (
                                                            <option value={p.idGestion} key={'opt-sec-' + index}>{p.nombre}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay gestiones</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idOrganismo">Organismo</label>
                                                <select className="custom-select" id="idOrganismo" name="idOrganismo"
                                                    onChange={e => handleFormChange(e)} value={(form.idOrganismo != null) ? form.idOrganismo : -1}
                                                ><option selected value=""></option>
                                                    {organismos && (organismos.length > 0) ? (
                                                        organismos.map((p, index) => (
                                                            <option value={p.idOrganismo} key={'opt-sec-' + index}>{p.sigla + ' - ' + p.organismo}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay reparticiones para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idDependencia">Dependencia</label>
                                                <select className="custom-select" id="idDependencia" name="idDependencia"
                                                    onChange={e => handleFormChange(e)} value={(form.idDependencia != null) ? form.idDependencia : -1}
                                                ><option selected value=""></option>

                                                    {dependencias && (dependencias.length > 0) ? (
                                                        dependencias.map((p, index) => (
                                                            <option value={p.idDependencia} key={'opt-sec-' + index}>{p.sigla + ' - ' + p.dependencia}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay dependencias para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="checkDigesto"
                                                        id="checkDigesto" checked={form.checkDigesto} onChange={e => handleFormChange(e)} />
                                                    <label for="checkDigesto" class="custom-control-label">Es Digesto</label>
                                                </div>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="checkVigenciaEspecial"
                                                        id="checkVigenciaEspecial" checked={form.checkVigenciaEspecial} onChange={e => handleFormChange(e)} />
                                                    <label for="checkVigenciaEspecial" class="custom-control-label">Vigencia Especial</label>
                                                </div>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="checkPlazoDeterminado"
                                                        id="checkPlazoDeterminado" checked={form.checkPlazoDeterminado} onChange={e => handleFormChange(e)} />
                                                    <label for="checkPlazoDeterminado" class="custom-control-label">Plazo Determinado</label>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label for="idAlcance">Alcance</label>
                                                <select className="custom-select" id="alcance" name="alcance" onChange={e => handleFormChange(e)}
                                                    value={(form.alcance != null) ? form.alcance : ''}>
                                                    <option value={''}></option>
                                                    <option value={'G'}>General</option>
                                                    <option value={'P'}>Particular</option>
                                                    <option value={'X'}>N/A</option>
                                                    <option value={'M'}>M</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idRama">Rama</label>
                                                <select className="custom-select" id="idRama" name="idRama" onChange={e => handleFormChange(e)}
                                                    value={form.idRama != null ? form.idRama : -1}>
                                                    <option selected value={-1}></option>
                                                    {ramas && (ramas.length > 0) ? (
                                                        ramas.map((p, index) => (
                                                            <option value={p.idRama} key={'opt-sec-' + index}>{p.rama}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay ramas para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="">Dependencias</label>
                                                <select className="custom-select" id="dependencias" name="dependencias"
                                                    onChange={e => handleFormChange(e)} value={form.dependencias.dependencias}><option selected value="" hidden />
                                                    {dependencias && (dependencias.length > 0) ? (
                                                        dependencias.filter((dep) => !(form.dependencias.dependencias.includes(dep.idDependencia))).map(
                                                            (p, index) => (
                                                                <option value={p.idDependencia} key={'opt-sec-' + index}>{p.sigla + ' - ' + p.dependencia}</option>
                                                            ))

                                                    ) : (<option selected disabled>No hay dependencias para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="card dependencias">
                                                {form.dependencias && form.dependencias.dependencias.map((elem) =>
                                                    <span className="badge badge-info">
                                                        {dependencias.find((dep) => dep.idDependencia === elem).sigla}&nbsp;
                                                        <FaTimes color='#C93B3B' type='button'
                                                            onClick={() => setForm({
                                                                ...form,
                                                                ['dependencias']: { dependencias: [...form.dependencias.dependencias.filter(n => n !== elem)] }
                                                            })} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label for="idTema">Temas</label>
                                                <select
                                                    className="custom-select"
                                                    id="idTema"
                                                    name="idTema"
                                                    onChange={e => handleFormChange(e)}
                                                    value={-1}
                                                ><option selected value={-1}></option>
                                                    {temas && temas.length > 0 ? (
                                                        temas
                                                            .slice() // Copia el array para no modificar el original
                                                            .sort((a, b) => a.tema.localeCompare(b.tema)) // Ordena alfabéticamente por la propiedad 'tema'
                                                            .map((p, index) => (
                                                                <option value={p.idTema} key={'opt-sec-' + index}>
                                                                    {p.tema}
                                                                </option>
                                                            ))
                                                    ) : (
                                                        <option selected disabled>No hay temas</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="card dependencias">
                                                {form && form.temas && form.temas.map((elem) =>
                                                    <span className="badge badge-info" style={{whiteSpace: "normal"}}>
                                                        {temas.find((n) => n.idTema === elem).tema}&nbsp;
                                                        <FaTimes color='#C93B3B' type='button'
                                                            onClick={() => setForm({
                                                                ...form,
                                                                ['temas']: [...form.temas.filter(n => n !== elem)]
                                                            })} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label for="alcance">Descriptores</label>
                                                <div className="dropdown-container" >
                                                    <div className={descriptores && descriptores.length > 0 ? "dropdown show" : "dropdown"}>
                                                        <input className="form-control buscador input-search" value={descriptor.descriptor}
                                                            onChange={async (e) => await getDescriptores(e.target.value)} data-toggle="dropdown" />
                                                        <div className={descriptores && descriptores.length > 0 ? "dropdown-menu show" : "dropdown-menu"} id="autocomplete-options">
                                                            {descriptores && descriptores.length > 0 &&
                                                                descriptores.map(elem =>
                                                                    <button className="dropdown-item btn btn-sm" type="button"
                                                                        onClick={() => { setDescriptor(elem); setForm({ ...form, ['descriptores']: { descriptores: [...form.descriptores.descriptores, elem.id] } }) }}>
                                                                        {elem.descriptor}
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card dependencias">
                                                {form.descriptores && form.descriptores?.descriptores?.map((elem) =>
                                                    <span className="badge badge-info">
                                                        {descriptores && descriptores.length > 0 && descriptores.find((n) => n.id === elem).descriptor}&nbsp;
                                                        <FaTimes color='#C93B3B' type='button'
                                                            onClick={() => setForm({
                                                                ...form,
                                                                ['descriptores']: { descriptores: [...form.descriptores.descriptores.filter(n => n !== elem)] }
                                                            })} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label for="usuarioAsignado">Analista</label>
                                                <select className="custom-select" id="usuarioAsignado" name="usuarioAsignado"
                                                    onChange={e => handleFormChange(e)} value={form.usuarioAsignado ? form.usuarioAsignado : -1}
                                                ><option selected value={-1}></option>
                                                    {analistas && (analistas.length > 0) ? (
                                                        analistas.map((p, index) => (
                                                            <option value={p.idUsuario} key={'opt-sec-' + index}>{p.apellidoNombre}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay analistas</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ display: "inline-flex" }}>
                                                <div style={{ width: "90px" }}>
                                                    <label for="vigente">Vigente</label>
                                                    <select className="custom-select" id="vigente" name="vigente"
                                                        onChange={e => handleFormChange(e)} value={form.vigente}>
                                                        <option selected value={null}>Todas</option>
                                                        <option value={1}>Vigentes</option>
                                                        <option value={0}>No Vigentes</option>
                                                    </select>
                                                </div>&nbsp;&nbsp;
                                                <div style={{ width: "120px" }}>
                                                    <label for="tiposPalabras">Tipo de Palabras</label>
                                                    <select className="custom-select" id="tiposPalabras" name="tiposPalabras"
                                                        onChange={e => handleFormChange(e)} value={form.tiposPalabras}>
                                                        <option></option>
                                                        <option value={1}>Frase exacta:</option>
                                                        <option value={2}>Con las palabras:</option>
                                                        <option value={3}>Sin las palabras:</option>
                                                        <option value={4}>Con alguna de:</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {/* <div className="form-group">
                                                <label for="vigente">Vigente</label>
                                                <select className="custom-select" id="vigente" name="vigente"
                                                    onChange={e => handleFormChange(e)} value={form.vigente}>
                                                    <option selected value={null}>Todas</option>
                                                    <option value={1}>Vigentes</option>
                                                    <option value={0}>No Vigentes</option>
                                                </select>
                                            </div> */}
                                            <div className="form-group dos-columnas">
                                                <label for="palabras">Palabras</label>
                                                <textarea type="text" className="form-control" id="palabras" name="palabras" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.palabras} />
                                            </div>
                                            <div className="form-group">
                                                <label for="idClase">Clase</label>
                                                <select className="custom-select" id="idClase" name="idClase" pattern="[0-9]*"
                                                    onChange={e => handleFormChange(e)} value={form.idClase}>
                                                    <option value={-1}></option>
                                                    {clases.map(c => {
                                                        return (
                                                            <option value={c.idClase}>{c.clase}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Sección</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion"
                                                    onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                ><option selected value=""></option>
                                                    {secciones && (secciones.length > 0) ? (
                                                        secciones.map((p, index) => (
                                                            <option value={p.idSeccion} key={'opt-sec-' + index}>{p.seccion}</option>
                                                        ))

                                                    ) : (<option selected disabled>No hay secciones para mostrar</option>)
                                                    }
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ gridColumn: "3 / 5" }}>
                                                <label for="observaciones">Observaciones</label>
                                                <textarea type="text" className="form-control" id="observaciones" name="observaciones"
                                                    onChange={e => handleFormChange(e)} value={form.observaciones} />
                                            </div>
                                            <div className="form-group">
                                                <label for="idRelacion">Causal</label>
                                                <select className='custom-select' id='idCausal' name='idCausal'
                                                onChange={e => handleFormChange(e)}
                                                value={(form.idCausal != null) ? form.idCausal : -1}>
                                                <option selected value=""></option>
                                                    {(causales && causales.length > 0)
                                                    ?causales.map((c,index) =>(
                                                        <option value={c.idCausal} key={`opt-select-${index}`}>{c.causal}</option>
                                                    ))
                                                    :(<option selected disabled>No hay causales para mostrar</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="tieneFormulario">Tiene Formulario</label>
                                                <select className='custom-select' id='tieneFormulario' name='tieneFormulario'
                                                onChange={e => handleFormChange(e)}
                                                value={(form.tieneFormulario != null) ? form.tieneFormulario : -1}>
                                                <option selected value={null}></option>
                                                <option value={1}>1. Abrogación</option>
                                                <option value={2}>2. Existencia De Conflictos Normativos</option>
                                                <option value={3}>3. Pérdida de vigencia jurídica</option>
                                                <option value={4}>4. Necesidad de refundir en uno o más textos legales</option>
                                                <option value={5}>5. Necesidad de abrogación, derogación o caducidad expresa</option>
                                                <option value={6}>6. Elaboración de texto definitivo</option>
                                                <option value={7}>7. Tablas de Antecedentes y Equivalencias</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idAnexoDJ">Anexo</label>
                                                <select className='custom-select' id='idAnexoDJ' name='idAnexoDJ'
                                                onChange={e => handleFormChange(e)}
                                                value={(form.idAnexoDJ != null) ? form.idAnexoDJ : null}>
                                                <option selected value={null}></option>
                                                    {(anexosDJ && anexosDJ.length > 0)
                                                    ?anexosDJ.map((a,index) =>(
                                                        <option value={a.idAnexoDJ} key={`opt-select-${index}`}>{a.nombre}</option>
                                                    ))
                                                    :(<option selected disabled>No hay anexos para mostrar</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idRelacion">Relación</label>
                                                <select className='custom-select' id='idRelacion' name='idRelacion'
                                                onChange={e => handleFormChange(e)}
                                                value={(form.idRelacion != null) ? form.idRelacion : -1}>
                                                <option selected value=""></option>
                                                    {(relaciones && relaciones.length > 0)
                                                    ?relaciones.map((r,index) =>(
                                                        <option value={r.idRelacion} key={`opt-select-${index}`}>{r.relacion}</option>
                                                    ))
                                                    :(<option selected disabled>No hay relaciones para mostrar</option>)}
                                                </select>
                                            </div>
                                            <div className='form-group d-flex align-items-center'>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input"      name="checkConsolidado"
                                                    id="checkConsolidado"
                                                    onChange={e => handleFormChange(e)}
                                                    checked={form.checkConsolidado}/>
                                                    <label for="checkConsolidado" class="custom-control-label">Consolidado</label>
                                                </div>
                                            </div>
                                            <div class="btn btn-link" onClick={(e) => borrarFiltros(e)} id="boton-borrar-filtros">Borrar Filtros</div>
                                            <button className="btn btn-primary" type="submit" id="boton-buscar">Buscar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="accordion" id="accordion">
                        {/* <div className="card">
                            <button
                                id="boton2"
                                className="card-header card-link collapsed"
                                data-toggle="collapse"
                                data-target="#collapse2"
                            >
                                Opciones de Visualización
                            </button>
                            <div id="collapse2" className="collapse" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                        <form className="form" onSubmit={e => handleSubmit(e)}>
                                            <div className="form-group">
                                                <label for="idSeccion">Cantidad de Resultados</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                >
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Ordenar por</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                >
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Tipo de Visualización</label>
                                                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
                                                >
                                                </select>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-relaciones"
                                                        id="check-relaciones" value={form.relaciones} />
                                                    <label for="check-relaciones" class="custom-control-label">Relaciones</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-sintesis"
                                                        id="check-sintesis" value={form.sintesis} />
                                                    <label for="check-sintesis" class="custom-control-label">Sintesis</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-gestion"
                                                        id="check-gestion" value={form.gestion} />
                                                    <label for="check-gestion" class="custom-control-label">Gestión</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-organismo"
                                                        id="check-organismo" value={form.organismo} />
                                                    <label for="check-organismo" class="custom-control-label">Organismo</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-reparticion"
                                                        id="check-reparticion" value={form.reparticion} />
                                                    <label for="check-reparticion" class="custom-control-label">Repartición</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-temas"
                                                        id="check-temas" value={form.temas} />
                                                    <label for="check-temas" class="custom-control-label">Temas</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-voces"
                                                        id="check-voces" value={form.voces} />
                                                    <label for="check-voces" class="custom-control-label">Voces</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-ramas"
                                                        id="check-ramas" value={form.ramas} />
                                                    <label for="check-ramas" class="custom-control-label">Ramas</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-tipo-norma"
                                                        id="check-tipo-norma" value={form.tipoNorma} />
                                                    <label for="check-tipo-norma" class="custom-control-label">Tipo de Norma</label>
                                                </div>
                                            </div>
                                            <div className="form-group d-flex align-items-center">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" name="check-nro-norma"
                                                        id="check-nro-norma" value={form.nroNorma} />
                                                    <label for="check-nro-norma" class="custom-control-label">Número de Norma</label>
                                                </div>
                                            </div>
                                        </form>
                                        <div>
                                            <button className="btn btn-danger btn-sm mr-2 mb-2" type="submit" id="boton-ajustar">Por Defecto</button>
                                            <button className="btn btn-primary" type="submit" id="boton-ajustar">Ajustar</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div> */}
                        <div className="accordion" id="accordion">
                            <div className="card">
                                <button
                                    id="boton3"
                                    className="card-header card-link collapsed"
                                    data-toggle="collapse"
                                    data-target="#collapse3"
                                >
                                    Operaciones
                                </button>
                                <div id="collapse3" className="collapse" data-parent="#accordion">
                                    <div className="card-body">
                                        <nav>
                                            <ul class="nav flex-row nav-pills">
                                                <li class="nav-item">
                                                    <button class={tab === "Normativo" ? "btn nav-link active" : "btn nav-link"} onClick={() => setTab("Normativo")}><span>Normativo</span></button>
                                                </li>
                                                <li class="nav-item">
                                                    <button class={tab === "Documental" ? "btn nav-link active" : "btn nav-link"} onClick={() => setTab("Documental")}><span>Documental</span></button>
                                                </li>
                                                <li class="nav-item">
                                                    <button class={tab === "Otros" ? "btn nav-link active" : "btn nav-link"} onClick={() => setTab("Otros")}><span>Otros</span></button>
                                                </li>
                                            </ul>
                                        </nav>
                                        <hr />
                                        {(tab) && <ContenidoTab />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(loadingNormas) ? (<Spinner />) : (
                        normas && (normas.length > 0) ?
                            <div class="resultados" id="resultados-busqueda">
                                <div class="titulo">
                                    <h3>Resultados de la búsqueda ({totalResultados}):</h3>
                                    <div>
                                        <label for="cantidadNormas">Mostrar: </label>
                                        &nbsp;&nbsp;
                                        <select value={paginacion.limite} className="custom-select" id="cantidadNormas" name="cantidadNormas" onChange={(e) => { handleCantidadNormas(e.target.value) }}>
                                            <option value={100}>{100}</option>
                                            <option value={200}>{200}</option>
                                            <option value={500}>{500}</option>
                                            <option value={1000}>{1000}</option>

                                        </select>
                                    </div>
                                </div>
                                <TablaNormas normas={normas} />
                                <br />
                            </div>
                            :
                            <h3>Resultados de la búsqueda: 0</h3>
                    )
                    }
                    {paginacion && normas?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => { setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true }) }} />
                    </div>}
                    <Modal show={showModalAnalistas} onHide={() => setShowModalAnalistas(false)}>
                        <Modal.Header>
                            <Modal.Title>Asignar a un Analista</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <table className="table table-hover" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analistas && analistas.filter(n => n.estadoUsuario == 1).map((elem) => (

                                        <tr>
                                            <td>{elem.apellidoNombre ? decode(elem.apellidoNombre) : elem.mig_nombre}</td>
                                            <td><button className="btn btn-success btn-sm" onClick={(e) => asignarNormas(e, elem.idUsuario)}>Asignar</button></td>
                                        </tr>

                                    ))}
                                </tbody>
                            </table>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-secondary" onClick={() => setShowModalAnalistas(false)}>
                                Volver
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={showModalCambiarEstado} onHide={() => setShowModalCambiarEstado(false)}>
                        <Modal.Header>
                            <Modal.Title>Cambiar Estado de las Normas</Modal.Title>
                        </Modal.Header>
                        <form onSubmit={(e) => cambiarEstadoNormas(e)}>
                            <Modal.Body>
                                <div className="form-wrapper bg-light p-4">
                                    <div class="form-group">
                                        <label for="idNormasEstadoTipo">Seleccione un Estado</label>
                                        <select className="custom-select" id="idNormasEstadoTipo" onChange={(e) => setEstadoSeleccionado(e.target.value)}>
                                            <option selected value="" hidden></option>
                                            {estados && (estados.length > 0) ? (
                                                estados.filter(e => e.idNormasEstadoTipo !== 0).map((p, index) => (
                                                    <option value={p.idNormasEstadoTipo} key={'opt-sec-' + index}>{decode(p.normasEstadoTipo)}</option>
                                                ))

                                            ) : (<option selected disabled>No hay estados para mostrar</option>)
                                            }
                                        </select>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button type="button" className="btn btn-secondary botones-modal" onClick={() => setShowModalCambiarEstado(false)}>
                                    Volver
                                </button>
                                <button type="submit" className="btn btn-primary botones-modal">
                                    Confirmar
                                </button>
                            </Modal.Footer>
                        </form>
                    </Modal>
                    <Modal show={showModalBorrar} onHide={() => setShowModalBorrar(false)}>
                        <Modal.Header></Modal.Header>
                        <Modal.Body>
                            <h4>Está seguro que desea eliminar las normas seleccionadas?</h4>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModalBorrar(false)}>
                                Volver
                            </button>
                            <button className="btn btn-danger" onClick={e => borrarNormas(e)}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalFechaSancion.show} onHide={() => setModalFechaSancion({ show: false, fechaSancion: '' })}>
                        <Modal.Header><Modal.Title>Modificar fecha de sanción de las normas</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div class="form-group">
                                    <label for="fechaSancion">Fecha de Sanción</label>
                                    <input type="date" className="form-control" id="fechaSancion" value={modalFechaSancion.fechaSancion}
                                        onChange={(e) => setModalFechaSancion({ ...modalFechaSancion, fechaSancion: e.target.value })} />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalFechaSancion({ show: false, fechaSancion: '' })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => editarNormas(e, { fechaSancion: modalFechaSancion.fechaSancion })}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalAlcance.show} onHide={() => setModalAlcance({ show: false, alcance: 0 })}>
                        <Modal.Header><Modal.Title>Modificar alcance</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div class="form-group">
                                    <label for="alcance">Alcance</label>
                                    <select className="custom-select" id="alcance"
                                        onChange={(e) => setModalAlcance({ ...modalAlcance, alcance: e.target.value })}>
                                        <option value="" selected disabled>Seleccione el alcance de la norma...</option>
                                        <option value="G">General</option>
                                        <option value="P">Particular</option>
                                    </select>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalAlcance({ show: false, alcance: 0 })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => editarNormas(e, { alcance: modalAlcance.alcance })}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalRepa.show} onHide={() => setModalRepa({ show: false, idDependencia: null })}>
                        <Modal.Header><Modal.Title>Agregar Dependencias</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div className="form-group">
                                    <label for="comboDependencias">Dependencia</label>
                                    <Autocomplete
                                        valores={dependencias?.map(n => ({ id: n.idDependencia, nombre: decode(n.dependencia) }))}
                                        setValue={({ id }) => setModalRepa({ ...modalRepa, idDependencia: id })}
                                    />
                                    <br />
                                    <p>Total de resultados: {dependencias?.length}</p>
                                    {/* <select className="custom-select" id="comboDependencias"
                                        onChange={e => setModalRepa({ ...modalRepa, idDependencia: parseInt(e.target.value) })} value={modalRepa.idDependencia}
                                    ><option selected value={null}></option>
                                        {dependencias && (dependencias.length > 0) ? (
                                            dependencias.map((p, index) => (
                                                <option value={p.idDependencia} key={'opt-sec-' + index}>{p.dependencia}</option>
                                            ))

                                        ) : (<option selected disabled>No hay dependencias para mostrar</option>)
                                        }
                                    </select> */}
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalRepa({ show: false, idReparticion: null })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => agregarDependencias(e, modalRepa.idDependencia)} >
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalFirmantes.show} onHide={() => setModalFirmantes({ show: false, firmantes: null })}>
                        <Modal.Header><Modal.Title>MODIFICAR Firmantes</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div class="form-group">
                                    <label for="firmantes">Firmantes</label>
                                    <input type="text" className="form-control" id="firmantes" value={modalFirmantes.firmantes}
                                        onChange={(e) => setModalFirmantes({ ...modalFirmantes, firmantes: e.target.value })} />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalFirmantes({ show: false, firmantes: null })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => editarNormas(e, { firmantes: modalFirmantes.firmantes })}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalDescriptores.show} /* onHide={() => setModalDescriptores({ show: false, id: null, descriptores: [], descriptorSeleccionado: "" })} */>
                        <Modal.Header><Modal.Title>Agregar Descriptor</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div className="form-group">
                                    <label>Descriptores</label>
                                    <div className="dropdown-container" >
                                        <div className={modalDescriptores?.descriptores && modalDescriptores?.descriptores.length > 0 ? "dropdown show" : "dropdown"}>
                                            <input className="form-control buscador input-search" value={modalDescriptores?.descriptorSeleccionado}
                                                onChange={async (e) => {
                                                    setModalDescriptores({ ...modalDescriptores, descriptorSeleccionado: e.target.value })
                                                    await getDescriptoresModal(e.target.value);
                                                }}
                                                data-toggle="dropdown" />
                                            <div className={modalDescriptores?.descriptores && modalDescriptores?.descriptores.length > 0 ? "dropdown-menu show" : "dropdown-menu"}>
                                                {modalDescriptores?.descriptores && modalDescriptores?.descriptores.length > 0 &&
                                                    modalDescriptores?.descriptores.map(elem =>
                                                        <button className="dropdown-item btn btn-sm" type="button"
                                                            onClick={() =>
                                                                setModalDescriptores({ ...modalDescriptores, id: elem.id, descriptorSeleccionado: elem.descriptor })
                                                            }>
                                                            {elem.descriptor}
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>{/* 
                                <div className="card dependencias">
                                    {form.descriptores && form.descriptores?.descriptores?.map((elem) =>
                                        <span className="badge badge-info">
                                            {descriptores.find((n) => n.id === elem).descriptor}&nbsp;
                                            <FaTimes color='#C93B3B' type='button'
                                                onClick={() => setForm({
                                                    ...form,
                                                    ['descriptores']: { descriptores: [...form.descriptores.descriptores.filter(n => n !== elem)] }
                                                })} />
                                        </span>
                                    )}
                                </div> */}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalDescriptores({ show: false, id: null, descriptores: [], descriptorSeleccionado: "" })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={() => agregarDescriptor(modalDescriptores.id)}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalTema.show} onHide={() => setModalTema({ show: false, idTema: null })}>
                        <Modal.Header><Modal.Title>Agregar Tema</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div className="form-group">
                                    <label for="idTema">Tema</label>
                                    <select className="custom-select" id="idTema"
                                        onChange={e => setModalTema({ ...modalTema, idTema: e.target.value })} value={modalTema.idTema}
                                    ><option selected value={null}></option>
                                        {temas && (temas.length > 0) ? (
                                            temas.map((p, index) => (
                                                <option value={p.idTema} key={'opt-sec-' + index}>{p.tema}</option>
                                            ))

                                        ) : (<option selected disabled>No hay temas para mostrar</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalTema({ show: false, idTema: null })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => agregarTema(modalTema.idTema)}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={modalRama.show} onHide={() => setModalRama({ show: false, idRama: null })}>
                        <Modal.Header><Modal.Title>Modificar Rama</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div className="form-wrapper bg-light p-4">
                                <div className="form-group">
                                    <label for="idRama">Rama</label>
                                    <select className="custom-select" id="idRama"
                                        onChange={e => setModalRama({ ...modalRama, idRama: e.target.value })} value={modalRama.idRama}
                                    ><option selected value={null}></option>
                                        {ramas && (ramas.length > 0) ? (
                                            ramas.map((p, index) => (
                                                <option value={p.idRama} key={'opt-sec-' + index}>{p.rama}</option>
                                            ))

                                        ) : (<option selected disabled>No hay ramas para mostrar</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalRama({ show: false, idRama: null })}>
                                Volver
                            </button>
                            <button className="btn btn-primary" onClick={e => editarNormas(e, { idRama: modalRama.idRama })}>
                                Confirmar
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div >
            </>

        );

    }

};

export default BusquedaAvanzada;
