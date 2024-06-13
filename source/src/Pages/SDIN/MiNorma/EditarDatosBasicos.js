import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEye, FaArrowRight, FaArrowLeft, FaEdit, FaPaperclip, FaDollarSign } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import SunEditor from 'suneditor-react';
import './EditarDatosBasicos.css';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File

import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Button } from "@gcba/obelisco/dist/components/Button";
var b64toBlob = require('b64-to-blob');

const EditarDatosBasicos = props => {

    const navigate = useNavigate();

    const [documento, setDocumento] = useState({});
    const [documentoBase64, setDocumentoBase64] = useState([]);
    const [validaGEDO, setValidaGEDO] = useState('');
    const [validaAnexoGEDO, setValidaAnexoGEDO] = useState('');
    const [isLoading, setLoading] = useState(true)
    const [loadingNormas, setLoadingNormas] = useState(false)
    const [secciones, setSecciones] = useState([])
    const [normas, setNormas] = useState([])
    const [anexos, setAnexos] = useState([])
    const [organismos, setOrganismos] = useState(null);
    const [estados, setEstados] = useState([]);
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
    console.log(contentEditor)
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
        idNorma: ''
    }
    const [form, setForm] = useState(initForm);

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
        }
    }

    const onChangeDoc = async (doc) => {
        let auxArray = [];
        setDocumento(doc);
        await convertirABase64(doc)
          .then(res => {
            auxArray.push(res.split(','))
          })
        setDocumentoBase64(auxArray);
        setForm({
          ...form,
          ['normaArchivoOriginal']: doc.name
        })
        console.log(doc)
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
                console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            console.log(error);
            linkToParams('/', {}, navigate)
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
                console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getNormas = async () => {
        setLoadingNormas(true);

        try {
            let body = { ...form, ...paginacion };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/normas', body, token).then((res) => {
                console.log(res.data)
                setNormas(Array.from(res.data.normas))
                setAnexos(Array.from(res.data.anexos))
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalNormas / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({ ...auxPaginacion });

            }).catch(function (error) {
                console.log(error);
            });

            setLoadingNormas(false)
        }
        catch (error) {
            setLoadingNormas(false)
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const getOrganismos = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/organismos/reparticiones', token).then((res) => {
                setOrganismos(Array.from(res.data.data))
            }).catch(function (error) {
                setLoading(false)
                console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const TablaNormas = ({ normas }) => {
        return (
            <table class="table table-bordered table-hover" >
                <thead>
                    <tr>
                        <th scope="col">Fecha Check SDIN</th>
                        <th scope="col">Seccion</th>
                        <th scope="col">Tipo de Norma</th>
                        <th scope="col">Subtipo</th>
                        <th scope="col">Numero Norma</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Estado SDIN</th>
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
                                    <td>{n.siglaReparticionOrganismo}</td>
                                    <td>{n.siglaReparticion}</td>
                                    <td>{n.normaNumero}</td>
                                    <td>{n.normaAnio}</td>
                                    <td>{(n.fechaCarga !== null) ? (moment(n.fechaCarga).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{(n.fechaSugerida !== null) ? (moment(n.fechaSugerida).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{(n.fechaLimite !== null) ? (moment(n.fechaLimite).format('DD/MM/YYYY')) : ('N/A')}</td>
                                    <td>{n.normasEstadoTipo}</td>
                                    <td title="Ir a la Norma">
                                        <Link to={"/detalle-norma/" + String(n.idNorma)}>
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
                                    <td>
                                        <button class="btn btn-link btn-sm" onClick={() => navigate('/cotizacion-solicitud', { state: { idNorma: n.idNorma } })}>
                                            Cotizar
                                        </button>
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
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: anexo.normaAnexoArchivoS3Key }, token).then((res) => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
        }).catch(e => { console.log(e) })
    }

    function borrarFiltros(e) {
        e.preventDefault()
        setForm({ ...initForm })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('SUBMIT')
        await getNormas();
        document.getElementById('boton1').click()
    }

    const handleCantidadNormas = (e) => {
        let auxPaginacion = paginacion;
        auxPaginacion.limite = e;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })

    }

    const validarGEDOEspecial = async (tipo) => {
        if (tipo === 'anexo' || tipo === 'documento') {
          try {
            let body = {
              cuit: localStorage.getItem("user_cuit"),
              nombreNorma: tipo === 'documento' ? (form.normaAcronimoReferencia) : (document.getElementById('nombreAnexoGEDO').value)
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/traerPdfGEDO/numeroespecial', body, token)
              .then(res => {
                let nombreSeparado = res.data.metadatos.numeroDocumento.split('-');
                if (res.data.metadatos.numeroEspecial !== undefined) {
                  nombreSeparado = res.data.metadatos.numeroEspecial.split('-')
                }
                if (tipo === 'anexo') {
                  setAnexos([...anexos, { name: (res.data.metadatos.numeroDocumento + '.pdf'), base64: ['data:application/pdf;base64', res.data.base64], esGEDO: true }]);
                  document.getElementById('nombreAnexoGEDO').value = null;
                  setValidaAnexoGEDO('is-valid')
                }
                else {
                  setValidaGEDO('is-valid')
                  setDocumento({ name: (res.data.metadatos.numeroDocumento + '.pdf'), esGEDO: true })
                  setDocumentoBase64([['data:application/pdf;base64', res.data.base64]])
                  setForm({
                    ...form,
                    ['normaNumero']: ~~nombreSeparado[2],
                    ['normaAnio']: nombreSeparado[1]
                  });
                }
              })
              .catch(function (error) {
                throw error
              });
            setLoading(false)
          }
          catch (error) {
            setValidaGEDO('is-invalid')
            setLoading(false)
            console.log(error);
          }
        }
      }

    useEffect(() => {
        console.log(form)
    }, [form])

    //Hook inicial
    useEffect(async () => {
        await getSecciones();
        await getOrganismos();
        await getEstados();
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-editar-datos-basicos">
                    <form className="form" onSubmit={e => handleSubmit(e)}>
                    <div className="accordion" id="accordion">
                        <div className="card">
                            <button
                                id="boton1"
                                className="card-header collapsed card-link"
                                data-toggle="collapse"
                                data-target="#collapse1"
                            >
                                DATOS BASICOS DE NORMA XXX
                            </button>
                            <div id="collapse1" className="collapse" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                            <div className="form-group">
                                                <label for="idSeccion">Alcance</label>
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
                                            <div className="form-group">
                                                <label for="idSeccion">Tipo de Norma</label>
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
                                            <div className="form-group">
                                                <label for="">Número</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Vigencia</label>
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
                                            <div className="form-group fila">
                                                <label for="">Título</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form-group fila">
                                                <label for="">Síntesis</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form tres">
                                            <div className="form-group">
                                                <label for="idSeccion">Tipo Publicacion</label>
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
                                            <div className="form-group">
                                                <label for="">Número</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form-group sinmargeninferior">
                                                <label for="fechaSugerida">Fecha Publicacion</label>
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
                                                <label for="fechaSugerida">Fecha Promulgacion</label>
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
                                                <label for="fechaSugerida">Fecha Ratificacion</label>
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
                                                <label for="fechaSugerida">Fecha Sanción</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="fechaCarga"
                                                    name="fechaCarga"
                                                    aria-describedby="date-help"
                                                    onChange={e => handleFormChange(e)} value={form.fechaCarga}
                                                />
                                              </div>
                                            <div className="form-group">
                                                <label for="idSeccion">Gestion</label>
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
                                            <div className="form-group">
                                                <label for="idSeccion">Organismo</label>
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
                                            <div className="form-group">
                                                <label for="idSeccion">Reparticion</label>
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
                                            </div>
                                            <div className="form-group fila">
                                                <label for="">Firmantes</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <div className="form-group">
                                                <label for="">Link Publicación BO</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                            <button class="btn btn-success btn-sm mr-2" type="submit" id="boton-buscar" onClick={()=> navigate('/Dependencias')}>Editor de Dependencias</button>
                                            <div className="form-group">
                                                <label for="">Dependencias</label>
                                                <input type="text" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.idNorma} />
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
              <button className="btn btn-success btn-sm mr-2" type="submit" id="boton-actualizar">Actualizar</button>
                  </div>
                  </form>
              </div>
            
            
            </>
            
        );

    }

};

export default EditarDatosBasicos;
