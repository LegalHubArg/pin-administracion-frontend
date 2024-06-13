import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";
import SunEditor from 'suneditor-react';
import './NuevaNorma.css';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { Modal } from 'react-bootstrap';

import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasBO, rutasSDIN } from "../../routes";
import { FaTimes } from 'react-icons/fa';
import { decode } from 'html-entities'
import { Autocomplete } from '../../Components/Autocomplete/Autocomplete'

const NuevaNorma = props => {

    const navigate = useNavigate();

    const [documento, setDocumento] = useState({});
    const [textoActualizado,setTextoActualizado] = useState(null)
    const [adjunto,setAdjunto] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [dependencias, setDependencias] = useState([])
    const [gestiones, setGestiones] = useState([])
    const [clase, setClase] = useState([])
    const [tiposPublicacion, setTiposPublicacion] = useState([])
    const [anexos, setAnexos] = useState([])
    const [organismos, setOrganismos] = useState(null);
    const [normaTipos, setNormaTipos] = useState([]);
    const [extensionesPermitidas, setExtensionesPermitidas] = useState()
    const [modalError, setModalError] = useState({ show: false, mensaje: '' })
    const [limiteArchivo,setLimiteArchivo] = useState()


    const [contentEditor, setContentEditor] = useState("");
    const [contenidoEditorTextoActualizado, setContenidoEditorTextoActualizado] = useState("");
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

    const editorOptionsTA = {
        attributesWhitelist: {
          all: "style"
        },
        previewTemplate: "<div style='width:auto; max-width:900px; margin:auto;'>    <h1>Preview Template</h1>     {{contents}}     <div>_Footer_</div></div>            ",
        buttonList: [
          ["undo", "redo"],
          ["removeFormat"],
          ["font", "fontSize", "formatBlock", "bold", "underline", "italic"],
          ["fontColor", "hiliteColor"],
          ["align", "horizontalRule", "list", 'lineHeight'],
          ["table", "link"],
          ["showBlocks", "codeView"]
        ],
        imageRotation: false,
        font: [
          'Arial'
        ],
        defaultStyle: 'font-family: Arial; font-size: 11px;',
        fontSize: [11],
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


    const handleEditorChange = (e) => {
        setContentEditor(e)
    }

    const initForm = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit"),
        idOrganismo: null,
        alcance: null,
        vigencia: 1,
        idDependencia: null,
        normaNumero: null,
        fechaPublicacion: '',
        fechaSancion: '',
        fechaPromulgacion: '',
        fechaRatificacion: '',
        idNormaTipo: null,
        idNormasEstadoTipo: null,
        idNorma: null,
        titulo: null,
        normaSumario: null,
        idGestion: null,
        nombre: null,
        idClase: null,
        clase: null,
        observaciones: null,
        generaTA: false,
        clausulaDerogatoria: false,
        vigenciaEspecial: false,
        vigenciaEspecialDescripcion: null,
        clausulaDerogatoriaDescripcion: null,
        linkPublicacionBO: null,
        textoOriginal: null,
        idTipoPublicacion: null,
        archivo: '',
        dependencias: [],
        numeroBO: null,
        normaAnio: null,
        checkDigesto: false,
        temasGenerales: '',
        numeroAD: null,
        numeroCD: null,
        checkTA: false,
        aprobadoNormativamente: false,
        plazoDeterminado: false,
        firmantes: '',
        nombreTextoActualizado:'',
        nombreAdjunto:''
    }
    const [form, setForm] = useState(initForm);

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
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
            case 'alcance':
                value = e.target.value
                setForm({
                    ...form,
                    ['alcance']: value
                })
                break;
            case 'vigencia':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['vigencia']: value
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
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                value = null
                }
                setForm({
                ...form,
                ['normaAnio']: value
                })
                break;
            case 'numeroBO':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                value = null
                }
                setForm({
                ...form,
                ['numeroBO']: value
                })
                break;
            case 'fechaPublicacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaPublicacion']: value
                })
                break;
            case 'fechaSancion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaSancion']: value
                })
                break;
            case 'fechaPromulgacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaPromulgacion']: value
                })
                break;
            case 'fechaRatificacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaRatificacion']: value
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
            case 'idOrganismo':
                value = e.target.value;
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
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idDependencia']: value
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
            case 'titulo':
                value = e.target.value;
                setForm({
                    ...form,
                    ['titulo']: value
                })
                break;
            case 'normaSumario':
                value = e.target.value;
                setForm({
                    ...form,
                    ['normaSumario']: value
                })
                break;
            case 'idGestion':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idGestion']: value
                })
                break;
            case 'nombre':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['nombre']: value
                })
                break;
            case 'idClase':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idClase']: value
                })
                break;
            case 'clase':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['clase']: value
                })
                break;
            case 'observaciones':
                value = e.target.value;
                setForm({
                    ...form,
                    ['observaciones']: value
                })
                break;
            case 'generaTA':
                value = e.target.checked;
                setForm({
                    ...form,
                    ['generaTA']: value
                })
                break;
            case 'vigenciaEspecial':
                value = e.target.checked;
                if (value === false) {
                    setForm({
                        ...form,
                        ['vigenciaEspecial']: value,
                        ['vigenciaEspecialDescripcion']: ''
                    })
                    break;
                }
                setForm({
                    ...form,
                    ['vigenciaEspecial']: value
                })
                break;
            case 'clausulaDerogatoria':
                value = e.target.checked;
                if (value === false) {
                    setForm({
                        ...form,
                        ['clausulaDerogatoria']: value,
                        ['clausulaDerogatoriaDescripcion']: ''
                    })
                    break;
                }
                setForm({
                    ...form,
                    ['clausulaDerogatoria']: value
                })
                break;
            case 'vigenciaEspecialDescripcion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['vigenciaEspecialDescripcion']: value
                })
                break;
            case 'clausulaDerogatoriaDescripcion':
                value = e.target.value;

                setForm({
                    ...form,
                    ['clausulaDerogatoriaDescripcion']: value
                })
                break;
            case 'linkPublicacionBO':
                value = e.target.value;
                setForm({
                    ...form,
                    ['linkPublicacionBO']: value
                })
                break;
            case 'tipoPublicacion':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idTipoPublicacion']: value
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
            case 'checkDigesto':
                value = e.target.checked;
                setForm({
                ...form,
                ['checkDigesto']: value
                })
                break;
            case 'temasGenerales':
                value = e.target.value;
                setForm({
                ...form,
                ['temasGenerales']: value
                })
                break;
            case 'numeroAD':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                value = null
                }
                setForm({
                ...form,
                ['numeroAD']: value
                })
                break;
            case 'numeroCD':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                value = null
                }
                setForm({
                ...form,
                ['numeroCD']: value
                })
                break;
            case 'checkTA':
                value = e.target.checked;
                setForm({
                ...form,
                ['checkTA']: value
                })
                break;
            case 'aprobadoNormativamente':
                value = e.target.checked;
                setForm({
                ...form,
                ['aprobadoNormativamente']: value
                })
                break;      
            case 'plazoDeterminado':
                value = e.target.checked;
                setForm({
                ...form,
                ['plazoDeterminado']: value
                })
                break;
            case 'firmantes':
                value = e.target.value
                setForm({
                    ...form,
                    ['firmantes']: value
                })
                break;
        }

    }
    const handleEditorTextoActualizado = (e) => {
        setContenidoEditorTextoActualizado(e)
    }
    
    /* const guardarCambiosTextoActualizado = async () => {
        let body = {
          idNormaSDIN: idNormaSDIN,
          textoActualizado: contenidoEditorTextoActualizado,
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/sdin/normas/editar/texto-actualizado', body, token).then(_ => {
          window.location.reload()
        }).catch(e => { throw e })
    } */

    const handleChangeDoc = async (doc) => {
        let docSize = doc.size
        if (!extensionesPermitidas.includes(doc.type)) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            setDocumento();
            document.getElementById('file-input-documento').value = null;
            return;
        }
        if (docSize && docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            setDocumento();
            document.getElementById('file-input-documento').value = null;
            return;
        }
        await convertirABase64(doc)
            .then(res => {
                setDocumento(res);
            })
        setForm({
            ...form,
            ['archivo']: doc.name
        })
    }
    const handleChangeTA = async (doc) =>{
        let docSize = doc.size
        if (document.getElementById('file-input-ta').files == []){
            setTextoActualizado();
            setForm({...form,nombreTextoActualizado:null})
        }
        if (!extensionesPermitidas.includes(doc.type)) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            setTextoActualizado();
            document.getElementById('file-input-ta').value = null;
            return;
        }
        if (docSize && docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            setTextoActualizado();
            document.getElementById('file-input-ta').value = null;
            return;
        }
        await convertirABase64(doc)
            .then(res => {
                setTextoActualizado(res);
            })
        setForm({
            ...form,
            ['nombreTextoActualizado']: doc.name
        })
    }
    const deleteTA = ()=>{
        setTextoActualizado(null);
        setForm({ ...form, nombreTextoActualizado: null });
        document.getElementById('file-input-ta').files = null
        document.getElementById('file-input-ta').value = null
    }
    const deleteAdjunto = () =>{
        setAdjunto(null);
        setForm({...form,nombreAdjunto:null});
        document.getElementById('file-input-adjunto').files = null
        document.getElementById('file-input-adjunto').value = null

    }
    const handleChangeAdjunto = async (doc) =>{
        let docSize = doc.size
        if (!extensionesPermitidas.includes(doc.type)) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            setAdjunto();
            document.getElementById('file-input-adjunto').value = null;
            return;
        }
        if (docSize && docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            setAdjunto();
            document.getElementById('file-input-adjunto').value = null;
            return;
        }
        await convertirABase64(doc)
            .then(res => {
                setAdjunto(res);
            })
        setForm({
            ...form,
            ['nombreAdjunto']: doc.name
        })
    }

    const handleChangeAnexos = async (files) => {
        let auxArray = Array.from(anexos)
        if (Array.from(files).some(n => !extensionesPermitidas.includes(n.type))) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            return;
        }
        if (Array.from(files).some(n => n.size > limiteArchivo)){
            setModalError({ show: true, mensaje: "Uno de los archivos supera el límite permitido en PIN." })
            return;
        }
        for (const file of files) {
            await convertirABase64(file)
                .then(res => {
                    auxArray.push({ archivo: file.name, base64: res });
                })
        }
        setAnexos(Array.from(auxArray))
        document.getElementById("file-input-anexos").value = null;
    }

    function deleteAnexo(index) {
        let auxArray = anexos;
        auxArray.splice(index, 1)
        setAnexos(Array.from(auxArray))
    }
    function eliminarDocumento() {
        setDocumento({});
        setForm({ ...form, archivo: '' });
        document.getElementById('file-input-documento').files = null
        document.getElementById('file-input-documento').value = null
    }

    const convertirABase64 = async (doc) => {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(doc);
            fileReader.onloadend = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = error => {
                reject(error);
            }
        })
    }

    const getOrganismos = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/sdin/organismos', token).then((res) => {
                setOrganismos(Array.from(res.data.data))
            }).catch(function (error) {
                setLoading(false)
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
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
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            linkToParams('/', {}, navigate)
        }
    }

    const getGestion = async () => {
        setLoading(true);
        let body = {
            usuario: localStorage.getItem('user_cuit')
        }
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/sdin/gestiones', body, token).then((res) => {
                setGestiones(Array.from(res.data.nombre))
            }).catch(function (error) {
                setLoading(false)
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            //console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getClase = async () => {
        setLoading(true);
        let body = {
            usuario: localStorage.getItem('user_cuit')
        }
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/sdin/clases', body, token).then((res) => {
                setClase(Array.from(res.data.clases))
            }).catch(function (error) {
                setLoading(false)
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            //console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getTiposPublicaciones = async () => {
        setLoading(true);
        let body = {
            usuario: localStorage.getItem('user_cuit')
        }
        try {
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/sdin/tipos-publicaciones', body, token).then((res) => {
                setTiposPublicacion(Array.from(res.data.tiposPublicaciones))
            }).catch(function (error) {
                setLoading(false)
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            let body = { ...form, documento, anexos,contenidoEditorTextoActualizado,textoActualizado,adjunto, cuit: localStorage.getItem("user_cuit").toString() }
            await ApiPinPost('/api/v1/sdin/normas/crear', body, token).then((res) => {
                navigate("/sdin/ficha-norma/" + String(res.data.idNormaSDIN))
            }).catch(function (error) {
                setLoading(false)
                //console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            //console.log(error);
        }
    }

    //Guardo el contenido del editor como texto de la norma
    useEffect(() => {
        setForm({ ...form, textoOriginal: contentEditor })
    }, [contentEditor])

    const traerExtensiones = async () => {
        const { data: { data } } = await ApiPinGet('/api/v1/auth/extensiones', localStorage.token);

        setExtensionesPermitidas(data)
    }
    const traerLimiteArchivo = async () =>{
        await ApiPinGet('/api/v1/auth/limiteArchivo', localStorage.token)
          .then(res=>{
            setLimiteArchivo(parseInt(res.data.data))
          })
          .catch(err=>{
            throw Error(String(err))
          })
      }

    //Hook inicial
    useEffect(async () => {
        await getOrganismos();
        await getDependencias();
        await getClase();
        await getGestion();
        await getTiposPublicaciones();
        await traerExtensiones();
        await traerLimiteArchivo()
        const normaTiposArray = await ApiPinGet('/api/v1/sdin/normas/tipos', localStorage.getItem('token'));
        setNormaTipos(normaTiposArray.data.data)
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-nueva-norma">
                    <form className="form" onSubmit={e => handleSubmit(e)}>
                        <div className="accordion">
                            <div className="card" id="datosBasicos">
                                <button
                                    id="boton1"
                                    className="card-header card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse1"
                                    type="button"
                                >
                                    DATOS BÁSICOS
                                </button>
                                <div id="collapse1" className="collapse show" data-parent="#accordion">
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label for="alcance">Alcance</label>
                                            <select className="custom-select" id="alcance" name="alcance" onChange={e => handleFormChange(e)}
                                                value={(form.alcance != null) ? form.alcance : ''}
                                            >
                                                <option value={''}></option>
                                                <option value={'G'}>General</option>
                                                <option value={'P'}>Particular</option>
                                                <option value={'X'}>N/A</option>
                                                <option value={'M'}>M</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="idNormaTipo">Tipo de Norma</label>
                                            <select className="custom-select" id="idNormaTipo" name="idNormaTipo" onChange={e => handleFormChange(e)}
                                                value={(form.idNormaTipo != null) ? form.idNormaTipo : -1} required
                                            ><option selected value="" hidden></option>
                                                {normaTipos && (normaTipos.length > 0) ? (
                                                    normaTipos.map((p, index) => (
                                                        <option value={p.idNormaTipo} key={'opt-sec-' + index}>{decode(p.normaTipo)}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay tipos de normas para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="idSeccion">Vigencia</label>
                                            <select className="custom-select" id="vigencia" name="vigencia" onChange={e => handleFormChange(e)} value={(form.vigencia != null) ? form.vigencia : -1}
                                            ><option value={0}>No vigente</option>
                                                <option value={1}>Vigente</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="">Número</label>
                                            <input type="text" className="form-control" id="normaNumero" name="normaNumero" pattern="[0-9]*"
                                                onChange={e => handleFormChange(e)} value={form.normaNumero}/>
                                        </div>
                                        <div className="form-group">
                                            <label for="normaAnio">Año</label>
                                            <input type="number" className="form-control" id="normaAnio" name="normaAnio" pattern="[0-9]*"
                                                onChange={e => handleFormChange(e)} value={form.normaAnio} required />
                                        </div>
                                        <div className="form-group">
                                            <label for="numeroBO">Número de Boletín</label>
                                            <input type="number" className="form-control" id="numeroBO" name="numeroBO" pattern="[0-9]*"
                                                onChange={e => handleFormChange(e)} value={form.numeroBO} required />
                                        </div>
                                        <div className="form-group">
                                            <div 
                                                class="custom-control custom-checkbox" 
                                                style={{marginTop: "25px", textAlignLast: "center"}}
                                            >
                                            <input type="checkbox" class="custom-control-input" name="checkDigesto" id="checkDigesto"
                                                checked={form.checkDigesto} onChange={e => handleFormChange(e)} />
                                            <label for="checkDigesto" class="custom-control-label">Check Digesto</label>
                                            </div>
                                        </div>
                                        <div className="form-group fila">
                                            <label for="">Título</label>
                                            <input type="text" className="form-control" id="titulo" name="titulo" onChange={e => handleFormChange(e)} value={form.titulo} />
                                        </div>
                                        <div className="form-group fila">
                                            <label for="">Síntesis</label>
                                            <textarea type="text" className="form-control" id="normaSumario" name="normaSumario" pattern="[0-9]*"
                                                onChange={e => handleFormChange(e)} value={form.normaSumario} />
                                        </div>
                                        <div className="form-group fila">
                                            <label for="temasGenerales">Temas Generales</label>
                                            <textarea type="text" className="form-control" id="temasGenerales" name="temasGenerales" pattern="[0-9]*"
                                                onChange={e => handleFormChange(e)} value={form.temasGenerales} />
                                        </div>

                                        <div className="form-group">
                                            <label for="idSeccion">Tipo Publicacion</label>
                                            <select className="custom-select" id="tipoPublicacion" name="tipoPublicacion"
                                                onChange={e => handleFormChange(e)} value={(form.idTipoPublicacion != null) ? form.idTipoPublicacion : -1}
                                            ><option selected value="" hidden></option>
                                                {tiposPublicacion && (tiposPublicacion.length > 0) ? (
                                                    tiposPublicacion.map((p, index) => (
                                                        <option value={p.idTipoPublicacion} key={'opt-sec-' + index}>{p.tipoPublicacion}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay tipos para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="fechaPublicacion">Fecha Publicacion</label>
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
                                            <label for="fechaPromulgacion">Fecha Promulgacion</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="fechaPromulgacion"
                                                name="fechaPromulgacion"
                                                aria-describedby="date-help"
                                                onChange={e => handleFormChange(e)} value={form.fechaPromulgacion}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label for="fechaRatificacion">Fecha Ratificacion</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="fechaRatificacion"
                                                name="fechaRatificacion"
                                                aria-describedby="date-help"
                                                onChange={e => handleFormChange(e)} value={form.fechaRatificacion}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label for="fechaSancion">Fecha Sanción</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="fechaSancion"
                                                name="fechaSancion"
                                                aria-describedby="date-help"
                                                onChange={e => handleFormChange(e)} value={form.fechaSancion}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label for="idSeccion">Gestion</label>
                                            <select className="custom-select" id="idGestion" name="idGestion" onChange={e => handleFormChange(e)}
                                                value={(form.idGestion != null) ? form.idGestion : -1}
                                            ><option selected value="" hidden></option>
                                                {gestiones && (gestiones.length > 0) ? (
                                                    gestiones.map((p, index) => (
                                                        <option value={p.idGestion} key={'opt-sec-' + index}>{decode(p.nombre)}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay gestiones para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="idOrganismo">Organismo</label>
                                            <select className="custom-select" id="idOrganismo" name="idOrganismo"
                                                onChange={e => handleFormChange(e)} value={(form.idOrganismo != null) ? form.idOrganismo : -1}
                                                required><option selected value="" hidden></option>
                                                {organismos && (organismos.length > 0) ? (
                                                    organismos.map((p, index) => (
                                                        <option value={p.idOrganismo} key={'opt-sec-' + index}>{decode(p.organismo)}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay organismos para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label for="idDependencia">Dependencia</label>
                                            <select className="custom-select" id="idDependencia" name="idDependencia" onChange={e => handleFormChange(e)}
                                                value={(form.idDependencia != null) ? form.idDependencia : -1}
                                            ><option selected value="" hidden></option>
                                                {dependencias && (dependencias.length > 0) ? (
                                                    dependencias.map((p, index) => (
                                                        <option value={p.idDependencia} key={'opt-sec-' + index}>{decode(p.dependencia)}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay reparticiones para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group fila">
                                            <label for="">Firmantes</label>
                                            <input type="text" className="form-control" id="firmantes" name="firmantes"
                                                onChange={e => handleFormChange(e)} value={form.firmantes} />
                                        </div>
                                        <div className="form-group">
                                            <label for="">Link Publicación BO</label>
                                            <input type="text" className="form-control" id="linkPublicacionBO" name="linkPublicacionBO" onChange={e => handleFormChange(e)} value={form.linkPublicacionBO} />
                                        </div>
                                        <div className="form-group">
                                            <label for="">Dependencias</label>
                                            <Autocomplete
                                                valores={dependencias.map(n => ({ id: n.idDependencia, nombre: decode(n.dependencia) }))}
                                                setValue={e => setForm({
                                                    ...form,
                                                    dependencias: [...form.dependencias, { idDependencia: e.id, dependencia: dependencias.find(n => n.idDependencia === e.id).dependencia }]
                                                })} />
                                        </div>
                                        <div className="card dependencias">
                                            {dependencias && form?.dependencias?.length > 0 && form?.dependencias?.map((elem) =>
                                                <span className="badge badge-info" style={{whiteSpace:"normal", padding:"1em 1em 2em 1em"}}>
                                                    {decode(elem.dependencia)}&nbsp;
                                                    <FaTimes color='#C93B3B' type='button'
                                                        onClick={() => setForm({
                                                            ...form,
                                                            ['dependencias']: [...form.dependencias.filter(n => n !== elem)]
                                                        })} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label for="numeroAD">Numero AD</label>
                                            <input type="text" className="form-control" id="numeroAD" name="numeroAD"
                                            onChange={e => handleFormChange(e)} value={form.numeroAD} autoComplete="off" />
                                        </div>
                                        <div className="form-group">
                                            <label for="numeroCD">Numero CD</label>
                                            <input type="text" className="form-control" id="numeroCD" name="numeroCD"
                                            onChange={e => handleFormChange(e)} value={form.numeroCD} autoComplete="off" />
                                        </div>
                                        <div className="form-group obs">
                                            <label for="observaciones">Observaciones</label>
                                            <textarea type="text" className="form-control" id="observaciones" name="observaciones"
                                                onChange={e => handleFormChange(e)} value={form.observaciones} />
                                        </div>
                                        <div className="form-group">
                                            <label for="idClase">Clase</label>
                                            <select className="custom-select" id="idClase" name="idClase" onChange={e => handleFormChange(e)} value={(form.idClase != null) ? form.idClase : -1}
                                            ><option selected value="" hidden></option>
                                                {clase && (clase.length > 0) ? (
                                                    clase.map((p, index) => (
                                                        <option value={p.idClase} key={'opt-sec-' + index}>{p.clase}</option>
                                                    ))

                                                ) : (<option selected disabled>No hay clases para mostrar</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <div class="custom-control custom-checkbox">
                                                <input type="checkbox" class="custom-control-input" name="generaTA" id="generaTA" checked={form.generaTA} onChange={e => handleFormChange(e)} />
                                                <label for="generaTA" class="custom-control-label">Genera TA</label>
                                            </div>
                                        </div>
                                        <div class="custom-control custom-checkbox">
                                            <input type="checkbox" className="custom-control-input" name="plazoDeterminado" id="plazoDeterminado"
                                            checked={form.plazoDeterminado} onChange={e => handleFormChange(e)} />
                                            <label for="plazoDeterminado" className="custom-control-label">Plazo Determinado</label>
                                        </div>
                                        <div className="form-group">
                                            <div class="custom-control custom-checkbox">
                                            <input type="checkbox" className="custom-control-input" name="aprobadoNormativamente"
                                                id="aprobadoNormativamente" checked={form.aprobadoNormativamente} onChange={e => handleFormChange(e)} />
                                            <label for="aprobadoNormativamente" className="custom-control-label">Aprobado Normativamente</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div class="custom-control custom-checkbox">
                                            <input type="checkbox" class="custom-control-input" name="checkTA" id="checkTA"
                                                checked={form.checkTA} onChange={e => handleFormChange(e)} />
                                            <label for="checkTA" class="custom-control-label">TA</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div class="custom-control custom-checkbox">
                                                <input type="checkbox" class="custom-control-input" name="clausulaDerogatoria" id="clausulaDerogatoria" checked={form.clausulaDerogatoria} onChange={e => handleFormChange(e)} />
                                                <label for="clausulaDerogatoria" class="custom-control-label">Clausula Derogatoria Indeterminada</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <textarea type="text" className="form-control" id="clausulaDerogatoriaDescripcion" name="clausulaDerogatoriaDescripcion"
                                                onChange={e => handleFormChange(e)} value={form.clausulaDerogatoriaDescripcion} hidden={!form.clausulaDerogatoria} />
                                        </div>
                                        <div className="form-group">
                                            <div class="custom-control custom-checkbox">
                                                <input type="checkbox" class="custom-control-input" name="vigenciaEspecial" id="vigenciaEspecial" checked={form.vigenciaEspecial} onChange={e => handleFormChange(e)} />
                                                <label for="vigenciaEspecial" class="custom-control-label">Vigencia Especial</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <textarea type="text" className="form-control" id="vigenciaEspecialDescripcion" name="vigenciaEspecialDescripcion"
                                                onChange={e => handleFormChange(e)} value={form.vigenciaEspecialDescripcion} hidden={!form.vigenciaEspecial} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <button
                                    id="boton2"
                                    className="card-header card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse2"
                                    type="button"
                                >
                                    NORMA ORIGINAL / ANEXOS
                                </button>
                                <div id="collapse2" className="collapse show" data-parent="#accordion">
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label for="file-input-documento" class="custom-file-upload">Documento Original</label>
                                            <div className="d-flex">
                                                <input type="file" className="form-control-file" id="file-input-documento" onChange={(e) => handleChangeDoc(e.target.files[0])} accept={extensionesPermitidas} />
                                                {documento && form.archivo &&
                                                    <FaTimes color="#C93B3B" type='button' onClick={() => eliminarDocumento()}
                                                        title="Eliminar" id="eliminar-documento" />}
                                            </div>
                                        </div>
                                        <div className="form-group carga-anexos">
                                            <label for="file-input-anexos" class="custom-file-upload">Anexos</label>
                                            <input type="file" multiple className="form-control-file" id="file-input-anexos" onChange={(e) => handleChangeAnexos(e.target.files)} accept={extensionesPermitidas} />
                                        </div>
                                        {anexos && anexos.map((ax, index) =>
                                            <div>
                                                {ax.archivo}&nbsp;<FaTimes color="#C93B3B" type='button' onClick={() => deleteAnexo(index)} title="Eliminar" />
                                            </div>)}
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <button
                                    id="boton3"
                                    className="card-header card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse3"
                                    type="button"
                                >
                                    TEXTO DE LA NORMA
                                </button>
                                <div id="collapse3" className="collapse show" data-parent="#accordion">
                                    <div className="card-body">
                                        <div>
                                            <div className="">
                                                <SunEditor height="400px" placeholder="Ingrese el texto de la norma..." lang="es"
                                                    setOptions={editorOptions}
                                                    setContents={contentEditor}
                                                    onChange={e => handleEditorChange(e)}
                                                    id="textoOriginal" name="textoOriginal"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <button
                                    id="boton4"
                                    className="card-header card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse4"
                                    type="button"
                                >
                                    TEXTO ACTUALIZADO / ARCHIVO ADJUNTO
                                </button>
                                <div id="collapse4" className="collapse show" data-parent="#accordion">
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label for="file-input-ta" class="custom-file-upload">Texto Actualizado</label>
                                            <div className="d-flex">
                                                <input type="file" className="form-control-file" id="file-input-ta" onChange={(e) => handleChangeTA(e.target.files[0])} accept={extensionesPermitidas} />
                                                {textoActualizado && form.nombreTextoActualizado &&
                                                <FaTimes color="#C93B3B" type='button' onClick={() => deleteTA()}
                                                title="Eliminar" id="eliminar-textoActualizado" />
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group carga-anexos">
                                            <label for="file-input-adjunto" class="custom-file-upload">Archivo Adjunto</label>
                                            <input type="file" className="form-control-file" id="file-input-adjunto" onChange={(e) => handleChangeAdjunto(e.target.files[0])} accept={extensionesPermitidas} />
                                        </div>
                                        {adjunto && form.nombreAdjunto && 
                                        <FaTimes color="#C93B3B" type='button' onClick={() => deleteAdjunto()}
                                        title="Eliminar" id="eliminar-textoActualizado" />
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <button
                                    id='boton4'
                                    className="card-header card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse4"
                                    type="button">
                                    Texto Actualizado Editor
                                </button>

                                <div
                                    className="collapse show"
                                    id="collapse4"
                                    data-parent="#accordion"
                                    >
                                    <div className="">
                                        <SunEditor height="400px" placeholder="Ingrese el texto de la norma..." lang="es"
                                            setOptions={editorOptionsTA}
                                            setContents={contenidoEditorTextoActualizado}
                                            onChange={e => handleEditorTextoActualizado(e)}
                                            id="textoActualizado" name="textoActualizado"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <button className="btn btn-primary btn-lg boton-guardar" type="submit">Cargar Norma</button>
                    </form>
                </div>
                <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
                    <Modal.Header className='d-flex justify-content-between'>Error<i type="button" className="bx bx-x" style={{ justifySelf: "end" }} onClick={_ => setModalError({ show: false, mensaje: '' })} /></Modal.Header>
                    <Modal.Body>
                        <div className="alert alert-danger">{modalError.mensaje}</div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>

            </>

        );

    }

};

export default NuevaNorma;
