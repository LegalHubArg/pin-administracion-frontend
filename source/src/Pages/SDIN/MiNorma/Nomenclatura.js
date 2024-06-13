import React, { useState, useEffect } from 'react';
import Relaciones from "./Relaciones";
import AnalisisNormativo from "./AnalisisNormativo";
import AnalisisDocumental from "./AnalisisDocumental";
import LogsDetalle from "./LogsDetalle";
import AnalisisEpistemologico from "./AnalisisEpistemologico";
import Front from "./Front";
import Historial from "./Historial";
import './TabsNomenclatura.css'
import { Modal } from 'react-bootstrap';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import SunEditor from 'suneditor-react';
//DateTime
import { timestampToDateFormat } from '../../../Helpers/DateTime';
import './Nomenclatura.css';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaRegWindowRestore, FaTrash, FaDownload, FaCopy } from 'react-icons/fa';
import { rutasSDIN } from '../../../routes';
//HTML decode
import { decode } from 'html-entities';
const b64toBlob = require('b64-to-blob');

const Nomenclatura = props => {

  const navigate = useNavigate();
  let { idNormaSDIN } = useParams();
  let location = useLocation()

  const [isLoading, setLoading] = useState(true) //API Check
  const [norma, setNorma] = useState({});
  const [documentoOriginal, setDocumentoOriginal] = useState(null);
  const [nuevoDocumentoOriginal, setNuevoDocumentoOriginal] = useState();
  const [textoActualizado, setTextoActualizado] = useState(null);
  const [nuevoTextoActualizado, setNuevoTextoActualizado] = useState();
  const [nuevoAnexo, setNuevoAnexo] = useState();
  const [nuevoAdjunto, setNuevoAdjunto] = useState();
  const [anexos, setAnexos] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [datosSesion, setDatosSesion] = useState({
    usuario: null,
    nombre: null,
    token: null
  });
  const [extensionesPermitidas, setExtensionesPermitidas] = useState()
  const [limiteArchivo, setLimiteArchivo] = useState()
  const [showModalAsignar, setShowModalAsignar] = useState(false)
  const [modalCambiarEstado, setModalCambiarEstado] = useState({ show: false, idNormasEstadoTipo: null })
  const [showModalBorrar, setShowModalBorrar] = useState(false)
  const [estados, setEstados] = useState()
  const [analistas, setAnalistas] = useState()
  const [historial, setHistorial] = useState([])
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })
  const [archivoS3tipo,setArchivoS3tipo] = useState(false)
  const [textoActualizadoS3tipo,setTextoActualizadoS3tipo] = useState(false)
  //const [edicionTextoActualizado, setEdicionTextoActualizado] = useState(false)

  const [loadHistorial, setLoadHistorial] = useState(false)

  const [tab, setTab] = useState("Analisis Normativo")

  const ContenidoTab = ({ }) => {
    if (tab) {
      switch (tab) {
        default:
        case "Analisis Normativo":
          return <AnalisisNormativo norma={norma} />
        case "Relaciones":
          return <Relaciones norma={norma} />
        case "Analisis Documental":
          return <AnalisisDocumental norma={norma} />
        case "Analisis Epistemologico":
          return <AnalisisEpistemologico norma={norma} />
        case "Front":
          return <Front norma={norma} />
        case "Historial":
          return <Historial norma={norma} />
        case "Logs":
          return <LogsDetalle norma={norma} />
      }
    }
  }

  const [contenidoEditorTextoOriginal, setContenidoEditorTextoOriginal] = useState("");
  const [contenidoEditorTextoActualizado, setContenidoEditorTextoActualizado] = useState("");

  const editorOptions = {
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

  const getNorma = async () => {
    let data = {};
    try {
      let body = {
        idNormaSDIN: idNormaSDIN,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/norma', body, token).then(res => {
        data = res.data.norma[0];
        if (data.idNormasEstadoTipo === 0) { navigate(rutasSDIN.home) }
        setNorma(data);
        setContenidoEditorTextoOriginal(data.textoOriginal)
        setContenidoEditorTextoActualizado(data.textoActualizado)

      })

      if (data.archivoS3) {
        let extension = data.archivoS3.split('.').pop().toLowerCase();
        if (extension == 'doc'){
          setArchivoS3tipo(true)
        }
        await ApiPinPost('/api/v1/sdin/traerArchivoNorma', { nombre: data.archivoS3 }, token).then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          setDocumentoOriginal(blobUrl)
        })
          .catch(e => { })
      }
      if (data.archivoTextoActualizadoS3) {
        // Si el archivo ya esta cargado, edito el registro, si no, lo creo
        //setEdicionTextoActualizado(true)
        let extension = data.archivoTextoActualizadoS3.split('.').pop().toLowerCase();
        if (extension == 'doc'){
          setTextoActualizadoS3tipo(true)
        }
        await ApiPinPost('/api/v1/sdin/traerArchivoNorma', { nombre: data.archivoTextoActualizadoS3 }, token).then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          setTextoActualizado(blobUrl)
        })
          .catch(e => { })
      }
      if (data.anexos && data.anexos.length > 0) {
        let auxAnexos = [...data.anexos];
        for (let i = 0; i < auxAnexos.length; i++) {
          const extension = auxAnexos[i].archivoS3.split('.').pop().toLowerCase();
          if (extension == 'doc'){
            auxAnexos[i].isDoc = true
          }else{
            auxAnexos[i].isDoc = false
          }
          await ApiPinPost('/api/v1/sdin/traerArchivoNorma', { nombre: auxAnexos[i].archivoS3 }, token).then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            auxAnexos[i].blob = blobUrl
          })
            .catch(e => { })
          setAnexos(auxAnexos)
        }
      }
      setContenidoEditorTextoOriginal(data.textoOriginal)
      setContenidoEditorTextoActualizado(data.textoActualizado)
      setLoading(false)

    }
    catch (error) {
      setLoading(false)
      // throw error
    }
  }
  const traerExtensiones = async () => {
    const { data: { data } } = await ApiPinGet('/api/v1/auth/extensiones', localStorage.token);
    setExtensionesPermitidas(data)
  }
  const traerLimiteArchivo = async () => {
    await ApiPinGet('/api/v1/auth/limiteArchivo', localStorage.token)
      .then(res => {
        setLimiteArchivo(parseInt(res.data.data))
      })
      .catch(err => {
        throw Error(String(err))
      })
  }

  useEffect(async () => {
    if (location.state && location.state.tab) {
      setTab(location.state.tab)
      document.getElementsByClassName('tabs')[0]?.scrollIntoView({
        behavior: 'smooth'
      });
    }
    if (idNormaSDIN) {
      setDatosSesion({
        ...datosSesion,
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
      })
      await getNorma()
        .catch((e) => {
          navigate(-1) || navigate('/', { replace: true });
        })
      await getAnalistas()
      await getEstados()
      await traerHistorial()
      await traerImagenes()
      await traerExtensiones();
      await traerLimiteArchivo()
    }
    else {
      navigate('/', { state: {}, replace: true })
    }

  }, [])

  useEffect(() => {
    if (norma && norma.textoOriginal) {
      let modified = norma.textoOriginal;
      modified = modified.replace(
        /<imagen([^>]*)>/g,
        match => {
          if (imagenes && imagenes.length > 0) {
            const index = parseInt(match.match(/\d+/)[0]) - 1;
            if (!isNaN(index) && index < imagenes.length) {
              const orderedImages = imagenes.sort((a, b) => a.numero - b.numero);
              const image = orderedImages[index];
              return `
                <a href="/sdin/ficha-norma/${norma.idNormaSDIN}/imagen/${image.numero}" target="_blank">Ver archivo ${image.numero}</a>`;
            }
          }
          return match;
        }
      );

      setContenidoEditorTextoOriginal(modified);
    }
  }, [norma, imagenes]);

  const borrarNormas = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        normas: [idNormaSDIN]
      }
      await ApiPinPost('/api/v1/sdin/normas/borrar', body, token)
        .then(() => {
          window.location.reload();
        })
    }
    catch (e) { setLoading(false) }
  }

  const borrarDocumentoOriginal = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        metadatos: { archivo: null, archivoS3: null },
        normas: [idNormaSDIN]
      }
      await ApiPinPost('/api/v1/sdin/normas/editar', body, token)
        .then(() => {
          window.location.reload();
        })
    }
    catch (e) { setLoading(false) }
  }

  const borrarTextoActualizado = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        metadatos: { archivo: null, archivoS3: null },
        normas: [idNormaSDIN],
      }
      await ApiPinPost('/api/v1/sdin/normas/editar/archivo-texto-actualizado', body, token)
        .then(() => {
          window.location.reload();
        })
    }
    catch (e) { setLoading(false) }
  }

  const asignarNormas = async (e, idUsuario) => {
    e.preventDefault();
    let token = localStorage.getItem("token");
    let body = {
      usuario: localStorage.getItem("user_cuit"),
      idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
      normas: [idNormaSDIN],
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

  async function cambiarEstadoNormas(e) {
    e.preventDefault()
    document.getElementsByClassName("botones-modal").disabled = true;
    let token = localStorage.getItem("token");
    let body = {
      usuario: localStorage.getItem("user_cuit"),
      idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
      normas: [idNormaSDIN],
      idNormasEstadoTipo: modalCambiarEstado.idNormasEstadoTipo
    }
    await ApiPinPost('/api/v1/sdin/normas/editar/estado', body, token).then((res) => {
      window.location.reload()
    }).catch(e => { /* console.log(e) */ })
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
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/usuarios/sdin', body, token).then((res) => {
        setAnalistas(Array.from(res.data.data))
      })
    }
    catch (error) {
    }
  }

  const handleEditorTextoOriginal = (e) => {
    setContenidoEditorTextoOriginal(e)
  }

  const handleEditorTextoActualizado = (e) => {
    setContenidoEditorTextoActualizado(e)
  }

  async function handleTextoActualizado(e) {
    e.preventDefault();
    if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setNuevoTextoActualizado();
      return;
    }
    if (Array.from(e.target.files).some(n => n.size > limiteArchivo)) {
      setModalError({ show: true, mensaje: "Un archivo supera el límite permitido en PIN." })
      setNuevoTextoActualizado();
      return;
    }
    if (e.target.files.length === 0) {
      setNuevoTextoActualizado();
      return
    }
    let base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
    setNuevoTextoActualizado({ base64, archivo: e.target.files[0].name })
  }

  async function handleDocumentoOriginal(e) {
    e.preventDefault();
    if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setNuevoDocumentoOriginal();
      return;
    }
    if (Array.from(e.target.files).some(n => n.size > limiteArchivo)) {
      setModalError({ show: true, mensaje: "Un archivo supera el límite permitido en PIN." })
      setNuevoDocumentoOriginal();
      return;
    }
    if (e.target.files.length === 0) {
      setNuevoDocumentoOriginal();
      return
    }
    let base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
    setNuevoDocumentoOriginal({ base64, archivo: e.target.files[0].name })
  }

  async function handleAnexo(e) {
    e.preventDefault();
    if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setNuevoAnexo();
      return;
    }
    if (Array.from(e.target.files).some(n => n.size > limiteArchivo)) {
      setModalError({ show: true, mensaje: "Un archivo supera el límite permitido en PIN." })
      setNuevoAnexo();
      return;
    }
    if (e.target.files.length === 0) {
      setNuevoAnexo();
      return
    }
    let base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
    setNuevoAnexo({ base64, archivo: e.target.files[0].name })
  }

  async function handleAdjunto(e) {
    e.preventDefault();
    if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setNuevoAdjunto();
      return;
    }
    if (Array.from(e.target.files).some(n => n.size > limiteArchivo)) {
      setModalError({ show: true, mensaje: "Un archivo supera el límite permitido en PIN." })
      setNuevoAdjunto();
      return;
    }
    if (e.target.files.length === 0) {
      setNuevoAdjunto();
      return
    }
    let base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
    setNuevoAdjunto({ base64, archivo: e.target.files[0].name })
  }

  async function guardarDoc(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        normas: [idNormaSDIN],
        metadatos: { archivo: nuevoDocumentoOriginal.archivo },
        usuario: localStorage.getItem("user_cuit"),
        base64: nuevoDocumentoOriginal.base64
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/editar', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
      setModalError({ show: true, mensaje: "Error al guardar el archivo " + nuevoDocumentoOriginal?.archivo })
    }
  }

  async function guardarTextoActualizado(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        normas: [idNormaSDIN],
        metadatos: { archivo: nuevoTextoActualizado.archivo },
        usuario: localStorage.getItem("user_cuit"),
        base64: nuevoTextoActualizado.base64,
        //textoActualizado: true,
        //edicion: edicionTextoActualizado
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/editar/archivo-texto-actualizado', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
      setModalError({ show: true, mensaje: "Error al guardar el archivo " + nuevoTextoActualizado?.archivo })
    }
  }

  async function guardarAnexo(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        idNormaSDIN,
        ...nuevoAnexo,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/anexos/agregar', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
    }
  }

  async function borrarAnexo(e, idAnexoSDIN) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        idAnexoSDIN,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/anexos/borrar', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
    }
  }

  async function guardarAdjunto(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        idNormaSDIN,
        ...nuevoAdjunto,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/adjuntos/agregar', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
    }
  }

  async function borrarAdjunto(e, idAdjuntoSDIN) {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        idAdjuntoSDIN,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/normas/adjuntos/borrar', body, token).then(_ => {
        window.location.reload()
      })
    }
    catch (e) {
      setLoading(false)
    }
  }

  const guardarCambiosTextoOriginal = async () => {
    let body = {
      idNormaSDIN: idNormaSDIN,
      textoOriginal: contenidoEditorTextoOriginal,
      usuario: localStorage.getItem("user_cuit")
    }
    let token = localStorage.getItem("token");
    await ApiPinPost('/api/v1/sdin/normas/editar/texto-original', body, token).then(_ => {
      window.location.reload()
    }).catch(e => { throw e })
  }

  const guardarCambiosTextoActualizado = async () => {
    let body = {
      idNormaSDIN: idNormaSDIN,
      textoActualizado: contenidoEditorTextoActualizado,
      usuario: localStorage.getItem("user_cuit")
    }
    let token = localStorage.getItem("token");
    await ApiPinPost('/api/v1/sdin/normas/editar/texto-actualizado', body, token).then(_ => {
      window.location.reload()
    }).catch(e => { throw e })
  }

  const traerHistorial = async () => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/historial', body, token)
        .then(res => {
          setLoading(false);
          setHistorial(res.data.historial)
          setLoadHistorial(true)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //conso
    }
  }

  const traerImagenes = async () => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/imagenes', body, token)
        .then(res => {
          setLoading(false);
          setImagenes(res.data.imagenes)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //conso
    }
  }

  const traerArchivo = async (nombre) => {
    let body = {
      nombre
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/traerArchivoNorma', body, token)
        .then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        })
    }
    catch (e) {
      setModalError({ show: true, mensaje: "No se encontró el documento: " + nombre })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
  }
  // COLORES DE LA NOMENCLATURA
  const colorNormaTipo = { color: 'blue' };
  const colorNormaNumero = { color: 'red' };
  const colorOrganismo = { color: 'green' };
  const colorDependencia = { color: 'purple' };
  const colorAnio = { color: 'blue' };

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>

        <div className="container mb-2" id="pagina-detalle-solicitud">
          <div className="container responsive">
            <div className="main-grid">
              <div className="documentos">
                <h3>Norma: # {norma.idNormaSDIN}</h3>
                {norma && <h4>Nomenclatura: <b style={colorNormaTipo}>{decode(norma.normaTipo)}</b> N° <b style={colorNormaNumero}>{norma.normaNumero}</b> / <b style={colorOrganismo}>{norma.siglaOrganismo}</b> / <b style={colorDependencia}>{norma.siglaDependencia}</b> / <b style={colorAnio}>{norma.fechaSancion ? moment(norma.fechaSancion).format('YY') : ''}</b></h4>}

                <div className="accordion" id="accordion">
                  <div className="card">
                    <button className="card-header card-link mb-1 collapsed"
                      data-toggle="collapse" data-target="#collapseOne">
                      Texto Original
                    </button>
                    <div className="collapse" id="collapseOne" data-parent="#accordion">
                      <div className="card-body">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: decode(norma?.textoOriginal?.toString()).replace(
                              /<imagen([^>]*)>/g,
                              match => {
                                if (imagenes && imagenes.length > 0) {
                                  const index = parseInt(match.match(/\d+/)[0] - 1);
                                  if (!isNaN(index) && index < imagenes.length) {
                                    const orderedImages = imagenes.sort((a, b) => a.numero - b.numero); // Ordenar imágenes por número
                                    const image = orderedImages[index];
                                    return `<a href="/sdin/ficha-norma/${norma.idNormaSDIN}/imagen/${image.numero}" target="_blank">Ver archivo ${image.numero}</a>`;
                                  }
                                }
                                return match;
                              }
                            ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <button className="card-header card-link mb-1 collapsed"
                      data-toggle="collapse" data-target="#collapseTwo">
                      Texto Original Editor
                    </button>
                    <div className="collapse" id="collapseTwo" data-parent="#accordion" >
                      {norma &&
                        <>
                          <SunEditor height="400px" lang="es" setOptions={editorOptions}
                            setContents={contenidoEditorTextoOriginal} onChange={e => handleEditorTextoOriginal(e)}
                          />
                          <div className="botones">
                            <button type="button" className="btn btn-success btn-sm mr-2" id="boton-guardar-cambios" onClick={() => guardarCambiosTextoOriginal()}>
                              Guardar
                            </button>
                          </div>
                        </>}
                    </div>
                  </div>

                  {norma?.checkTA === 1 ?
                  <div className="card">
                    <button className="card-header card-link mb-1 collapsed"
                      data-toggle="collapse" data-target="#collapseSix">
                      Texto Actualizado
                    </button>
                    <div className="collapse" id="collapseSix" data-parent="#accordion" >
                      {norma && <div
                        dangerouslySetInnerHTML={{ __html: contenidoEditorTextoActualizado }}
                      />

                      }
                    </div>
                  </div>
                  :null}
                  {norma && norma?.checkTA === 1 && contenidoEditorTextoActualizado != "" &&

                    <div className="card">

                      <button
                        className="card-header collapsed card-link mb-1"
                        data-toggle="collapse"
                        data-target="#collapseThree">
                        Texto Actualizado Editor
                      </button>

                      <div
                        className="collapse"
                        id="collapseThree"
                        data-parent="#accordion"
                        SunEditor>

                        <SunEditor
                          height="360px" lang="es"
                          setOptions={editorOptions}
                          setContents={contenidoEditorTextoActualizado}
                          onChange={e => handleEditorTextoActualizado(e)}
                        />

                        <div className="botones">

                          <button
                            type="button"
                            className="btn btn-success btn-sm mr-2"
                            id="boton-guardar-cambios"
                            onClick={() => guardarCambiosTextoActualizado()}>
                            Guardar
                          </button>

                        </div>

                      </div>
                    </div>
                  }

                  {norma && norma.checkTA === 1 && norma.archivoTextoActualizadoS3 && norma.archivoTextoActualizado &&
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseFour"
                      >
                        Texto Actualizado Archivo
                      </button>
                      <div id="collapseFour" className="collapse" data-parent="#accordion" >
                        <div className="card-body documento-vista">
                          <div style={{ height: "85%" }}>
                            {norma.archivoTextoActualizado && <a className="ml-2" href={textoActualizado} download={norma.archivoTextoActualizado}>{norma.archivoTextoActualizado}</a>}
                            {textoActualizado && !textoActualizadoS3tipo ?
                              <>
                                <iframe className="doc-view" id="asd" src={textoActualizado} type="application/pdf">No document</iframe>
                                <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(textoActualizado)}>
                                  Abrir en pestaña nueva
                                  <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                </div>
                              </>
                              : <div className="m-3">No es posible mostrar este documento...</div>
                            }
                            <button className="btn btn-danger btn-sm mr-2" style={{ float: "right" }} onClick={(e) => borrarTextoActualizado(e)}>
                              Borrar
                              <FaTrash style={{ marginLeft: "5px" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }


                  {norma && norma.archivoS3 && norma.archivo &&
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseFive"
                      >
                        Documento original
                      </button>
                      <div id="collapseFive" className="collapse" data-parent="#accordion" >
                        <div className="card-body documento-vista">
                          <div style={{ height: "85%" }}>
                            {norma.archivo && <a className="ml-2" href={documentoOriginal} download={norma.archivo}>{norma.archivo}</a>}
                            {documentoOriginal && !archivoS3tipo ?
                              <>
                                <iframe className="doc-view" id="asd" src={documentoOriginal} type="application/pdf">No document</iframe>
                                <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(documentoOriginal)}>
                                  Abrir en pestaña nueva
                                  <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                </div>
                              </>
                              : <div className="m-3">No es posible mostrar este documento...</div>
                            }
                            <button className="btn btn-danger btn-sm mr-2" style={{ float: "right" }} onClick={(e) => borrarDocumentoOriginal(e)}>
                              Borrar
                              <FaTrash style={{ marginLeft: "5px" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>}
                  {anexos && anexos.length > 0 &&
                    anexos.map((elem, index) =>
                      <div className="card">
                        <button
                          className="card-header collapsed card-link"
                          data-toggle="collapse"
                          data-target={"#collapse" + (index + 1).toString()}
                        >
                          Anexo {index + 1}
                        </button>
                        <div id={"collapse" + (index + 1).toString()} className="collapse" data-parent="#accordion" >
                          <div className="card-body documento-vista">
                            <div style={{ height: "85%" }}>
                              <a className="ml-2" href={elem.blob} download={elem.archivo}>{elem.archivo}</a>
                              {!elem.isDoc ?
                                <>
                                  <iframe className="doc-view" id="asd" src={elem.blob} type="application/pdf">No document</iframe>
                                  <div className="btn btn-link btn-sm ml-2" maxWidth="200px" onClick={() => window.open(elem.blob)}>
                                    Abrir en pestaña nueva
                                    <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                  </div>
                                </>:
                                <>
                                  <div className="m-3">No es posible mostrar este documento...</div>
                                </>}
                              <button className="btn btn-danger btn-sm mr-2" style={{ float: "right" }} onClick={(e) => borrarAnexo(e, elem.idAnexoSDIN)}>
                                Borrar
                                <FaTrash style={{ marginLeft: "5px" }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>)}
                  {norma.adjuntos && norma.adjuntos.length > 0 &&
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseEight"
                      >
                        Archivos Adjuntos
                      </button>
                      <div id="collapseEight" className="collapse" data-parent="#accordion">
                        <div className="card-body">
                          {norma.adjuntos.map((a, index) => (
                            <div>
                              <label>{`Adjunto #` + (index + 1).toString() + ':'}</label>
                              <button className="btn btn-link btn-sm ml-1" onClick={() => traerArchivo(a.archivoS3)}><FaDownload />{a.archivo}</button>
                              <button className="btn btn-danger btn-sm mr-2 ml-2 mt--2" style={{ float: "right" }} onClick={(e) => borrarAdjunto(e, a.idAdjuntoSDIN)}>
                                Borrar <FaTrash />
                              </button>
                              <button className="btn btn-info btn-sm mr-2 ml-2 mt--2" style={{ float: "right" }} onClick={(e) => navigator.clipboard.writeText(a.linkPublico)}>
                                <FaCopy />Copiar Link
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  }
                  {norma?.checkTA === 1 ?
                  <div className="form-group bg-light p-4 m-1 row">
                    <div className="col">
                      <label>Cargar Texto Actualizado</label>
                      <input type="file" className="form-control-file" onChange={(e) => handleTextoActualizado(e)} accept={extensionesPermitidas} />
                    </div>
                    {nuevoTextoActualizado?.base64 && <button className="btn btn-primary col mt-2" onClick={(e) => guardarTextoActualizado(e)}>Guardar</button>}
                  </div>
                  :null}
                  <div className="form-group bg-light p-4 m-1 row">
                    <div className="col">
                      <label>Cargar Documento Original</label>
                      <input type="file" className="form-control-file" onChange={(e) => handleDocumentoOriginal(e)} accept={extensionesPermitidas} />
                    </div>
                    {nuevoDocumentoOriginal?.base64 && <button className="btn btn-primary col mt-2" onClick={(e) => guardarDoc(e)}>Guardar</button>}
                  </div>
                  <div className="form-group bg-light p-4 m-1 row">
                    <div className="col">
                      <label>Nuevo Anexo</label>
                      <input type="file" className="form-control-file" onChange={(e) => handleAnexo(e)} accept={extensionesPermitidas} />
                    </div>
                    {nuevoAnexo?.base64 && <button className="btn btn-primary col mt-2" onClick={(e) => guardarAnexo(e)}>Guardar</button>}
                  </div>
                  <div className="form-group bg-light p-4 m-1 row">
                    <div className="col">
                      <label>Nuevo Adjunto</label>
                      <input type="file" className="form-control-file" onChange={(e) => handleAdjunto(e)} accept={extensionesPermitidas} />
                    </div>
                    {nuevoAdjunto?.base64 && <button className="btn btn-primary col mt-2" onClick={(e) => guardarAdjunto(e)}>Guardar</button>}
                  </div>
                </div>
              </div>

              <div className="vl"></div>
              <div className="datos">
                <h4 className="dato">ESTADO NORMA: <span class="badge badge-success">{decode(norma.normasEstadoTipo)}</span></h4>
                <h4 className="dato">USUARIO EDITOR: <span class="badge badge-success">{norma?.analista}</span></h4>
                <h4 className="dato">Vigencia: <span class="badge badge-secondary">{norma.vigente === 1 ? "Vigente" : "No Vigente"}</span> </h4>
                {/* <h4 className="dato">Alcance: <span class="badge badge-secondary">{norma.alcance === 1 ? "General" : "particular"}</span></h4> */}
                <h4 className="dato">Tipo de Norma: <span class="badge badge-secondary">{decode(norma.normaTipo)}</span></h4>
                <h4 className="dato">Número: <span class="badge badge-secondary">{norma.normaNumero}</span></h4>
                <h4 className="dato">Año: <span class="badge badge-secondary">{norma.fechaSancion ? moment(norma.fechaSancion).format('YYYY') : '-'}</span></h4>
                <h4 className="dato">Tipo de Publicación: <span class="badge badge-secondary">{norma.tipoPublicacion}</span></h4>
                {/* {norma.tipoPublicacion == "Boletín Oficial (BOCBA)" && <a class="btn btn-link btn-lg"
                  onClick={() =>
                    window.open(
                      "http://api-restboletinoficial.buenosaires.gob.ar/download/" +
                      norma?.mig_filenet_publicado,
                      "_blank"
                    )
                  }
                >
                  Ir al detalle
                </a>
                } */}
                {norma.fechaPublicacion && <h4 className="dato">Fecha Publicación: <span class="badge badge-secondary">{norma.fechaPublicacion ? moment(norma.fechaPublicacion).format('DD/MM/YYYY') : null}</span></h4>}

                {/* <h4 className="dato">Id Boletin:<span class="badge badge-secondary">{norma.reparticion}</span> </h4> */}
                {norma.fechaSancion && <h4 className="dato">Fecha Sanción: <span class="badge badge-secondary">{timestampToDateFormat(norma.fechaSancion, 'DD/MM/YYYY')}</span></h4>}
                {norma.fechaPromulgacion && <h4 className="dato">Fecha Promulgación: <span class="badge badge-secondary">{timestampToDateFormat(norma.fechaPromulgacion, 'DD/MM/YYYY')}</span></h4>}
                {norma.fechaRatificacion && <h4 className="dato">Fecha Ratificación: <span class="badge badge-secondary">{timestampToDateFormat(norma.fechaRatificacion, 'DD/MM/YYYY')}</span></h4>}
                {/*                 <h4 className="dato">Organismo Emisor: <span class="badge badge-secondary">{norma.organismo}</span> </h4>
                <h4 className="dato">Gestión:<span class="badge badge-secondary">{norma.seccion}</span> </h4>
                <h4 className="dato">Firmantes:<span class="badge badge-secondary">{norma.seccion}</span> </h4> */}
                <br />
                <button className="btn btn-primary" onClick={() => setModalCambiarEstado({ ...modalCambiarEstado, show: true })} >Cambiar estado</button>
                <button className="btn btn-primary" onClick={() => setShowModalAsignar(true)} >Asignar</button>
                {JSON.parse(localStorage.getItem("perfiles"))[0].idPerfil === 9 && <button className="btn btn-danger" onClick={() => setShowModalBorrar(true)} >Borrar norma</button>}
              </div>
            </div>
          </div>

          <nav className="tabs-slider px-0">
            <ul className="nav flex-row nav-pills tabs nav-box">
              <li className="nav-item">
                <button className={tab === "Analisis Normativo" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Analisis Normativo")}><span>Analisis Normativo</span></button>
              </li>
              <li class="nav-item">
                <button className={tab === "Relaciones" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Relaciones")}><span>Relaciones</span></button>
              </li>
              <li class="nav-item">
                <button className={tab === "Analisis Documental" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Analisis Documental")}><span>Analisis Documental</span></button>
              </li>
              {(norma.aprobadoNormativamente === 1) && (norma.checkDigesto === 1) && (norma.aprobadoDocumentalmente === 1) && <li class="nav-item">
                <button className={tab === "Analisis Epistemologico" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Analisis Epistemologico")}><span>Analisis Epistemológico</span></button>
              </li>}
              <li class="nav-item">
                <button className={tab === "Front" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Front")}><span>Front</span></button>
              </li>
              <li class="nav-item">
                <button className={tab === "Historial" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Historial")}><span>Historial</span></button>
              </li>
              <li class="nav-item">
                <button className={tab === "Logs" ? "nav-link active btn" : "nav-link btn"} onClick={() => setTab("Logs")}><span>Logs</span></button>
              </li>
            </ul>
          </nav>
          {(tab) && <ContenidoTab />}
        </div>
        <Modal show={showModalAsignar} onHide={() => setShowModalAsignar(false)}>
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
                {analistas && analistas.map((elem) => (

                  <tr>
                    <td>{elem.apellidoNombre}</td>
                    <td><button className="btn btn-success btn-sm" onClick={(e) => asignarNormas(e, elem.idUsuario)}>Asignar</button></td>
                  </tr>

                ))}
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setShowModalAsignar(false)}>
              Volver
            </button>
          </Modal.Footer>
        </Modal>
        <Modal show={modalCambiarEstado.show} onHide={() => setModalCambiarEstado({ show: false, idNormasEstadoTipo: null })}>
          <Modal.Header>
            <Modal.Title>Cambiar Estado de las Normas</Modal.Title>
          </Modal.Header>
          <form onSubmit={(e) => cambiarEstadoNormas(e)}>
            <Modal.Body>
              <div className="form-wrapper bg-light p-4">
                <div class="form-group">
                  <label for="idNormasEstadoTipo">Seleccione un Estado</label>
                  <select className="custom-select" id="idNormasEstadoTipo" onChange={(e) => setModalCambiarEstado({ ...modalCambiarEstado, idNormasEstadoTipo: e.target.value })}>
                    <option selected value="" hidden></option>
                    {estados && (estados.length > 0) ? (
                      estados.map((p, index) => (
                        <option value={p.idNormasEstadoTipo} key={'opt-sec-' + index}>{decode(p.normasEstadoTipo)}</option>
                      ))

                    ) : (<option selected disabled>No hay estados para mostrar</option>)
                    }
                  </select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="btn btn-secondary botones-modal" onClick={() => setModalCambiarEstado({ show: false, idNormasEstadoTipo: null })}>
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

export default Nomenclatura;