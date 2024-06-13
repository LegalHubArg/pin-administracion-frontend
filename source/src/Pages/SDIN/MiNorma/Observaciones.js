import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaAlignJustify, FaEdit, FaFlag, FaRegWindowRestore, FaSortAmountUp, FaTrashAlt, FaThumbsDown } from "react-icons/fa";
import { FaCheck, FaTimes, FaEye, FaArrowRight, FaArrowLeft, FaPaperclip, FaDollarSign } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams} from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import SunEditor from 'suneditor-react';
import EdicionGOBO from "../../BO/DetalleSolicitud/EdicionGOBO";
//Obelisco Utils
import { arrayToTag } from '../../../Helpers/Obelisco';
//DateTime
import { timestampToDateFormat } from '../../../Helpers/DateTime';
import './Observaciones.css';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
// Modal
import { Modal, Button } from 'react-bootstrap';

import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
/* import { Button } from "@gcba/obelisco/dist/components/Button"; */
var b64toBlob = require('b64-to-blob');

const Observaciones = props => {
    console.log("hola")

    const navigate = useNavigate();
    
  
    const [isLoading, setLoading] = useState(true) //API Check
  
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
    const [solicitud, setSolicitud] = useState({});
    const [habilitar, setHabilitar] = useState(false);
    const [documento, setDocumento] = useState([]);
    const [documentoValidado, setDocumentoValidado] = useState();
    const [anexos, setAnexos] = useState([]);
    const [anexosCargados, setAnexosCargados] = useState(null);
    const [prioridades, setPrioridades] = useState([]);
    const [prioridadSeleccionada, setPrioridadSeleccionada] = useState();
    const [datosSesion, setDatosSesion] = useState({
      usuario: null,
      nombre: null,
      token: null
    });
  
    //RECIBE EL idNorma EN location.state.name
    const location = useLocation();
  
    // EJEMPLO: MANDA EL 'idNorma' CON: 
    // const navigate = useNavigate(); 
    //  const redireccionDetalleNorma = () => { navigate('/detalle-norma', {state: { idNorma: valor }});}
  
    const [contentEditor, setContentEditor] = useState("");
    const [puedoGuardar, setPuedoGuardar] = useState(false);
  
    const editorOptions = {
  
      /* addTagsWhitelist: "p | strong | span",
      pasteTagsWhitelist: "p | strong | span", */
      /*     tagsBlacklist: "span",
          pasteTagsBlacklist: "span", */
      attributesWhitelist: {
        all: "style",
        /* all: "id" */
      },
  
      /*   attributesBlacklist: {
          span: "style"
        }, */
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
  
    const getSolicitud = async () => {
      let data = []
      try {
        let anexosAux = [];
        let body = {
          idNorma: location.state.idNorma,
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma', body, token).then(res => {
          data = res.data.data[0]
          setSolicitud(data)
          setContentEditor(data.normaDocumento.normaDocumento)
          getAnexos(data.anexos)
          console.log(data)
        }).catch(e => { throw e })
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: data.normaArchivoOriginalS3Key }, token).then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          setDocumento(blobUrl)
        })
          .catch(e => { throw e })
  
        setLoading(false)
        setAnexosCargados(true)
  
      }
      catch (error) {
        setLoading(true)
        throw error
      }
    }
  
    const observacionSolicitud = () => {
      navigate('/observacion-solicitud', { state: { idNorma: solicitud.idNorma, solicitud: solicitud.normaAcronimoReferencia } })
    }
  
    const aprobarParaCotizacion = async () => {
      setLoading(true)
      try {
        let body = {
          usuario: (JSON.parse(localStorage.perfiles))[0].idUsuario,
          idNorma: solicitud.idNorma,
          idNormasEstadoTipo: 5
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/aprobarParaCotizacion', body, token).then(async (res) => {
          await new Promise(r => setTimeout(r, 2000)).then(window.location.reload())
        }).catch(e => { throw new Error(e) })
  
        setLoading(false)
  
      }
      catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
  
    const aprobarSolicitud = async () => {
      setLoading(true)
      try {
        let body = {
          usuario: (JSON.parse(localStorage.perfiles))[0].idUsuario,
          idNorma: solicitud.idNorma,
          idNormasEstadoTipo: 5,
          fechaPublicacion: document.getElementById("fechaPublicacion").value,
          numeroBUI: document.getElementById("numeroGEDO").value
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/aprobar', body, token).then(async (res) => {
          await new Promise(r => setTimeout(r, 2000)).then(window.location.reload())
        }).catch(e => { throw new Error(e) })
  
        setLoading(false)
  
      }
      catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
  
    const desaprobarSolicitud = async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        let body = {
          usuario: (JSON.parse(localStorage.perfiles))[0].idUsuario,
          idNorma: solicitud.idNorma
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/desaprobar', body, token).then(async (res) => {
          await new Promise(r => setTimeout(r, 2000)).then(window.location.reload())
        }).catch(e => { throw new Error(e) })
  
        setLoading(false)
  
      }
      catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
  
    const validarGEDO = async () => {
      try {
        let body = {
          cuit: localStorage.getItem("user_cuit"),
          nombreNorma: document.getElementById('numeroGEDO').value
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/traerPdfGEDO', body, token)
          .then(res => {
            setDocumentoValidado(true)
          })
          .catch(function (error) {
            setLoading(false)
            throw error;
          });
        setLoading(false)
      }
      catch (error) {
        setDocumentoValidado(false)
        setLoading(false)
        console.log(error);
      }
    }
  
    //mensajes validacion
    useEffect(() => {
      switch (documentoValidado) {
        case (true):
          document.getElementById("successValidacion").hidden = false
          document.getElementById("errorValidacion").hidden = true
          break;
        case (false):
          document.getElementById("successValidacion").hidden = true
          document.getElementById("errorValidacion").hidden = false
          break;
        case (null):
          document.getElementById("successValidacion").hidden = true
          document.getElementById("errorValidacion").hidden = true
          break;
      }
    }, [documentoValidado])
  
    useEffect(() => {
      if (solicitud.fechaHasta !== null) {
        if (solicitud.idNormasEstadoTipo < 9 && (moment().format('YYYY-MM-DD') <= solicitud.fechaHasta)) {
          setPuedoGuardar(true)
        }
        else {
          setPuedoGuardar(false)
        }
      }
      else {
        if (solicitud.idNormasEstadoTipo < 9) {
          setPuedoGuardar(true)
        }
        else {
          setPuedoGuardar(false)
        }
      }
    }, [solicitud])
  
    const getPrioridades = async () => {
      try {
        let body = {
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        const res = await ApiPinPost('/api/v1/boletin-oficial/normas/prioridades', body, token).then(res => {
          setPrioridades(res.data.respuesta)
        }).catch(e => { throw new Error(e) })
      }
      catch (error) {
        setLoading(true)
        console.log(error)
      }
    }
  
    const handleClick = (e) => {
      e.preventDefault();
    };
  
    const handleEditar = (e) => {
      e.preventDefault();
      linkToParams('/editar-solicitud', { idNorma: solicitud.idNorma }, navigate)
  
    };
  
  
    const handleChangeSelect = (e) => {
      if (e != '') { setHabilitar(true) } else { setHabilitar(false) }
      console.log(e.target.value)
    }
  
    useEffect(async () => {
      if (location.state.idNorma) {
        setDatosSesion({
          ...datosSesion,
          usuario: localStorage.getItem("user_cuit"),
          nombre: localStorage.getItem("user"),
          token: localStorage.getItem("token")
        })
        await getPrioridades()
        await getSolicitud()
          .catch((e) => {
            console.log(e);
            navigate(-1) || navigate('/', {replace: true});
          })
  
      }
      else {
        navigate('/', { state: {}, replace: true })
      }
  
    }, [])
  
    const getAnexos = async (dbAnexos) => {
      let token = localStorage.getItem("token");
      let anexosAux = []
  
      for (let i = 0; i < dbAnexos.length; i++) {
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: dbAnexos[i].normaAnexoArchivoS3Key }, token).then((res) => {
          console.log(res)
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          anexosAux.push({ url: blobUrl, nombre: dbAnexos[i].normaAnexoArchivo })
  
        }).catch(e => { throw new Error(e) })
      };
      setAnexos(anexosAux)
    }
  
    /*   useEffect(async () => {
        let token = localStorage.getItem("token");
        let anexosAux = []
        if (anexosCargados === true) {
          for (let i = 0; i < solicitud.anexos.length; i++) {
            await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: (solicitud.anexos)[i].normaAnexoArchivoS3Key }, token).then((res) => {
              console.log(res)
              let blob = b64toBlob(res.data, 'application/pdf')
              let blobUrl = URL.createObjectURL(blob);
              anexosAux.push({ url: blobUrl, nombre: (solicitud.anexos)[i].normaAnexoArchivo })
    
            }).catch(e => { throw new Error(e) })
          };
        }
        console.log(anexosAux)
        setAnexos(anexosAux)
      },
        [anexosCargados]) */
  
    const mostrarTrazabilidad = () => {
      //console.log(obs)
      if (solicitud.trazabilidad.length && solicitud.trazabilidad.length > 0) {
        return (
          <ul class="list-group">
            {solicitud.trazabilidad.map((tz) => (
              <li class="list-group-item">{tz.normasEstadoTipo} - {moment(tz.fechaCarga).format('DD/MM/YYYY HH:MM')}</li>
            ))} </ul>)
  
      }
    }
  
    function radioPrioridades() {
      let radio = [];
      let prioridadActual = solicitud.idPrioridadTipo;
      if (prioridades && prioridades.length > 0) {
        radio = prioridades.map(p => (
          (p.idPrioridadTipo === prioridadActual) ? (
  
            <div class="custom-control custom-radio">
              <input
                class="custom-control-input"
                type="radio"
                name="prioridad"
                id={(p.prioridad !== null) ? ("prioridad-" + String(p.idPrioridadTipo)) : ("sin-prioridad")}
                value={p.idPrioridadTipo}
                defaultChecked
              />
              <label class="custom-control-label" for={(p.prioridad !== null) ? ("prioridad-" + String(p.idPrioridadTipo)) : ("sin-prioridad")}>
                {(p.prioridad !== null) ? (String(p.prioridad)) : ("Sin prioridad")}
              </label>
            </div>
          ) : (
            <div class="custom-control custom-radio">
              <input
                class="custom-control-input"
                type="radio"
                name="prioridad"
                id={(p.prioridad !== null) ? ("prioridad-" + String(p.idPrioridadTipo)) : ("sin-prioridad")}
                value={p.idPrioridadTipo}
              />
              <label class="custom-control-label" for={(p.prioridad !== null) ? ("prioridad-" + String(p.idPrioridadTipo)) : ("sin-prioridad")}>
                {(p.prioridad !== null) ? (String(p.prioridad)) : ("Sin prioridad")}
              </label>
            </div>
          )
        ));
      } else { return 'No se pueden mostrar los tipos de prioridades' }
      return (radio)
    }
    //LLAMADA A LA API PARA ELIMINAR
    const eliminarSolicitud = async (e, idNorma) => {
      e.preventDefault();
      handleClose();
      try {
        let body = {
          usuario: localStorage.getItem("user_cuit"),
          idUsuario: parseInt((JSON.parse(localStorage.getItem("perfiles")))[0].idUsuario),
          idNorma: idNorma
        }
        let token = localStorage.getItem("token");
        const res = await ApiPinPost('/api/v1/boletin-oficial/normas/norma/borrar', body, token).then(res => {
          console.log('Eliminado con éxito')
          linkToParams('/mis-solicitudes', {}, navigate)
        }).catch(function (error) {
          console.log(error.toJSON());
          window.location.reload(false);
        });
      }
      catch (error) {
        console.log(error);
        window.location.reload(false);
      }
  
    }
  
    const botonEditarEliminar = () => {
      if (parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5) {
        if (solicitud.idPerfil === 5 && solicitud.idNormasEstadoTipo < 5) {
          return (<>
            {(moment().format('YYYY-MM-DD') <= solicitud.fechaHasta) && <button type="button" className="btn btn-primary" onClick={(e) => handleEditar(e)}>
              <FaEdit />
              &nbsp;&nbsp;Editar solicitud
            </button>}
            <button type="button" className="btn btn-danger" onClick={handleShow}>
              <FaTrashAlt />
              &nbsp;&nbsp;Eliminar solicitud
            </button>
          </>
          )
        }
      }
      else {
        if (solicitud.idPerfil === 2 && solicitud.idNormasEstadoTipo < 5) {
          return (<>
            {(moment().format('YYYY-MM-DD') <= solicitud.fechaHasta) && <button type="button" className="btn btn-primary" onClick={(e) => handleEditar(e)}>
              <FaEdit />
              &nbsp;&nbsp;Editar solicitud
            </button>}
            <button type="button" className="btn btn-danger" onClick={handleShow}>
              <FaTrashAlt />
              &nbsp;&nbsp;Eliminar solicitud
            </button>
          </>)
        }
  
      }
  
    }
  
    //BOTON DESAPROBAR - SOLO ESTADOS APROBADOS PARA PUBLICACIÓN Y BO_EN_REDACCION
    const botonDesaprobar = () => {
  
      if (parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && solicitud.idNormasEstadoTipo < 9 && solicitud.idNormasEstadoTipo > 6) {
        return (<><button type="button" className="btn btn-danger"
          data-toggle="modal"
          data-target="#modalDesaprobarNorma"
        >
          <FaThumbsDown />
          &nbsp;&nbsp;Desaprobar
        </button>
        </>)
      }
    }
  
    const ModalDesaprobar = () => {
      return (
        <div class="modal fade show" tabindex="-1" role="dialog" id="modalDesaprobarNorma">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title">
                  Advertencia
                </h4>
              </div>
              <div class="modal-body">
                <p>
                  Está seguro que quiere desaprobar la norma '{solicitud.normaAcronimoReferencia}'
                </p>
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
                  onClick={(e) => desaprobarSolicitud(e)}
                >
                  Sí, Desaprobar
                </button>
              </div>
            </div>
          </div>
        </div>
      )
  
    }
  
    function botonPrincipal() {
      let estadoNorma = solicitud.idNormasEstadoTipo;
      switch (estadoNorma) {
        case 1:
        case 2:
        case 3:
        case 4:
        /* return (
          <button type="button" className="btn btn-success btn-lg"
            onClick={() => aprobarParaCotizacion()}>
            Aprobar para Cotización
          </button>
        ) */
        case 5:
        case 6:
          return (
            <>
              <button type="button" className="btn btn-success"
                onClick={() => navigate('/cotizacion-solicitud', { state: { idNorma: solicitud.idNorma } })}>
                Cotizar
              </button>
              <button type="button" className="btn btn-success btn-lg"
                data-toggle="modal"
                data-target="#modalAprobacion">
                Aprobar Solicitud
              </button>
            </>
          )
        case 7:
        case 8:
          return (
            <div class="alert alert-success" role="alert" style={{ fontSize: 13 }}>
              <p>Esta solicitud se encuentra aprobada para su publicación.</p>
            </div>
          )
        default:
          return (
            <div class="alert alert-success" role="alert" style={{ fontSize: 13 }}>
              <p>Esta solicitud se encuentra aprobada para su publicación.</p>
            </div>
          )
      }
    }
  
    const actualizarPrioridad = async () => {
      try {
        let body = {
          idPrioridadTipo: prioridadSeleccionada,
          idNorma: location.state.idNorma
        }
        let token = localStorage.getItem("token");
        setLoading(true)
        if (body.idPrioridadTipo !== 0 && body.idPrioridadTipo !== null && body.idPrioridadTipo !== undefined) {
          await ApiPinPost('/api/v1/boletin-oficial/normas/prioridades/asignar', body, token).then((res) => {
            window.location.reload();
            setLoading(false)
          }).catch(e => { throw new Error(e) })
        }
      }
      catch (e) {
        console.log(e)
      }
    }
  
    const handleEditorChange = (e) => {
      setContentEditor(e)
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
    }
  
    const mostrarEditor = () => {
      console.log('EL DOC')
      //console.log(content.normaDocumento)
      return (<><SunEditor height="360px" placeholder="Escriba aquí sus observaciones..." lang="es" setOptions={editorOptions}
        setContents={contentEditor} readOnly={parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) !== 5} onChange={e => handleEditorChange(e)}
      />
        {/* <div className="preview">{parse(contentEditor)}</div> */}
        {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && <div className="botones">
          <button className="btn btn-danger btn-sm" id="boton-descargar-pdf">
            Cancelar
          </button>
          <button className="btn btn-success btn-sm mr-2" id="boton-guardar-cambios">
            Guardar
          </button>
        </div>}
      </>)
    }
  
    useEffect(() => {
      console.log(contentEditor)
    }, [contentEditor])
  
  
    const descargarDigitalizacion = async (e) => {
  
      e.preventDefault();
      setPuedoGuardar(true);
      try {
        let body = {
          usuario: localStorage.getItem("user_cuit"),
          idNorma: solicitud.idNorma
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/vista-previa', body, token)
          .then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${solicitud.normaAcronimoReferencia}_vistaprevia.pdf`
            link.click()
            setPuedoGuardar(false);
  
          })
          .catch(function (error) {
            console.log(error);
            setPuedoGuardar(false);
          });
      }
      catch (error) {
        console.log(error);
        setPuedoGuardar(false);
      }
  
  
  
    }
    const guardarDigitalizacion = async (e) => {
  
      e.preventDefault();
      setPuedoGuardar(true);
  
      let body = {};
      body.usuario = localStorage.getItem("user_cuit");
      body.idNorma = solicitud.idNorma;
      body.normaDocumento = contentEditor;
      if (solicitud.normaDocumento.hasOwnProperty('idNormaDigitalizacion')) {
        body.idNormaDigitalizacion = solicitud.normaDocumento.idNormaDigitalizacion
      }
      else {
        body.idNormaDigitalizacion = 0
      }
  
      let token = localStorage.getItem("token");
      console.log(body)
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar/digitalizacion', body, token).then(res => {
        console.log('Actualizo...')
        window.location.reload();
        //setPuedoGuardar(false);
      }).catch(function (error) {
        console.log(error);
      });
  
  
    }
  
    const mostrarObservaciones = (obs) => {
      //console.log(obs)
      if (obs.length && obs.length > 0) {
        return (obs.map((ob) => (
          <div class="alert-wrapper">
            <div class="alert alert-primary" role="alert">
              <h6>{ob.motivo}</h6>
              <blockquote>
                <p>
                  {ob.observacion}
                </p>
              </blockquote>
              <p className="text-right">Notificado: {moment(ob.fechaCreacion).format('DD/MM/YYYY HH:MM')}</p>
            </div>
          </div>
        )))
  
      }
      else {
        return (
          <div class="alert-wrapper">
            <div class="alert alert-success" role="alert">
              <h6>Sin Observaciones</h6>
            </div>
          </div>
        )
  
      }
    }
    if (isLoading) {
      return (<Spinner />)
    }
    else {
        return (
            <>
              <div className="container" id="pagina-detalle-solicitud">
                    <div className="documentos">
                      {
                        (solicitud.normaDocumento.hasOwnProperty('normaDocumento')) && mostrarEditor()
                      }
                      <div>
                      </div>
                    </div>
              </div>
            </>
        );
  
    }
  
  };

export default Observaciones;