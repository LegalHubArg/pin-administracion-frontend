import { FaAlignJustify, FaEdit, FaFlag, FaRegWindowRestore, FaSortAmountUp, FaTrashAlt, FaThumbsDown, FaCheck } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import moment from "moment";
import './DetalleSolicitudBO.css';
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//DateTime
import { timestampToDateFormat } from '../../../Helpers/DateTime';
//Obelisco Utils
import { arrayToTag } from '../../../Helpers/Obelisco';
//Navigate
import { linkToParams } from "../../../Helpers/Navigation";
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
// Modal
import { Modal, Button } from 'react-bootstrap';
import parse from 'html-react-parser';

import EdicionGOBO from "./EdicionGOBO";
import { rutasBO } from "../../../routes";
import { getFeriados } from "../../../Helpers/consultas"
import PublicacionesDesdeHasta from "./PublicacionesDesdeHasta";

const b64toBlob = require('b64-to-blob');


const DetalleSolicitudBO = props => {
  const navigate = useNavigate();
  let { idNorma } = useParams();

  const [isLoading, setLoading] = useState(true) //API Check

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })

  const [solicitud, setSolicitud] = useState({});
  const [habilitar, setHabilitar] = useState(false);
  const [documento, setDocumento] = useState([]);
  const [vistaPrevia, setVistaPrevia] = useState([]);
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
  const [fechaPublicacion, setFechaPublicacion] = useState(moment().format("YYYY-MM-DD"));
  const [numeroBUI, setNumeroBUI] = useState(null);
  const [feriados, setFeriados] = useState([]);

  const editorOptions = {

    /* addTagsWhitelist: "p | strong | span",
    pasteTagsWhitelist: "p | strong | span", */
    /*     tagsBlacklist: "span",
        pasteTagsBlacklist: "span", */
    attributesWhitelist: {
      all: "style",
      all: "align"
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
        idNorma: idNorma,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma', body, token).then(res => {
        data = res.data.data[0]
        setSolicitud(data)
        setContentEditor(data.normaDocumento.normaDocumento)
        getAnexos(data.anexos)
        // console.log(data)
      }).catch(e => { throw e })

      if (data.normaArchivoOriginalS3Key?.length > 0) {
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: data.normaArchivoOriginalS3Key }, token).then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          setDocumento(blobUrl)
        })
      }

      setLoading(false)
      setAnexosCargados(true)

    }
    catch (error) {
      setLoading(false)
      throw error
    }
  }

  const observacionSolicitud = () => {
    navigate(rutasBO.observacion, { state: { idNorma: solicitud.idNorma, solicitud: solicitud.normaAcronimoReferencia } })
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
      // console.log(error)
    }
  }

  const aprobarSolicitud = async () => {
    setLoading(true)
    try {
      let body = {
        usuario: localStorage.idUsuarioBO,
        idNorma: solicitud.idNorma,
        idNormasEstadoTipo: 5,
        fechaPublicacion: fechaPublicacion,
        numeroBUI: numeroBUI
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/aprobar', body, token).then(_ => {
        window.location.reload()
      }).catch(e => { throw new Error(e) })

      setLoading(false)

    }
    catch (error) {
      setLoading(false)
      // console.log(error)
    }
  }

  const desaprobarSolicitud = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let body = {
        usuario: localStorage.idUsuarioBO,
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
      // console.log(error)
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
      // console.log(error);
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
      // console.log(error)
    }
  }

  const handleClick = (e) => {
    e.preventDefault();
  };

  const handleEditar = (e) => {
    e.preventDefault();
    navigate(rutasBO.editar_solicitud, { state: { idNorma: solicitud.idNorma } })

  };

  const handleRevision = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem("token");
    let body = {
      idUsuario: localStorage.idUsuarioBO,
      idNorma: solicitud.idNorma
    }
    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/revisar', body, token)
      .then(() => {
        window.location.reload()
      })
      .catch((error) => {
        // console.log(error)
      })
  }


  const handleChangeSelect = (e) => {
    if (e != '') { setHabilitar(true) } else { setHabilitar(false) }
    // console.log(e.target.value)
  }

  useEffect(async () => {
    if (idNorma) {
      setDatosSesion({
        ...datosSesion,
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
      })
      await getPrioridades()
      await getFeriados(moment().year()).then(res => setFeriados(res))
      await getSolicitud()
        .catch((e) => {
          // console.log(e);
          setModalError({ show: true, mensaje: e.data.mensaje ? e.data.mensaje : "Ocurrió un error al intentar traer la solicitud." })
        })
      await getVistaPrevia()

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
        // console.log(res)
        let blob = b64toBlob(res.data, 'application/pdf')
        let blobUrl = URL.createObjectURL(blob);
        anexosAux.push({ url: blobUrl, nombre: dbAnexos[i].normaAnexoArchivo })

      }).catch(e => { throw new Error(e) })
    };
    setAnexos(anexosAux)
  }

  const getVistaPrevia = async () => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idNorma: parseInt(idNorma)
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/vista-previa', body, token)
        .then(res => {
          let blob = b64toBlob(res.data, 'application/pdf')
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          //link.download = `${solicitud.normaAcronimoReferencia}_vistaprevia.pdf`
          //link.click()
          setVistaPrevia(link.href);

        })
        .catch(function (error) {
        });
    }
    catch (error) {
    }
  }


  const mostrarTrazabilidad = () => {
    //console.log(obs)
    if (solicitud.trazabilidad.length && solicitud.trazabilidad.length > 0) {
      return (
        <ul class="list-group">
          {solicitud.trazabilidad.map((tz) => (
            <li class="list-group-item">{tz.normasEstadoTipo} - {moment(tz.fechaCarga).local(true).format('DD/MM/YYYY HH:mm')} - {tz.apellidoNombre}</li>
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
        idUsuario: localStorage.getItem("idUsuarioBO"),
        idNorma: idNorma
      }
      let token = localStorage.getItem("token");
      const res = await ApiPinPost('/api/v1/boletin-oficial/normas/norma/borrar', body, token).then(res => {
        // console.log('Eliminado con éxito')
        window.location.reload()
      }).catch(function (error) {
        console.log(error.toJSON());
        window.location.reload(false);
      });
    }
    catch (error) {
      // console.log(error);
      window.location.reload(false);
    }

  }

  const botonEditarEliminar = () => {
    if (parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5) {
      if (solicitud.idNormasEstadoTipo < 5) {
        return (<>
          {((moment().format('YYYY-MM-DD') <= solicitud.fechaHasta) || solicitud.fechaLimite !== null) && <button type="button" className="btn btn-primary" onClick={(e) => handleEditar(e)}>
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
      if (/* solicitud.idPerfil === 2 && */ solicitud.idNormasEstadoTipo < 5) {
        return (<>
          {((moment().format('YYYY-MM-DD') <= solicitud.fechaHasta) || solicitud.fechaLimite !== null) && <button type="button" className="btn btn-primary" onClick={(e) => handleEditar(e)}>
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
              onClick={() => navigate(rutasBO.cotizar, { state: { idNorma: solicitud.idNorma } })}>
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
        idNorma: idNorma
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
      // console.log(e)
    }
  }

  const handleEditorChange = (e) => {
    setContentEditor(e)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  const mostrarEditor = () => {
    // console.log('EL DOC')
    //console.log(content.normaDocumento)
    return (<>

      {vistaPrevia && <div style={{ height: "90%" }}>
        <iframe className="doc-view" src={vistaPrevia} type="application/pdf" width="100%" height="100%">No document</iframe>
        <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(vistaPrevia)}>
          Abrir en pestaña nueva
          <FaRegWindowRestore style={{ marginLeft: "5px" }} />
        </div>
      </div>
      }

      {/*  <SunEditor height="360px" placeholder="Ingrese norma digitalmente..." lang="es" setOptions={editorOptions}
      setContents={contentEditor} readOnly={parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) !== 5} onChange={e => handleEditorChange(e)}
    /> */}
      {/* <div className="preview">{parse(contentEditor)}</div> */}
      {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && <div className="botones">
        {/*         <button className="btn btn-primary" id="boton-guardar-cambios" disabled={!puedoGuardar} onClick={(e) => guardarDigitalizacion(e)} >
          Guardar
        </button> */}
        <button className="btn btn-success" id="boton-descargar-pdf" onClick={(e) => descargarDigitalizacion(e)} >
          Descargar PDF
        </button>
        <button className="btn btn-link" id="boton-importar-doc" onClick={(e) => importarDoc(e)} >
          Importar DOC
        </button>
      </div>}
    </>)
  }

  useEffect(() => {
    // console.log(contentEditor)
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
          // console.log(error);
          setPuedoGuardar(false);
        });
    }
    catch (error) {
      // console.log(error);
      setPuedoGuardar(false);
    }

  }

  const importarDoc = async (e) => {
    e.preventDefault();
    const fileInput = document.createElement('input')
    fileInput.type = "file"
    fileInput.addEventListener('change', async () => {
      setLoading(true)
      let fileReader = new FileReader();
      fileReader.readAsDataURL(fileInput.files[0]);
      fileReader.onloadend = async () => {
        let base64 = fileReader.result.toString().replace(/^data:.+;base64,/, "");
        try {
          let body = {
            usuario: localStorage.getItem("user_cuit"),
            archivo: base64,
            formatoSalida: '.html'
          }
          let token = localStorage.getItem("token");
          await ApiPinPost('/api/v1/boletin-oficial/convertir-documento', body, token)
            .then(async res => {
              //Remove header
              //console.log(res.data.toString())
              let contenido = res.data.toString().replace(/<div title="header">(.|\n)*?<\/div>/g, "");
              //Remove footer
              contenido = contenido.replace(/<div title="footer">(.|\n)*?<\/div>/g, "");
              //Remove style tag
              contenido = contenido.replace(/<style\s(.*)>(.|\n)*?<\/style>/g, "");
              //Arreglar alineaciones (reemplaza atributo de html "align" por estilo "text-align")
              contenido = contenido.replace(/align="right"\sstyle="/g, 'style="text-align: right;');
              contenido = contenido.replace(/align="center"\sstyle="/g, 'style="text-align: center;');
              contenido = contenido.replace(/align="left"\sstyle="/g, 'style="text-align: left;');
              let body = {};
              body.usuario = localStorage.getItem("user_cuit");
              body.idNorma = solicitud.idNorma;
              body.normaDocumento = contenido;
              if (solicitud.normaDocumento.hasOwnProperty('idNormaDigitalizacion')) {
                body.idNormaDigitalizacion = solicitud.normaDocumento.idNormaDigitalizacion
              }
              else {
                body.idNormaDigitalizacion = 0
              }

              let token = localStorage.getItem("token");
              // console.log(body)
              await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar/digitalizacion', body, token).then(res => {
                // console.log('Actualizo...')
                window.location.reload();
                //setPuedoGuardar(false);
              }).catch(function (error) {
                // console.log(error);
              });
            })
        }
        catch (err) {
          setLoading(false)
          //console.log(err)
        }
      }
      fileReader.onerror = error => {
        setLoading(false)
        //console.log(error);
      }
    })

    fileInput.click()
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
    // console.log(body)
    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar/digitalizacion', body, token).then(res => {
      // console.log('Actualizo...')
      window.location.reload();
      //setPuedoGuardar(false);
    }).catch(function (error) {
      // console.log(error);
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
            <p className="text-right">Notificado: {moment(ob.fechaCreacion).local(true).format('DD/MM/YYYY HH:mm')}</p>
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

  function esFechaValida(fecha) {
    if (moment(fecha).day() === 6 || moment(fecha).day() === 0 ||
      feriados.map(elem => moment(elem["DATE(feriadoFecha)"]).format("YYYY-MM-DD")).includes(moment(fecha).format("YYYY-MM-DD"))) {
      return false
    }
    else {
      return true
    }
  }

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    if (solicitud.idNormasEstadoTipo === 0) {
      return (
        <>
          <header className="pt-4 pb-3 mb-4">
            <div className="container">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                  <li className="breadcrumb-item">Detalle de Solicitud</li>
                  <ol className="breadcrumb">

                  </ol>
                </ol>
              </nav>
            </div>
          </header>
          <div className="container" id="pagina-detalle-solicitud">
            <header>
              <h1 className="mb-3"><spam className="text-danger">Norma Eliminada</spam>: {solicitud.normaAcronimoReferencia}</h1>
              <p className="lead" align="justify">{solicitud.normaSumario}</p>
            </header>
            <hr />
            <div className="container responsive">
              <div className="main-grid">
                <div className="documentos">
                  {
                    (solicitud.normaDocumento.hasOwnProperty('normaDocumento')) && mostrarEditor(solicitud.normaDocumento)
                  }
                  <div>
                  </div>
                  <div className="accordion" id="accordionExample">
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseFive"
                      >
                        Archivos ({parseInt(anexos.length) + 1})
                      </button>
                      <div id="collapseFive" className="collapse" data-parent="#accordion">
                        <div className="card-body">
                          <label>{'Documento:'}</label>
                          <div className='btn btn-link' style={{ marginLeft: "1em" }}>
                            <a href={documento} download={solicitud.normaArchivoOriginal}>{solicitud.normaArchivoOriginal}</a>
                          </div>
                          {
                            anexosCargados && anexos && (anexos.length > 0) ? (anexos.map((a, index) => (
                              <div>
                                <hr />
                                <label>{`Anexo #` + (index + 1).toString() + ':'}</label>
                                <div className='btn btn-link' style={{ marginLeft: "1em" }}><a href={a.url} download={a.nombre}> {a.nombre}</a></div>
                              </div>
                            )
                            )) : ('')
                          }
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseTwo"
                      >
                        Documento
                      </button>
                      <div id="collapseTwo" className="collapse" data-parent="#accordion" >
                        <div className="card-body documento-vista">
                          <div style={{ height: "90%" }}>
                            <iframe className="doc-view" id="asd" src={documento} type="application/pdf">No document</iframe>
                            <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(documento)}>
                              Abrir en pestaña nueva
                              <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {
                      anexosCargados && anexos && (anexos.length > 0) ? (anexos.map((anexo, index) => (
                        <div className="card">
                          <button
                            className="card-header collapsed card-link"
                            data-toggle="collapse"
                            data-target={'#collapse' + index.toString()}
                          >
                            Anexo #{index + 1}
                          </button>
                          <div id={'collapse' + index.toString()} className="collapse" data-parent="#accordion">
                            <div className="card-body documento-vista" >
                              <div style={{ height: "90%" }}>
                                <iframe className="doc-view" src={anexo.url} type="application/pdf" width="100%" height="100%">No document</iframe>
                                <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(anexo.url)}>
                                  Abrir en pestaña nueva
                                  <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))) : ('')
                    }
                    <div className="card">
                      <button className="card-header collapsed card-link" data-toggle="collapse" data-target="#collapseOne">
                        Observaciones ({solicitud.observaciones.length})
                      </button>
                      <div id="collapseOne" className="collapse" data-parent="#accordion">
                        <div className="card-body">
                          {
                            mostrarObservaciones(solicitud.observaciones)
                          }

                        </div>
                      </div>
                    </div>
                  </div>

                  {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && <>
                    <hr />
                    <h2>Actualizar Norma</h2>
                    <EdicionGOBO form={solicitud} />

                  </>
                  }

                </div>
                <div className="vl"></div>
                <div className="datos">
                  <h4 className="dato">Id Norma: <span class="badge badge-success">{solicitud.idNorma}</span></h4>
                  <h4 className="dato">Nombre: <span class="badge badge-success">{solicitud.normaAcronimoReferencia}</span></h4>
                  <h4 className="dato">Número:<span class="badge badge-secondary">{solicitud.normaNumero}</span> </h4>
                  <h4 className="dato">Año: <span class="badge badge-secondary">{solicitud.normaAnio}</span></h4>
                  <h4 className="dato">Tipo de Norma: <span class="badge badge-secondary">{solicitud.normaTipo}</span></h4>
                  <h4 className="dato">Subtipo: <span class="badge badge-secondary">{solicitud.normaSubtipo}</span></h4>
                  <h4 className="dato">Fecha Sugerida: <span class="badge badge-secondary">{timestampToDateFormat(solicitud.fechaSugerida, 'DD/MM/YYYY')}</span></h4>
                  <h4 className="dato">Fecha Límite: <span class="badge badge-danger">{timestampToDateFormat(solicitud.fechaLimite, 'DD/MM/YYYY')}</span></h4>
                  <h4 className="dato">Fecha Carga: <span class="badge badge-secondary">{timestampToDateFormat(solicitud.fechaCarga, 'DD/MM/YYYY HH:mm:ss')}</span></h4>
                  <h4 className="dato">Usuario de Carga: <span class="badge badge-secondary">{solicitud.apellidoNombre}</span></h4>
                  <h4 className="dato">Reparticion:<span class="badge badge-secondary">{solicitud.reparticion}</span> </h4>
                  <h4 className="dato">Organización:<span class="badge badge-secondary">{solicitud.organismo}</span> </h4>
                  <h4 className="dato">Sección:<span class="badge badge-secondary">{solicitud.seccion}</span> </h4>
                  <h4 className="dato">Tags: {(solicitud.tags != '') ? arrayToTag(solicitud.tags) : <></>}</h4>
                  {solicitud.trazabilidad && mostrarTrazabilidad()}
                  <br />

                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    else
      return (
        <>
          <header className="pt-4 pb-3 mb-4">
            <div className="container">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                  <li className="breadcrumb-item">Detalle de Solicitud</li>
                  <ol className="breadcrumb">

                  </ol>
                </ol>
              </nav>
            </div>
          </header>
          <div className="container" id="pagina-detalle-solicitud">
            <header>
              <h1 className="mb-3">Detalle de Solicitud: {solicitud.normaAcronimoReferencia}</h1>
              <p className="lead" align="justify">{solicitud.normaSumario}</p>
            </header>
            <hr />
            <div className="container responsive">
              <div className="main-grid">
                <div className="documentos" id="accordion">
                  {
                    /* (solicitud.normaDocumento.hasOwnProperty('normaDocumento')) && mostrarEditor() */
                  }
                  <div>
                  </div>
                  <div className="accordion">
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseFive"
                      >
                        Archivos ({parseInt(anexos.length) + 1})
                      </button>
                      <div id="collapseFive" className="collapse" data-parent="#accordion">
                        <div className="card-body">
                          <label>{'Documento:'}</label>
                          <div className='btn btn-link' style={{ marginLeft: "1em" }}>
                            <a href={documento} download={solicitud.normaArchivoOriginal}>{solicitud.normaArchivoOriginal}</a>
                          </div>
                          {
                            anexosCargados && anexos && (anexos.length > 0) ? (anexos.map((a, index) => (
                              <div>
                                <hr />
                                <label>{`Anexo #` + (index + 1).toString() + ':'}</label>
                                <div className='btn btn-link' style={{ marginLeft: "1em" }}><a href={a.url} download={a.nombre}> {a.nombre}</a></div>
                              </div>
                            )
                            )) : ('')
                          }
                        </div>
                      </div>
                    </div>
                    {solicitud?.mig_filenet_publicado?.length > 0 &&
                      <div className="accordion" id="accordionExample">
                        <div className="card">
                          <button
                            className="card-header collapsed card-link"
                            data-toggle="collapse"
                            data-target="#collapseDocImportado"
                          >
                            Documento migrado ({parseInt(anexos.length) + 1})
                          </button>
                          <div id="collapseDocImportado" className="collapse" data-parent="#accordion">
                            <div className="card-body">
                              <a href={"http://api-restboletinoficial.buenosaires.gob.ar/download/" + solicitud.mig_filenet_publicado}>{"http://api-restboletinoficial.buenosaires.gob.ar/download/" + solicitud.mig_filenet_publicado}</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    <div className="card">
                      <button
                        className="card-header collapsed card-link"
                        data-toggle="collapse"
                        data-target="#collapseTwo"
                      >
                        Documento
                      </button>
                      <div id="collapseTwo" className="collapse" data-parent="#accordion" >
                        <div className="card-body documento-vista">
                          <div style={{ height: "90%" }}>
                            <iframe className="doc-view" id="asd" src={documento} type="application/pdf">No document</iframe>
                            <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(documento)}>
                              Abrir en pestaña nueva
                              <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {
                      anexosCargados && anexos && (anexos.length > 0) ? (anexos.map((anexo, index) => (
                        <div className="card">
                          <button
                            className="card-header collapsed card-link"
                            data-toggle="collapse"
                            data-target={'#collapse' + index.toString()}
                          >
                            Anexo #{index + 1}
                          </button>
                          <div id={'collapse' + index.toString()} className="collapse" data-parent="#accordion">
                            <div className="card-body documento-vista" >
                              <div style={{ height: "90%" }}>
                                <iframe className="doc-view" src={anexo.url} type="application/pdf" width="100%" height="100%">No document</iframe>
                                <div className="btn btn-link btn-sm" maxWidth="200px" style={{ marginLeft: "1em" }} onClick={() => window.open(anexo.url)}>
                                  Abrir en pestaña nueva
                                  <FaRegWindowRestore style={{ marginLeft: "5px" }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))) : ('')
                    }
                    <div className="card">
                      <button className="card-header collapsed card-link" data-toggle="collapse" data-target="#collapseDigitalizacion">
                        Trabajo de Digitalización
                      </button>
                      <div id="collapseDigitalizacion" className="collapse" data-parent="#accordion">
                        <div className="card-body">

                          {
                            /* (solicitud.normaDocumento.hasOwnProperty('normaDocumento')) &&  */mostrarEditor()
                          }
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <button className="card-header collapsed card-link" data-toggle="collapse" data-target="#collapseObs">
                        Observaciones ({solicitud.observaciones.length})
                      </button>
                      <div id="collapseObs" className="collapse" data-parent="#accordion">
                        <div className="card-body">
                          {
                            mostrarObservaciones(solicitud.observaciones)
                          }

                        </div>
                      </div>
                    </div>
                  </div>
                  {solicitud.fechaDesde && solicitud.fechaHasta && <PublicacionesDesdeHasta idNorma={solicitud.idNorma} fechaDesde={solicitud.fechaDesde} fechaHasta={solicitud.fechaHasta} />}
                  {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    solicitud.idNormasEstadoTipo < 9 &&
                    (moment().format('YYYY-MM-DD') <= solicitud.fechaHasta || solicitud.fechaHasta === null) &&
                    <>
                      <hr />
                      <h2>Actualizar Norma</h2>
                      <EdicionGOBO form={solicitud} />

                    </>
                  }
                </div>

                <div className="vl"></div>
                <div className="datos">
                  <h4 ><span class="badge badge-info">{solicitud.normasEstadoTipo}</span></h4>
                  <h4 className="dato">Id Norma: <span class="badge badge-success">{solicitud.idNorma}</span></h4>
                  <h4 className="dato">Nombre: <span class="badge badge-success">{solicitud.normaAcronimoReferencia}</span></h4>
                  {solicitud.idTipoProceso === 2 && //Número BAC
                    <h4 className="dato">BAC: <span class="badge badge-success">{solicitud.numeroReparto}-{solicitud.normaNumero}-{solicitud.procedimiento}</span></h4>
                  }
                  {solicitud.idTipoProceso === 4 && //Número BACO
                    <h4 className="dato">BAC: <span class="badge badge-success">{solicitud.numeroReparto}-{solicitud.normaNumero}-{solicitud.procedimiento}</span></h4>
                  }
                  <h4 className="dato">Número:<span class="badge badge-secondary">{solicitud.normaNumero}</span> </h4>
                  <h4 className="dato">Año: <span class="badge badge-secondary">{solicitud.normaAnio}</span></h4>
                  <h4 className="dato">Tipo de Norma: <span class="badge badge-secondary">{solicitud.normaTipo}</span></h4>
                  <h4 className="dato">Subtipo: <span class="badge badge-secondary">{solicitud.normaSubtipo}</span></h4>
                  {([4, 5, 6, 10].includes(solicitud.idSeccion)) ? (
                    <>
                      <h4 className="dato">Fecha Desde: <span class="badge badge-secondary">{timestampToDateFormat(solicitud.fechaDesde, 'DD/MM/YYYY')}</span></h4>
                      <h4 className="dato">Fecha Hasta: <span class="badge badge-danger">{timestampToDateFormat(solicitud.fechaHasta, 'DD/MM/YYYY')}</span></h4>
                      <h4 className="dato">Días Hábiles: <span class="badge badge-success">{solicitud.diasHabiles}</span></h4>
                    </>
                  )
                    : (<>
                      <h4 className="dato">Fecha Sugerida: <span class="badge badge-secondary">{timestampToDateFormat(solicitud.fechaSugerida, 'DD/MM/YYYY')}</span></h4>
                      <h4 className="dato">Fecha Límite: <span class="badge badge-danger">{timestampToDateFormat(solicitud.fechaLimite, 'DD/MM/YYYY')}</span></h4>
                    </>)
                  }
                  <h4 className="dato">Fecha Carga: <span class="badge badge-secondary">{timestampToDateFormat(solicitud.fechaCarga, 'DD/MM/YYYY HH:mm:ss')}</span></h4>
                  <h4 className="dato">Usuario de Carga: <span class="badge badge-secondary">{solicitud.apellidoNombre}</span></h4>
                  <h4 className="dato">Reparticion:<span class="badge badge-secondary">{solicitud.reparticion}</span> </h4>
                  <h4 className="dato">Organismo Emisor:<span class="badge badge-secondary">{solicitud.organismoEmisor}</span> </h4>
                  {solicitud.reparticiones &&
                    <h4 className="dato">Reparticiones: <span class="badge badge-secondary">
                      {solicitud.reparticiones}
                    </span></h4>}
                  <h4 className="dato">Sección:<span class="badge badge-secondary">{solicitud.seccion}</span> </h4>
                  {solicitud.fechaPublicacion && <h4 className="dato">Fecha de Publicación Tentativa:
                    <span class="badge badge-success">{moment(solicitud.fechaPublicacion).format("DD/MM/YYYY")}</span>
                  </h4>}
                  <h4 className="dato">Tags: {(solicitud.tags != '') ? arrayToTag(solicitud.tags) : <></>}</h4>
                  {solicitud.trazabilidad && mostrarTrazabilidad()}
                  <br />
                  <div className="btn-wrapper">
                    {(parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5) && solicitud.idNormasEstadoTipo < 7 &&
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => observacionSolicitud()}>
                        <FaFlag />
                        &nbsp;&nbsp;Observación
                      </button>
                    }
                    {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && solicitud.idNormasEstadoTipo < 9 &&
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          data-toggle="modal"
                          data-target="#modalPrioridades"
                        >
                          <FaSortAmountUp />
                          &nbsp;&nbsp;Prioridad
                        </button>
                        <div class="modal fade" tabindex="-1" role="dialog" id="modalPrioridades">
                          <div class="modal-dialog modal-sm" role="document">
                            <div class="modal-content">
                              <div class="modal-header">
                                <h4 class="modal-title">
                                  Prioridad de la Solicitud
                                </h4>
                              </div>
                              <div class="modal-body" onChange={(e) => setPrioridadSeleccionada(e.target.value)}>
                                {radioPrioridades()}
                              </div>
                              <div class="modal-footer">
                                <button
                                  type="button"
                                  class="btn btn-link"
                                  data-dismiss="modal"
                                >
                                  Volver
                                </button>
                                <button
                                  type="button"
                                  class="btn btn-danger"
                                  onClick={() => actualizarPrioridad()}>
                                  Aceptar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                  {
                    botonDesaprobar()
                  }
                  {
                    botonEditarEliminar()
                  }
                  {/* {console.log(solicitud)} */}
                  {solicitud.normaRevisada === 0 &&
                    parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    (solicitud.idNormasEstadoTipo === 7 || solicitud.idNormasEstadoTipo === 8) ?
                    <button class="btn btn-success" onClick={(e) => handleRevision(e)}>
                      Marcar como: Revisada
                    </button>
                    :
                    parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    solicitud.idNormasEstadoTipo === 7 &&
                    <div class="alert alert-success" role="alert" style={{ fontSize: 13 }}>
                      <p>Revisada</p>
                    </div>
                  }
                  {
                    parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && botonPrincipal()
                  }
                  {
                    parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&

                    <div class="modal fade" tabindex="-1" role="dialog" id="modalAprobacion">
                      <div class="modal-dialog modal-sm" role="document">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h4 class="modal-title">
                              Aprobar Solicitud
                            </h4>
                          </div>
                          <div class="modal-body">
                            <div>
                              <input type="text" className="form-control" placeholder="BUI" id="numeroGEDO" name="normaAcronimoReferencia"
                                pattern="[a-zA-Z0-9_-]+" value={numeroBUI}
                              />
                              <button type="button" className="btn btn-primary" style={{ marginTop: "5px" }} onClick={() => validarGEDO()}>
                                Validar
                              </button>
                              <div class="alert alert-danger" role="alert" style={{ fontSize: 12, marginTop: "1em" }} hidden id="errorValidacion">
                                <p>No se pudo validar el documento.</p>
                              </div>
                              <div class="alert alert-success" role="alert" style={{ fontSize: 12, marginTop: "1em" }} hidden id="successValidacion">
                                <p>Documento validado.</p>
                              </div>
                            </div>
                            {(solicitud && (solicitud.fechaSugerida !== undefined || solicitud.fechaDesde !== undefined)) ? (
                              <div style={{ marginTop: "2em" }}>
                                <label for="fechaPublicacion">Fecha de Publicación</label>
                                <input
                                  type="date"
                                  className={"form-control " + (esFechaValida(fechaPublicacion) ? "is-valid" : "is-invalid")}
                                  id="fechaPublicacion"
                                  name="fechaPublicacion"
                                  aria-describedby="date-help"
                                  value={fechaPublicacion}
                                  onChange={e => setFechaPublicacion(e.target.value)}
                                />
                                <div class="invalid-feedback">La fecha que seleccionó es un fin de semana o feriado.</div>
                              </div>
                            ) : ('')
                            }
                          </div>
                          <div class="modal-footer">
                            <button
                              type="button"
                              class="btn btn-link"
                              data-dismiss="modal"
                              onClick={() => setDocumentoValidado(null)}
                            >
                              Volver
                            </button>
                            <button
                              type="button"
                              class="btn btn-success"
                              onClick={() => aprobarSolicitud()}>
                              Aprobar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <Modal className="modal fade " role="dialog" dialogClassName="modal-dialog modal-sm" tabindex="-1" show={show} onHide={handleClose}>

            <Modal.Header>
              <Modal.Title>Eliminar Solicitud</Modal.Title>
            </Modal.Header>
            <Modal.Body>Está seguro que desae eliminar la norma #{solicitud.normaAcronimoReferencia} ?.</Modal.Body>
            <Modal.Footer>
              <Button className="btn btn-link" onClick={handleClose} data-dismiss="modal">
                Cancelar
              </Button>
              <Button className="btn btn-primary" onClick={(e) => eliminarSolicitud(e, solicitud.idNorma)} >
                Si, eliminar
              </Button>
            </Modal.Footer>
          </Modal>
          <ModalDesaprobar />
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

export default DetalleSolicitudBO;