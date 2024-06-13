import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { FaCircle, FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
// Navigation
import { linkToParams } from "../../Helpers/Navigation";
import './EditarSolicitudBO.css';
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
//Moment
import moment from 'moment';
import { validarFormAltaSolicitud } from "../../Helpers/ValidacionForm"
import '../../Components/Autocomplete/Autocomplete.css'
let b64toBlob = require('b64-to-blob');


const EditarSolicitudBO = props => {
  const location = useLocation();
  const today = moment();
  const pasadoMañana = (today.add(2, "days"))

  const date = new Date();
  let horaActual = '';

  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState({});

  const [isLoading, setLoading] = useState(true) //API Check
  const [isArraying, setIsArraying] = useState(true) //API Check
  const [permisos, setPermisos] = useState();
  const [validaForm, setValidaForm] = useState(false) //Form Check
  const [fechaCarga, setFechaCarga] = useState(pasadoMañana)
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })

  const initForm = {
    idUsuario: localStorage.idUsuarioBO,
    usuario: localStorage.getItem("user_cuit"),
    normaAcronimoReferencia: '',
    organismoEmisor: '',
    idReparticion: null,
    idSeccion: null,
    idNormaTipo: null,
    idNormaSubtipo: null,
    normaNumero: '',
    normaAnio: '',
    normaSumario: '',
    tags: '',
    fechaSugerida: null,
    fechaLimite: null,
    fechaDesde: null,
    fechaHasta: null,
    idTipoProceso: 1,
    numeroReparto: '',
    procedimiento: '',
    numeroEdicionSubtipo: null,
    normaArchivoOriginal: '',
    normaArchivoOriginalS3Key: '',
    anexos: [],
    normaDocumento: '',
    reparticiones: '',
    siglasReparticiones: ''
  }

  const [form, setForm] = useState(initForm);
  const [feriados, setFeriados] = useState([])
  const [secciones, setSecciones] = useState(null);
  const [normaTipos, setNormaTipos] = useState(null);
  const [normaSubtipos, setNormaSubtipos] = useState(null);
  const [organismos, setOrganismos] = useState(null);
  const [reparticiones, setReparticiones] = useState(null);
  const [repasParaConjuntas, setRepasParaConjuntas] = useState(null);
  const [reparticionesSeleccionadas, setReparticionesSeleccionadas] = useState([]);
  const [errorIngresarSolicitud, setErrorIngresarSolicitud] = useState(false);
  const [mensajeErrorIngresarSolicitud, setMensajeErrorIngresarSolicitud] = useState('');
  const [errorAnexoGEDO, setErrorAnexoGEDO] = useState('');
  const [errorGEDOEspecial, setErrorGEDOEspecial] = useState('');
  const [jerarquias, setJerarquias] = useState(null);
  const [documento, setDocumento] = useState({});
  const [anexos, setAnexos] = useState([]);
  const [anexosIniciales, setAnexosIniciales] = useState([]);
  const [documentoBase64, setDocumentoBase64] = useState([]);
  const [captchaToken, setCaptchaToken] = useState();

  const [archivosCargados, setArchivosCargados] = useState(false);
  const [anexosCargados, setAnexosCargados] = useState(false);
  const [mostrarAnexos, setMostrarAnexos] = useState(false);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [validaGEDO, setValidaGEDO] = useState(null);
  const [validaAnexoGEDO, setValidaAnexoGEDO] = useState(null);
  const [extensionesPermitidas, setExtensionesPermitidas] = useState()
  const [limiteArchivo,setLimiteArchivo] = useState()

  //Guardo la seccion completa en un estado separado, para controlar mejor los cambios que dependen de cod_proceso o es_poder
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [sinSubtipo, setSinSubtipo] = useState(false);

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


  const handleFormChange = async (e) => {
    let value;
    switch (e.target.name) {
      case 'normaDocumento':
        ////console.log(e)
        let unForm = form
        unForm.normaDocumento = value
        setForm(unForm)
        break;
      case 'idSeccion':
        value = parseInt(e.target.value);
        let seccionSeleccionadaAux = secciones.find(sec => sec.idSeccion === value);
        if ((!seccionSeleccionada?.es_poder && !seccionSeleccionadaAux?.es_poder) || (seccionSeleccionada?.es_poder && seccionSeleccionadaAux?.es_poder)) {
          setForm({
            ...form,
            ['idSeccion']: value,
            ['idNormaTipo']: null,
            ['idNormaSubtipo']: null,
            ['idReparticionOrganismo']: null,
            ['idReparticion']: null,
            ['numeroEdicionSubtipo']: null,
            ['reparticiones']: '',
            ['siglasReparticiones']: ''
          })
        }
        else {
          setForm({
            ...form,
            ['idSeccion']: value,
            ['idNormaTipo']: null,
            ['idNormaSubtipo']: null,
            ['idReparticionOrganismo']: null,
            ['idReparticion']: null,
            ['numeroEdicionSubtipo']: null,
            ['reparticiones']: '',
            ['siglasReparticiones']: '',
            ['fechaDesde']: null,
            ['fechaHasta']: null,
            ['fechaSugerida']: null,
            ['fechaLimite']: null
          })
        }
        setSeccionSeleccionada(seccionSeleccionadaAux)
        setReparticionesSeleccionadas([])
        setValidaGEDO(null)
        await traerTiposDeNormasPorSeccion(permisos, value)
        setNormaSubtipos(null)
        setReparticiones(null)
        setOrganismos(null)
        break;
      case 'idNormaTipo':
        value = parseInt(e.target.value);
        setSinSubtipo(false)
        if (validaGEDO === 'is-valid') {
          setForm({
            ...form,
            ['idNormaTipo']: value,
            ['idNormaSubtipo']: null,
            ['numeroEdicionSubtipo']: null
          })
          setNormaSubtipos(null)
          traerSubtiposDeNormasPorTipo(permisos, value)
        }
        else {
          setForm({
            ...form,
            ['idNormaTipo']: value,
            ['idNormaSubtipo']: null,
            ['idReparticionOrganismo']: null,
            ['idReparticion']: null,
            ['numeroEdicionSubtipo']: null,
            ['reparticiones']: '',
            ['siglasReparticiones']: ''
          })
          setReparticionesSeleccionadas([])
          setNormaSubtipos(null)
          await traerSubtiposDeNormasPorTipo(permisos, value, normaTipos)
          setReparticiones(null)
          if (!(JSON.parse(localStorage.getItem("perfiles")).some(item => item.idPerfil === 5))) {
            traerRepasPorNormaTipo(permisos, value)
          }
          else {
            let repas = seccionSeleccionada.es_poder ?
              await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', { idSumarioNormasTipo: normaTipos.filter(n => n.idNormaTipo === value)[0].idSumarioNormasTipo }, localStorage.getItem("token")).catch(e)
              :
              await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: form.idSeccion }, localStorage.getItem("token")).catch(e)
            setReparticiones(repas.data.data)
          }
        }
        break;
      case 'idNormaSubtipo':
        value = parseInt(e.target.value);

        setForm({
          ...form,
          ['idNormaSubtipo']: value,
          ['numeroEdicionSubtipo']: null,
        })

        break;
      case 'idReparticionOrganismo':
        value = parseInt(e.target.value);
        setForm({
          ...form,
          ['idReparticionOrganismo']: value
        })
        /* 
                if (JSON.parse(localStorage.getItem("perfil")).idPerfil !== 5) {
                  traerReparticionPorOrganismo(permisos, value)
                }
                else {
                  setReparticiones(jerarquias.filter(j => j.idReparticionOrganismo === value)
                    .map(({ siglaOrganismo, organismo, idoRgJerarquia, ...r }) => r))
                } */
        break;
      case 'idReparticion':
        value = parseInt(e.target.value);
        const repa = reparticiones.find(n => n.idReparticion === value);
        let nombres = form.reparticiones.split('-');
        nombres.splice(0, 1, repa.reparticion)
        let siglas = form.siglasReparticiones.split('-');
        siglas.splice(0, 1, repa.siglaReparticion)
        setForm({
          ...form,
          ['idReparticion']: value,
          ['reparticiones']: nombres.join('-'),
          ['siglasReparticiones']: siglas.join('-')
        })
        await traerOrganismos(value);
        break;
      case 'organismoEmisor':
        value = e.target.value;
        setForm({
          ...form,
          ['organismoEmisor']: value
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
            ['normaAnio']: e.target.value.toString()
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
      case 'fechaDesde':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaDesde']: value
        })
        break;
      case 'fechaHasta':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaHasta']: value
        })
        break;
      case 'tipoProceso':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setForm({
          ...form,
          ['idTipoProceso']: value,
          ['normaAcronimoReferencia']: ''
        })
        break;
      case 'numeroReparto':
        value = e.target.value;
        setForm({
          ...form,
          ['numeroReparto']: value
        })
        break;
      case 'procedimiento':
        value = e.target.value;
        setForm({
          ...form,
          ['procedimiento']: value
        })
        break;
      case 'numeroEdicionSubtipo':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setForm({
          ...form,
          ['numeroEdicionSubtipo']: value
        })
        break;
      case 'tags':
        if (e.target.validity.valid) {
          value = e.target.value;
          setForm({
            ...form,
            ['tags']: value
          })
        }
        break;
      case 'normaAcronimoReferencia':
        if (e.target.validity.valid) {
          value = e.target.value.toUpperCase();
          if (validaGEDO) {
            setValidaGEDO(null)
            setDocumento({})
            setForm({
              ...form,
              ['normaAcronimoReferencia']: value,
              ['normaArchivoOriginal']: '',
              ['normaAnio']: '',
              ['normaNumero']: '',
              ['idReparticion']: null,
              ['idReparticionOrganismo']: null,
              ['idNormaTipo']: null,
              ['idNormaSubtipo']: null
            })
            await traerTiposDeNormasPorSeccion(permisos, form.idSeccion)
            setNormaSubtipos(null)
            setReparticiones(null)
            setDocumentoBase64([])
            document.getElementById('file-input-documento').value = null;
          }
          else {
            setValidaGEDO(null)
            setForm({
              ...form,
              ['normaAcronimoReferencia']: value
            })
          }
        }
        break;
      default:
        value = e.target.value;
        setForm({
          ...form,
          [e.target.name]: value
        })
        break;
    }
  }

  const handleReparticionesConjuntas = (e, index) => {
    e.preventDefault();
    let auxRepas = [...reparticionesSeleccionadas];
    auxRepas[index] = e.target.value;
    setReparticionesSeleccionadas(auxRepas)
  }

  const handleEditorChange = (e) => {
    setContentEditor(e)
  }

  //Si es GO BO carga todas las secciones, si no, usa los permisos
  const traerSecciones = async (perm) => {
    if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5) {
      try {
        let data;
        let body = {
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        await ApiPinGet('/api/v1/boletin-oficial/sumario/secciones', body, token).then((res) => {
          setSecciones(res.data.data)
          data = res.data.data;
        }).catch(function (error) {
          setLoading(false)
          ////console.log(error);
        });
        setLoading(false)
        return data
      }
      catch (error) {
        setLoading(false)
        ////console.log(error);
        linkToParams('/', {}, navigate)
      }
    }
    else {
      let arraySecciones = []
      if (perm && perm != {}) {
        for (let i = 0; i < perm.length; i++) {
          let s = perm[i]

          if (!arraySecciones.some(item => s.idSeccion === item.idSeccion)) {
            if (s.idNormaTipo != null) {
              arraySecciones.push(s)
            }

          }
        }
      }
      //////console.log(arraySecciones)
      setSecciones(arraySecciones);
      setSeccionSeleccionada(arraySecciones.find(sec => sec.idSeccion === solicitud.idSeccion))
      return arraySecciones
    }
  }

  const [valoresAutocomplete, setValoresAutocomplete] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');

  //Autocomplete
  function filtrarValores(inputValue) {
    let auxArray = organismos.filter(n => n.nombre.toUpperCase().includes(inputValue.toUpperCase()));
    setValoresAutocomplete(auxArray)
    setAutocompleteValue(inputValue)
  }

  useEffect(() => {
    if (autocompleteValue && organismos) {
      let aux = organismos?.find(org => org.nombre === autocompleteValue)?.sigla;
      if (aux) {
        setForm({ ...form, organismoEmisor: aux })
      }
      else {
        setForm({ ...form, organismoEmisor: null })
      }
    }
  }, [autocompleteValue])

  useEffect(() => {
    if (organismos) {
      let aux = JSON.parse(JSON.stringify(organismos))
      setValoresAutocomplete(aux)
    }
  }, [organismos])


  const traerOrganismos = async (idReparticion) => {
    try {
      if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5) {
        let body = {
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores', body, token).then((res) => {
          setOrganismos(res.data.data)
        })
      }
      else {
        let organismos_filtrados = permisos.filter(n => n.idSeccion === solicitud.idSeccion && (n.idNormaTipo === solicitud.idNormaTipo || (!(secciones?.find(n => n?.idSeccion === solicitud.idSeccion)?.es_poder) && n.idNormaTipo === 0)) && n.idReparticion === idReparticion);
        setOrganismos(organismos_filtrados.map(({ nombre, sigla }) => ({ nombre, sigla })))
      }
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reparticionesSeleccionadas && repasParaConjuntas && form) {
      let reparticionesAux = form?.reparticiones?.split('-')[0];
      let siglasReparticionesAux = form?.siglasReparticiones?.split('-')[0];
      for (const repa of reparticionesSeleccionadas) {
        if (!isNaN(parseInt(repa))) {
          const reparticion = repasParaConjuntas.find(n => n.idReparticion == repa)
          siglasReparticionesAux += '-' + reparticion.siglaReparticion;
          reparticionesAux += '-' + reparticion.reparticion;
        }
      }
      if (reparticionesAux?.length > 0 && siglasReparticionesAux?.length > 0) {
        setForm({ ...form, ['reparticiones']: reparticionesAux, ['siglasReparticiones']: siglasReparticionesAux })
      }
    }
  }, [reparticionesSeleccionadas])

  /*   useEffect(() => {
      if (reparticionesSeleccionadas && reparticiones?.length > 0 && form) {
        let repasSelecAux = form?.siglasReparticiones?.split('-');
        repasSelecAux?.shift();
        setReparticionesSeleccionadas(repasSelecAux)
      }
    }, [reparticiones]) */

  const getSolicitud = async () => {

    let data = []
    try {
      let body = {
        idNorma: location.state.idNorma,
        usuario: localStorage.getItem("user_cuit")
      }
      let token = localStorage.getItem("token");

      let res_permisos = await ApiPinPost('/api/v1/boletin-oficial/cuenta/permisos', {
        usuario: localStorage.getItem("user_cuit"),
        idCuenta: JSON.parse(localStorage.getItem("perfiles"))[0].idCuenta
      }, token);
      let auxPermisos = res_permisos?.data?.data
      setPermisos(auxPermisos)


      const res = await ApiPinPost('/api/v1/boletin-oficial/normas/norma', body, token)
      data = res.data.data[0]
      let dataDoc = ""
      if (data.normaDocumento.hasOwnProperty('normaDocumento')) {
        dataDoc = data.normaDocumento.normaDocumento
      }
      if (data.idNormaSubtipo === null) {
        setSinSubtipo(true)
      }
      let myform = {
        idUsuario: localStorage.idUsuarioBO,
        usuario: localStorage.getItem("user_cuit"),
        normaAcronimoReferencia: data.normaAcronimoReferencia,
        organismoEmisor: data.organismoEmisor,
        idReparticion: data.idReparticion,
        idSeccion: data.idSeccion,
        idNormaTipo: data.idNormaTipo,
        idNormaSubtipo: data.idNormaSubtipo,
        normaNumero: data.normaNumero,
        normaAnio: data.normaAnio,
        normaSumario: data.normaSumario,
        tags: data.tags,
        fechaSugerida: (data.fechaSugerida !== null) ? moment(data.fechaSugerida, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
        fechaLimite: (data.fechaLimite !== null) ? moment(data.fechaLimite, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
        fechaDesde: (data.fechaDesde !== null) ? moment(data.fechaDesde, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
        fechaHasta: (data.fechaHasta !== null) ? moment(data.fechaHasta, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
//normaArchivoOriginal: data.normaArchivoOriginal,
        normaArchivoOriginalS3Key: data.normaArchivoOriginalS3Key,
        anexos: data.anexos,
        normaDocumento: dataDoc,
        idTipoProceso: data.idTipoProceso,
        numeroEdicionSubtipo: data.numeroEdicionSubtipo,
        numeroReparto: data.numeroReparto,
        procedimiento: data.procedimiento,
        reparticiones: data.reparticiones,
        siglasReparticiones: data.siglasReparticiones,
        normaArchivoOriginal: data.normaArchivoOriginal,
        normaArchivoOriginalS3Key: data.normaArchivoOriginalS3Key
      }
      setAutocompleteValue(data.organismoEmisor)
      setContentEditor(dataDoc);
      ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: data.normaArchivoOriginalS3Key }, token).then(res => {
        let blob = b64toBlob(res.data, 'application/pdf')
        //let blobUrl = URL.createObjectURL(blob);
        setDocumento({ name: data.normaArchivoOriginal, vieneDeDB: true })
        setDocumentoBase64(blob)
      }).catch(e => { throw new Error(e) })
      setAnexosCargados(true)
      await getAnexosIniciales(data)
      const sec = await traerSecciones(auxPermisos)
      setSeccionSeleccionada(sec?.find(sec => sec?.idSeccion === data.idSeccion))
      let tipos = await traerTiposDeNormasPorSeccion(auxPermisos, data.idSeccion, sec?.find(n => n.idSeccion === data.idSeccion)?.es_poder)
      await traerSubtiposDeNormasPorTipo(auxPermisos, data.idNormaTipo, tipos)

      //Traer reparticiones
      if (!(JSON.parse(localStorage.getItem("perfiles")).some(item => item.idPerfil === 5))) {
        let repas = [];
        if (!sec.find(n => n.idSeccion === data.idSeccion).es_poder) {
          repas = auxPermisos.filter(item => item.idSeccion === data.idSeccion && item.idNormaTipo === 0).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
          //Filtro repetidos
          let aux = new Set(repas.map(n => n.idReparticion))
          repas = Array.from(aux).map(n => repas.find(r => r.idReparticion === n))
        }
        else {
          repas = auxPermisos.filter(item => item.idNormaTipo === data.idNormaTipo && item.idSeccion === data.idSeccion).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
        }

        setReparticiones(repas);
      }
      else {
        let repas;
        let body = {
          idSumarioNormasTipo: tipos.filter(n => n.idNormaTipo === data.idNormaTipo)[0].idSumarioNormasTipo
        }

        if (sec?.find(n => n.idSeccion === data.idSeccion)?.es_poder) {
          repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', body, localStorage.getItem("token"))
        }
        else {
          repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: data.idSeccion }, localStorage.getItem("token"))
        }
        setReparticiones(repas.data.data)
      }

      //Traer organismos
      if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5) {
        let body = {
          usuario: localStorage.getItem("user_cuit")
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores', body, token).then((res) => {
          setOrganismos(res.data.data)
        })
      }
      else {
        let organismos_filtrados = auxPermisos.filter(n => n.idSeccion === data.idSeccion && (n.idNormaTipo === data.idNormaTipo || (!(sec?.find(n => n?.idSeccion === data.idSeccion)?.es_poder) && n.idNormaTipo === 0)) && n.idReparticion === data.idReparticion);
        setOrganismos(organismos_filtrados.map(({ nombre, sigla }) => ({ nombre, sigla })))
      }

      //Conjuntas
      await ApiPinGet('/api/v1/organismos/reparticiones', localStorage.getItem("token"))
        .then(r => {
          setRepasParaConjuntas(r.data.data)
          const repas_conjuntas = data.siglasReparticiones?.split('-');
          repas_conjuntas.shift()
          if (repas_conjuntas?.length > 0) {
            setReparticionesSeleccionadas(r.data.data.filter(n => repas_conjuntas.includes(n.siglaReparticion)).map(i => i.idReparticion))
          }
        })

      // Carga los anexos
      /* let archivosAnexos = []
      for (let i = 0; i < losAnexos.length; i++)
        {
          let auxAn = losAnexos[i];
          
          await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre:auxAn.normaArchivoOriginalS3Key }, token).then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            //let blobUrl = URL.createObjectURL(blob);
            auxAn.base64 = blob;
            auxAn.name = data.normaArchivoOriginal
            auxAn.vieneDeDB = true;
            archivosAnexos.push(auxAn)
          })
        } */
      setSolicitud(data)
      setForm(myform)

    }
    catch (error) {
      setLoading(true)
      //console.log(error)
    }
  }

  const getAnexosIniciales = async (mySolicitud) => {

    try {
      /* let token = localStorage.getItem("token");
      let anexosAux = [...anexosIniciales]
      for (let i = 0; i < mySolicitud.anexos.length; i++) {
        let unAnexo = mySolicitud.anexos[i];
        //console.log('anexo a traer y cargar')
        //console.log(unAnexo)
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: unAnexo.normaAnexoArchivoS3Key }, token).then((res) => {
          let blob = b64toBlob(res.data, 'application/pdf')
          let blobUrl = URL.createObjectURL(blob);
          unAnexo.base64 = blob
          unAnexo.url = blobUrl
          unAnexo.nombre = unAnexo.normaAnexoArchivo
          unAnexo.name = unAnexo.normaAnexoArchivo
          unAnexo.vieneDeDB = true
          anexosAux.push(unAnexo)
          //console.log(anexosAux)
        }).catch(e => {  })

      }; */
      //console.log('SETEO')
      let anexosAux = [...mySolicitud.anexos] 
      for (let i = 0; i < mySolicitud.anexos.length; i++) {
        mySolicitud.anexos[i]['vieneDeDB'] = true
      }
      
      setAnexosIniciales(anexosAux)
      setMostrarAnexos(true)
      //setAnexosCargados(false)
    }
    catch (error) {
      setLoading(true)
      //console.log(error);
    }
  }

  /* const getPermisos = async () => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idCuenta: JSON.parse(localStorage.getItem("perfiles"))[0].idCuenta
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/cuenta/permisos', body, token).then((res) => {
        setPermisos(res.data.data)
      }).catch(function (error) {
        throw error
      });
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
      throw error
    }
  } */

  const getFeriados = async () => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        fechaAnio: 2022
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/feriados', body, token).then(res => {
        setFeriados(res.data.data)
      }).catch(function (error) {
        setLoading(false)
        //console.log(error);
      });
    }
    catch (error) {
      setLoading(false)
      //console.log(error);
      linkToParams('/', {}, navigate)
    }
  }

  useEffect(() => { if (permisos) { getFeriados() } }, [permisos])

  const traerTiposDeNormasPorSeccion = async (perm, idSeccion, seccion_es_poder) => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSeccion: idSeccion
      }
      let token = localStorage.getItem("token");
      const { data: { data: data } } = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipos', body, token)

      if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 || !seccion_es_poder) {
        setNormaTipos(data.map(({ idSeccion, seccion, normaTipoOrden, ...n }) => n))
        return data
      }
      else {
        if (perm && perm != {}) {
          let permisos_con_item_del_sumario = perm.map(n => ({ ...n, idSumarioNormasTipo: data.find(item => item.idNormaTipo === n.idNormaTipo)?.idSumarioNormasTipo }));
          permisos_con_item_del_sumario = permisos_con_item_del_sumario.filter(item => item.idSumarioNormasTipo !== undefined && item.idSeccion === idSeccion)
          permisos_con_item_del_sumario = permisos_con_item_del_sumario.map(({ idNormaTipo, idSumarioNormasTipo, normaTipo }) => ({ idNormaTipo, idSumarioNormasTipo, normaTipo }))
          const removeDuplicates = (arr, prop) => {
            const unique = new Map();
            return arr.filter(obj => !unique.has(obj[prop]) && unique.set(obj[prop], obj));
          };
          const uniqueArray = removeDuplicates(permisos_con_item_del_sumario, 'idNormaTipo');
          setNormaTipos(uniqueArray)
          return uniqueArray
        }
      }
    }
    catch (error) {
    }
  }

  /*   useEffect(async () => {
      if (normaTipos?.length > 0) {
        if (!(JSON.parse(localStorage.getItem("perfiles")).some(item => item.idPerfil === 5))) {
          await traerSubtiposDeNormasPorTipo(permisos, form.idNormaTipo);
          traerRepasPorNormaTipo(permisos, solicitud.idNormaTipo)
        }
        else {
          await traerSubtiposDeNormasPorTipo(permisos, form.idNormaTipo);
          let repas;
          let body = {
            idSumarioNormasTipo: normaTipos.filter(n => n.idNormaTipo === solicitud.idNormaTipo)[0].idSumarioNormasTipo
          }
  
          if (seccionSeleccionada.es_poder) {
            repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', body, localStorage.getItem("token"))
          }
          else {
            repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: solicitud.idSeccion }, localStorage.getItem("token"))
          }
          setReparticiones(repas.data.data)
        }
      }
    }, [normaTipos]) */

  const traerSubtiposDeNormasPorTipo = async (perm, idNormaTipo, tipos) => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTipo: tipos.filter(n => n.idNormaTipo === idNormaTipo)[0].idSumarioNormasTipo
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/subtipos', body, token).then((res) => {
        if (res.data.data.length === 0) {
          setSinSubtipo(true)
        }
        setNormaSubtipos((res.data.data).map(({ idSumarioNormasTiposSubtipo, idSumarioNormasTipo, normaSubtipoOrden, ...n }) => n))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
      setLoading(false)
    }
  }

  const traerRepasPorNormaTipo = (perm, idNormaTipo) => {
    let repas = [];
    if (!secciones.find(n => n.idSeccion === solicitud.idSeccion).es_poder) {
      repas = perm.filter(item => item.idSeccion === solicitud.idSeccion && item.idNormaTipo === 0).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
      //Filtro repetidos
      let aux = new Set(repas.map(n => n.idReparticion))
      repas = Array.from(aux).map(n => repas.find(r => r.idReparticion === n))
    }
    else {
      repas = perm.filter(item => item.idNormaTipo === idNormaTipo).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
    }

    setReparticiones(repas);
  }

  const ingresarSolicitud = async () => {
    if (validaForm === true) {
      try {
        await cargarDocumento().catch(e => { throw e });
        await cargarAnexos().catch(e => { throw e });


      }
      catch (error) {
        //console.log('Error en carga de documentos ', error)
      }
    }
  }

  const cargarDocumento = async () => {
    try {
      if (form.normaArchivoOriginalS3Key !== solicitud.normaArchivoOriginalS3Key) {
        if (documentoBase64.length > 0) {
          let token = localStorage.getItem("token");
          let data = documentoBase64[0].toString()
          let body = { documentBinary: data, nombre: documento.name, usuario: localStorage.getItem("user_cuit") };
          let actualForm = form
          await ApiPinPost(
            '/api/v1/boletin-oficial/subirArchivoBucketS3',
            body, token
          ).then(res => {
            //En res.data.Location está la URL del archivo, formato: 'https://proyecto-pin.dev.hcpi.gcba.gob.ar/nombre-del-archivo.pdf'
            //console.log(res)
            actualForm.normaArchivoOriginal = documento.name;
            actualForm.normaArchivoOriginalS3Key = res.data.Key
            setForm(actualForm)
          })
            .catch(err => {
              throw err;
            })
        }
      }

    }
    catch (err) {
      //console.log(err)
    }
  }

  async function cargarAnexos() {

    if (anexos.length > 0) {
      let token = localStorage.getItem("token");
      let anexosAux = [];
      const actualForm = form;
      for (const anx of anexos) {
        //console.log(anx)
        let body = { documentBinary: (anx.base64).toString(), nombre: anx.name, usuario: localStorage.getItem("user_cuit") };
        await ApiPinPost(
          '/api/v1/boletin-oficial/subirArchivoBucketS3',
          body, token
        ).then(async (res) => {
          anexosAux.push({ normaAnexoDescripcion: '', normaAnexoArchivo: anx.name, normaAnexoArchivoS3Key: res.data.Key })
        })
          .catch(err => {
            //console.log(err)
          });
      }
      for (const anx of anexosIniciales) {
        anexosAux.push({ normaAnexoDescripcion: '', normaAnexoArchivo: anx.normaAnexoArchivo, normaAnexoArchivoS3Key: anx.normaAnexoArchivoS3Key })
      }
      actualForm.anexos = anexosAux
      setForm(actualForm)
    }
    else {
      setArchivosCargados(true)
    }
  }

  /*   async function cargarAnexos() {
     
      if (anexos.length > 0 ) {
        let token = localStorage.getItem("token");
      let anexosAux = [];
      const actualForm = form;
        for (const anexo of anexos) {
          console.log(anexo)
          if(anexo.vieneDeDB !== true)
          {
            let body = { documentBinary: (anexo.base64).toString(), nombre: anexo.name, usuario: localStorage.getItem("user_cuit") };
          await ApiPinPost(
            '/api/v1/boletin-oficial/subirArchivoBucketS3',
            body, token
          ).then(async (res) => {
            anexosAux.push({ normaAnexoDescripcion: '', normaAnexoArchivo: anexo.name, normaAnexoArchivoS3Key: res.data.Key })
          })
            .catch(err => {
              console.log(err)
            });
          }
          else
          {
            console.log(anexo)
            anexosAux.push({ normaAnexoDescripcion: '', normaAnexoArchivo: anexo.name, normaAnexoArchivoS3Key: anexo.nombre })
          }
          
        }
        actualForm.anexos =anexosAux
        setForm(actualForm)
      }
      else {setArchivosCargados
        (true)
      }
    } */

  const onChangeDoc = async (doc) => {
    let auxArray = [];
    let docSize = parseInt(doc.size)
    if (!extensionesPermitidas.includes(doc.type)) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setForm({
        ...form,
        ['normaArchivoOriginal']: null
      })
      setDocumentoBase64(null);
      setDocumento({})
      document.getElementById('file-input-documento').value = null;
      return;
    }
    //Corroborar el peso del documento
    if (docSize > limiteArchivo){
      setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
      setDocumento({})
      setForm({
          ...form,
          ['normaArchivoOriginal']: ''
      })
      setDocumentoBase64([])
      document.getElementById('file-input-documento').value = null;
      return;
    }
    
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
    //console.log(doc)
  }

  //Se acumulan los anexos cargados
  //anexos contiene los files crudos y el codificado respectivo en base64
  const onChangeAnexos = async (ax) => {
    let auxAnexos = [...anexos];
    if (!extensionesPermitidas.includes(ax[0].type)) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setAnexos(auxAnexos)
      document.getElementById('file-input-anexos').value = null;
      document.getElementById('file-input-anexos').files = null;
      return;
    }
    //Corroborar el peso del documento
    if (Array.from(ax).some(a => a.size > limiteArchivo)){
      setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
      setAnexos([])
      document.getElementById('file-input-anexos').value = null;
      document.getElementById('file-input-anexos').files = null;
      return;
    }
    Array.from(ax).forEach(async (anexo) => {
      anexo['normaAnexoArchivo'] = anexo.name
      auxAnexos.push(anexo)
    })
    for (const anexo of auxAnexos) {
      convertirABase64(anexo)
        .then(res => {
          anexo['base64'] = res.split(',');
        })
    }
    setAnexos(auxAnexos)
   /*  document.getElementById('file-input-anexos').value = null;
    document.getElementById('file-input-anexos').files = null; */

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
  const cancelarCargaArchivo = (e, indice, tipo) => {
    e.preventDefault();
    //console.log('GUARDA QUE CANCELO')
    switch (tipo) {
      case 'documento':
        setDocumento({})
        setForm({
          ...form,
          ['normaArchivoOriginal']: ''
        })
        setDocumentoBase64([])
        document.getElementById('file-input-documento').value = null;
      case 'anexo':
        let auxAnexos = [...anexos];
        document.getElementById('file-input-anexos').value = null;
        document.getElementById('file-input-anexos').files = null;
        auxAnexos.splice(indice, 1)
        setAnexos(auxAnexos);
      case 'anexo-db':
        let auxAnexosI = [...anexosIniciales];
        document.getElementById('file-input-anexos').value = null;
        document.getElementById('file-input-anexos').files = null;
        const index = auxAnexosI.map(e => e.idNormasAnexo).indexOf(indice);
        if (index > -1) {
          auxAnexosI.splice(index, 1)
        }
        setAnexosIniciales(auxAnexosI);
    }
  }
  const getNombresAnexos = () => {
    let aux = [];
    for (let i = 0; i < anexos.length; i++) {
      aux.push(anexos[i])
    }
    for (let i = 0; i < anexosIniciales.length; i++) {
      aux.push(anexosIniciales[i])
    }
    return (aux.map((n, index) => <div>
      {n.normaAnexoArchivo}
      {(n.vieneDeDB === true ? (<FaTimes color='#C93B3B' cursor="pointer" onClick={(e) => cancelarCargaArchivo(e, n.idNormasAnexo, 'anexo-db')} />) : (<FaTimes color='#C93B3B' cursor="pointer" onClick={(e) => cancelarCargaArchivo(e, index, 'anexo')} />))}
      {(n.esGEDO === true ? (<div className="badge badge-success">Doc. GEDO</div>) : (''))}
      {(n.vieneDeDB === true ? (<div className="badge badge-info">Doc. DB</div>) : (''))}
    </div>));
  }

  const registrarIngresoAEdicion = async () => {
    let body = {
      idUsuario: localStorage.idUsuarioBO,
      usuario: localStorage.getItem("user_cuit"),
      idNorma: location.state.idNorma
    }
    let token = localStorage.getItem("token");
    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/registrar-ingreso-edicion', body, token)
      .catch((error) => {
        //console.log(error)
      })
  }

  const traerUsuariosActivos = async () => {
    let body = {
      idUsuario: localStorage.idUsuarioBO,
      usuario: localStorage.getItem("user_cuit"),
      idNorma: location.state.idNorma
    }
    let token = localStorage.getItem("token");
    const ingresosUsuarios = await ApiPinPost('/api/v1/boletin-oficial/normas/norma/ultimos-usuarios-edicion', body, token)
      .catch((error) => {
        //console.log(error)
      });//console.log(ingresosUsuarios)
    setUsuariosActivos(ingresosUsuarios.data.data)
  }

  useEffect(async () => {
    await getSolicitud()
    await registrarIngresoAEdicion()
    await traerUsuariosActivos()
    await traerExtensiones();
    await traerLimiteArchivo();
    setLoading(false)
  }, [])

  /*   useEffect(async () => {
      if (Object.keys(solicitud).length > 0 && isArraying) {
        setLoading(true)
        let mySolicitud = solicitud;
        await getAnexosIniciales(mySolicitud)
        const sec = await traerSecciones(permisos)
        let tipos = await traerTiposDeNormasPorSeccion(permisos, mySolicitud.idSeccion, sec?.find(n => n.idSeccion === mySolicitud.idSeccion)?.es_poder)
        await traerSubtiposDeNormasPorTipo(permisos, mySolicitud.idNormaTipo, tipos)
        if (!(JSON.parse(localStorage.getItem("perfiles")).some(item => item.idPerfil === 5))) {
          traerRepasPorNormaTipo(permisos, solicitud.idNormaTipo)
        }
        else {
          let repas;
          let body = {
            idSumarioNormasTipo: tipos.filter(n => n.idNormaTipo === solicitud.idNormaTipo)[0].idSumarioNormasTipo
          }
  
          if (sec?.find(n => n.idSeccion === mySolicitud.idSeccion)?.es_poder) {
            repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', body, localStorage.getItem("token"))
          }
          else {
            repas = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: solicitud.idSeccion }, localStorage.getItem("token"))
          }
          setReparticiones(repas.data.data)
        }
        await traerOrganismos(mySolicitud.idReparticion)
        setIsArraying(false)
        setLoading(false)
      }
    }, [solicitud]) */

  //Validador FORM
  useEffect(async () => {
    if (form && feriados && seccionSeleccionada && organismos) {
      let validacion = await validarFormAltaSolicitud(form, feriados, validaGEDO, permisos, sinSubtipo, seccionSeleccionada, organismos);
      setValidaForm(validacion)
    }

  }, [form, seccionSeleccionada, organismos])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidaForm(false);
    /* await ingresarSolicitud().then(async _ => {
      let body = form;
      body.idNorma = solicitud.idNorma;
      body.idNormasMetadato = solicitud.idNormasMetadato;
      body.idPrioridadTipo = solicitud.idPrioridadTipo;
      body.valorCotizacion = solicitud.valorCotizacion;
      body.numeroBUI = solicitud.numeroBUI;
      body.normaTexto = solicitud.normaTexto;
      body.normaDocumento = contentEditor;
      if (solicitud.normaDocumento.hasOwnProperty('idNormaDigitalizacion')) {
        body.idNormaDigitalizacion = solicitud.normaDocumento.idNormaDigitalizacion
      }
      else {
        body.idNormaDigitalizacion = 0
      }

      let token = localStorage.getItem("token");
      //console.log(body)
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar', body, token).then(res => {
        navigate("..")
      }).catch(function (error) {
        //console.log(error);
      });
    }); */
    //NEW SOLUTION
    let token = localStorage.getItem("token");
    let body = {
      ...form,
      idNorma : solicitud.idNorma,
      idPrioridadTipo : solicitud.idPrioridadTipo,
      idNormasMetadato : solicitud.idNormasMetadato,
      numeroBUI : solicitud.numeroBUI,
      valorCotizacion : solicitud.valorCotizacion,
      normaDocumento : contentEditor,
      normaTexto : solicitud.normaTexto,
      
    }
    if (solicitud.normaDocumento.hasOwnProperty('idNormaDigitalizacion')) {
      body.idNormaDigitalizacion = solicitud.normaDocumento.idNormaDigitalizacion
    }
    else {
      body.idNormaDigitalizacion = 0
    }
    if (Array.isArray(documentoBase64)){
      body.archivo = documentoBase64.join()
    }
    if (anexos.length>0){
      body.anexos = anexosIniciales.concat(anexos.map((n) => {
        return { nombre: n.name, base64: n.base64.join() }
      }))
    }else{
      body.anexos = [...anexosIniciales]
    }
    //Ver desde aca para abajo y ver correlacion con lo que pide la ruta de la API
    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar', body, token).then(res => {
      navigate("..")
    }).catch(function (error) {
      throw error
      //console.log(error);
    });
    setValidaForm(true);

  }

  const validarGEDO = async (tipo) => {
    if (tipo === 'anexo' || tipo === 'documento') {
      try {
        let body = {
          cuit: localStorage.getItem("user_cuit"),
          nombreNorma: tipo === 'documento' ? (form.normaAcronimoReferencia) : (document.getElementById('nombreAnexoGEDO').value)
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/traerPdfGEDO', body, token)
          .then(res => {
            let nombreSeparado = res.data.metadatos.numeroDocumento.split('-');
            if (res.data.metadatos.numeroEspecial !== undefined) {
              nombreSeparado = res.data.metadatos.numeroEspecial.split('-')
            }
            if (tipo === 'anexo') {
              setAnexos([...anexos, { name: (res.data.metadatos.numeroDocumento + '.pdf'), base64: ['data:application/pdf;base64', res.data.base64], esGEDO: true }]);
              document.getElementById('nombreAnexoGEDO').value = null;
            }
            else {
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
            setLoading(false)
            //console.log(error);
          });
      }
      catch (error) {
        setLoading(false)
        //console.log(error);
      }
    }
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
            }
            else {
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
            setLoading(false)
            //console.log(error);
          });
      }
      catch (error) {
        setLoading(false)
        //console.log(error);
      }
    }
  }

  if ((isLoading || isArraying) && mostrarAnexos === false) {
    //Spinner
    return (<Spinner />)
  }
  else {
    return (
      <>

        <header className="pt-4 pb-3 mb-4">
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                <li className="breadcrumb-item">Editar Solicitud</li>
              </ol>
            </nav>
          </div>
        </header>

        <div className="container" id="pagina-editar-solicitud">
          <div className="row mb-5 justify-content-start mb-2">
            <div className="col-12 col-lg-12">
              <header>
                <h1>BO - Editar Solicitud</h1>
                <div id="usuarios-activos">
                  Usuarios en los últimos 5 min:&nbsp;
                  {usuariosActivos && (usuariosActivos.filter(i => i.idUsuario !== JSON.parse(localStorage.perfiles)[0].idUsuario).length > 0) ?
                    usuariosActivos.map(i => i.idUsuario !== parseInt(JSON.parse(localStorage.getItem("perfiles")).idUsuario) &&
                      <span className="badge badge-success">{i.apellidoNombre}</span>) : (<i>Nadie por aquí...</i>)}
                </div>
              </header>
              <hr />
              <div className="container responsive">
                <div className="row justify-content-center mb-2">
                  <div className="col">
                    <form className="form" onSubmit={e => handleSubmit(e)}>
                      <div className="form-group">
                        <label for="idSeccion">Sección</label>
                        <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)}
                          value={(form.idSeccion != null) ? form.idSeccion : -1} disabled
                        >
                          {secciones && (secciones != {}) ? (
                            <>
                              <option value={-1} selected disabled>Seleccione una Sección</option>
                              {secciones.map((p, index) => (
                                <option value={p.idSeccion} key={'opt-sec-' + index}>{p.seccion}</option>
                              ))
                              }
                            </>
                          ) : (<option selected disabled>No hay secciones para mostrar</option>)
                          }

                        </select>
                      </div>
                      {seccionSeleccionada?.cod_proceso === "PR_LIC" ? (
                        <div class="campos-licitaciones">
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input"
                              type="radio"
                              id="bac"
                              name="tipoProceso"
                              onChange={e => handleFormChange(e)}
                              value={2}
                              checked={form.idTipoProceso === 2}
                              disabled
                            />
                            <label for="bac" class="custom-control-label">BAC</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input"
                              type="radio"
                              id="sigaf"
                              name="tipoProceso"
                              onChange={e => handleFormChange(e)}
                              value={3}
                              checked={form.idTipoProceso === 3}
                              disabled
                            />
                            <label for="sigaf" class="custom-control-label">SIGAF</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input"
                              type="radio"
                              id="baco"
                              name="tipoProceso"
                              onChange={e => handleFormChange(e)}
                              value={4}
                              checked={form.idTipoProceso === 4}
                              disabled
                            />
                            <label for="baco" class="custom-control-label">BACO</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input"
                              type="radio"
                              id="noAplica"
                              name="tipoProceso"
                              onChange={e => handleFormChange(e)}
                              value={1}
                              checked={form.idTipoProceso === 1}
                              disabled
                            />
                            <label for="noAplica" class="custom-control-label">No Aplica</label>
                          </div>
                        </div>
                      ) : ('')}
                      <br />
                      {form.idSeccion != null && <>
                        {(seccionSeleccionada?.cod_proceso === "PR_LIC" && form.idTipoProceso !== 1) ? (
                          (form.idTipoProceso === 3) ? (<input type="text" className="form-control nombre-licitacion" placeholder="Numero SIGAF"
                            id="normaNumero" name="normaNumero" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.normaNumero} />) : (
                            <div className="form-group nombre-licitacion">
                              <input type="text" className="form-control" placeholder="Reparto"
                                id="numeroReparto" name="numeroReparto" pattern="[0-9]*"
                                onChange={e => handleFormChange(e)} value={form.numeroReparto} />
                              <input type="text" className="form-control" placeholder="Numero"
                                id="normaNumero" name="normaNumero" pattern="[0-9]*" onChange={e => handleFormChange(e)} value={form.normaNumero} />
                              <input type="text" className="form-control" placeholder="Procedimiento"
                                id="procedimiento" name="procedimiento" pattern="[a-zA-Z0-9_-]+"
                                onChange={e => handleFormChange(e)} value={form.procedimiento} />
                            </div>)
                        ) : (
                          (seccionSeleccionada?.cod_proceso === "PR_PE" || seccionSeleccionada?.cod_proceso === "PR_COM" || (seccionSeleccionada?.cod_proceso === "PR_LIC" && form.idTipoProceso === 1)) ?
                            <div className="form-group acronimo">
                              <label for="normaAcronimoReferencia">{(form.idSeccion === 4) ? ('Acto Administrativo Respaldatorio') : ('Nombre de la Norma')}</label>
                              <input type="text" className={"form-control " + (validaGEDO ? 'is-valid' : validaGEDO === false ? 'is-invalid' : '')} placeholder="Ingrese el nombre de la norma"
                                id="normaAcronimoReferencia" name="normaAcronimoReferencia" pattern="[a-zA-Z0-9_-]+"
                                onChange={e => handleFormChange(e)} value={form.normaAcronimoReferencia} disabled />
                              <div class="valid-feedback">Norma validada con éxito</div>
                              <div class="invalid-feedback">{errorGEDOEspecial}</div>
                            </div> : (<><div></div><div></div></>))}
                        <div className="form-group">
                          <label for="idNormaTipo">Tipo de Norma</label>
                          <select className="custom-select" id="idNormaTipo" name="idNormaTipo" disabled
                            onChange={e => handleFormChange(e)} value={(form.idNormaTipo != null) ? form.idNormaTipo : -1} >
                            {normaTipos && (normaTipos != {}) ? (
                              <>
                                <option value={-1} selected disabled>Seleccione un tipo de norma</option>
                                {normaTipos.map((p, index) => (
                                  <option value={p.idNormaTipo} key={'opt-normatipo-' + index}>{p.normaTipo}</option>
                                ))
                                }
                              </>
                            ) : (<option selected disabled>No hay tipos de normas para mostrar</option>)
                            }
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="idNormaSubtipo">Subtipo de Norma</label>
                          <select className="custom-select" id="idNormaSubtipo" name="idNormaSubtipo" disabled
                            onChange={e => handleFormChange(e)} value={(form.idNormaSubtipo != null) ? form.idNormaSubtipo : -1} >
                            {normaSubtipos && (normaSubtipos != {}) ? (
                              <>
                                <option value={-1} selected disabled>Seleccione un subtipo de norma</option>
                                {normaSubtipos.map((p, index) => (
                                  <option value={p.idNormaSubtipo} key={'opt-normasubtipo-' + index}>{p.normaSubtipo}</option>
                                ))
                                }
                              </>
                            ) : (<option selected disabled>No hay subtipos de normas para mostrar</option>)
                            }
                          </select>
                          {([78, 79, 70].includes(form.idNormaSubtipo)) ? (<div class="form-group">
                            <label for="numeroEdicionSubtipo">Número de Edición del Subtipo</label>
                            <input type="text" className="form-control" id="numeroEdicionSubtipo" name="numeroEdicionSubtipo"
                              pattern="[0-9]*" onChange={e => handleFormChange(e)} value={(form.numeroEdicionSubtipo != null) ? form.numeroEdicionSubtipo : ''} />
                          </div>) : ((form.idSeccion === 5) ? (<br />) : (''))}
                        </div>
                        {(form.idSeccion !== 5 || (form.idSeccion === 5 && form.idTipoProceso === 1)) &&
                          <div className="form-group">
                            <label for="normaNumero">Número</label>
                            <input type="text" className="form-control" placeholder="Ingrese un número de Solicitud" id="normaNumero" name="normaNumero" pattern="[0-9]*"
                              onChange={e => handleFormChange(e)} value={form.normaNumero} disabled />
                          </div>}
                        <div className="form-group">
                          <label for="normaAnio">Año</label>
                          <input type="text" className="form-control" placeholder="Ingrese un año" id="normaAnio" name="normaAnio" pattern="[0-9]*"
                            onChange={e => handleFormChange(e)} value={form.normaAnio} disabled />
                        </div>
                        <div className="form-group">
                          <label for="idReparticion">Repartición</label>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <select className="custom-select" id="idReparticion" name="idReparticion" disabled={validaGEDO}
                              onChange={e => handleFormChange(e)} value={(form.idReparticion != null) ? form.idReparticion : -1} >
                              {reparticiones && (reparticiones != {}) ? (
                                <>
                                  <option value={-1} selected disabled>Seleccione una Repartición</option>
                                  {reparticiones.map((p, index) => (
                                    <option value={p.idReparticion} key={'opt-reparticion-' + index}>{p.reparticion}</option>
                                  ))
                                  }
                                </>
                              ) : (<option selected disabled>No hay reparticiones para mostrar</option>)
                              }
                            </select>
                            {form.idNormaSubtipo === 58 &&
                              <div class="dropdown-container">
                                <div class="dropdown">
                                  <button class="btn btn-link btn-lg"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false">
                                    <FaPlus />
                                  </button>
                                  <div class="dropdown-menu" onClick={(e) => { e.stopPropagation() }} style={{ width: "250px" }}>
                                    <button class="btn" type="button" onClick={() =>
                                      setReparticionesSeleccionadas([...reparticionesSeleccionadas, ''])
                                    }>
                                      Agregar otra Repartición <FaPlus />
                                    </button>
                                    {(reparticionesSeleccionadas && reparticionesSeleccionadas.length > 0) ? (
                                      reparticionesSeleccionadas.map((a, index) =>
                                        <div className="form-group" style={{ display: "flex" }}>
                                          <select className="custom-select"
                                            id={"reparticion" + index}
                                            name={"reparticion" + index}
                                            onChange={(e) => handleReparticionesConjuntas(e, index)}
                                            value={(reparticionesSeleccionadas[index] !== "") ? (reparticionesSeleccionadas[index]) : ""} >
                                            {repasParaConjuntas && (repasParaConjuntas != {}) ? (
                                              <>
                                                <option value="" disabled>Seleccione una reparticion</option>
                                                {repasParaConjuntas.map((p, index) => (
                                                  <option value={p.idReparticion} key={'opt-repa-conjunta-' + index}>{p.reparticion}</option>
                                                ))
                                                }
                                              </>
                                            ) : (<option selected disabled>No hay reparticiones para mostrar</option>)
                                            }
                                          </select>
                                          <button class="btn btn-danger btn-sm ml-1" type="button" onClick={() => {
                                            let auxOrgs = reparticionesSeleccionadas;
                                            auxOrgs.splice(index, 1);
                                            setReparticionesSeleccionadas([...auxOrgs])
                                          }}>
                                            <FaMinus />
                                          </button>
                                        </div>)) : ('')}
                                  </div>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                        <div className="form-group">
                          <label for="organismoEmisor">Organismo Emisor</label>
                          <div id="autocomplete">
                            <div className="dropdown-container" >
                              <div className="dropdown">
                                <input className="form-control buscador" value={autocompleteValue ? autocompleteValue : ''}
                                  onChange={e => filtrarValores(e.target.value)}
                                  data-toggle="dropdown" />
                                <div className={"dropdown-menu"} id="autocomplete-options">
                                  {valoresAutocomplete && valoresAutocomplete.length > 0 &&
                                    valoresAutocomplete.map(elem =>
                                      <button className="dropdown-item btn btn-sm" type="button" onClick={() => filtrarValores(elem.nombre)}>{elem.nombre}</button>
                                    )
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* <select className="custom-select" id="organismoEmisor" name="organismoEmisor" disabled={validaGEDO}
                            onChange={e => handleFormChange(e)} value={(form.organismoEmisor != null) ? form.organismoEmisor : -1} >
                            {organismos && (organismos != {}) ? (
                              <>
                                <option value={-1} selected disabled>Seleccione un organismo</option>
                                {organismos.map((p, index) => (
                                  <option value={p.sigla} key={'opt-organismo-' + index}>{p.sigla} ({p.nombre})</option>
                                ))
                                }
                              </>
                            ) : (<option selected disabled>No hay organismos para mostrar</option>)
                            }
                          </select> */}
                        </div>
                        {!seccionSeleccionada?.es_poder ? (
                          <>
                            <div className="form-group sinmargeninferior">
                              <label for="fechaDesde">Fecha Desde</label>
                              <input
                                type="date"
                                className={"form-control " + String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaDesde))
                                  || moment(form.fechaDesde).day() === 6 || moment(form.fechaDesde).day() === 0 ? " is-invalid" : " ")}
                                id="fechaDesde"
                                name="fechaDesde"
                                aria-describedby="date-help"
                                onChange={e => handleFormChange(e)} value={form.fechaDesde || ''}
                                min={moment(solicitud.fechaDesde).format("YYYY-MM-DD")}
                              />
                              <div class="invalid-feedback"><font size="1">La Fecha Desde no puede corresponderse con un fin de semana o feriado</font></div>
                            </div>
                            <div className="form-group sinmargeninferior">
                              <label for="fechaHasta">Fecha Hasta</label>{/* console.log(moment(form.fechaHasta).day()) */}
                              <input
                                type="date"
                                className={"form-control " +
                                  String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaHasta))
                                    || moment(form.fechaHasta).day() === 6 || moment(form.fechaHasta).day() === 0 ? " is-invalid" : " ")}
                                id="fechaHasta"
                                name="fechaHasta"
                                aria-describedby="date-help"
                                disabled={!(moment(form.fechaDesde).isValid())}
                                onChange={e => handleFormChange(e)} value={form.fechaHasta || ''}
                                min={form.fechaDesde/* (moment(form.fechaDesde).day() === 5) ? moment(form.fechaDesde).add(3, "day").format("YYYY-MM-DD")
                          : (moment(form.fechaDesde).day() === 6) ? moment(form.fechaDesde).add(2, "day").format("YYYY-MM-DD")
                            : moment(form.fechaDesde).add(1, "day").format("YYYY-MM-DD") */}
                              />
                              <div class="invalid-feedback"><font size="1">La Fecha Hasta no puede corresponderse con un fin de semana o feriado</font></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="form-group sinmargeninferior">
                              <label for="fechaSugerida">Fecha Sugerida</label>
                              <input
                                type="date"
                                className={"form-control " +
                                  String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaSugerida))
                                    || moment(form.fechaSugerida).day() === 6 || moment(form.fechaSugerida).day() === 0 ? " is-invalid" : " ")}
                                id="fechaSugerida"
                                name="fechaSugerida"
                                aria-describedby="date-help"
                                onChange={e => handleFormChange(e)} value={form.fechaSugerida || ''}
                                min={moment().hours() < 15 ?
                                  moment().day() === 5 ? moment().add(3, 'day').format('YYYY-MM-DD') : moment().add(1, 'day').format("YYYY-MM-DD")
                                  : moment().day() === 5 ? moment().add(4, 'day').format('YYYY-MM-DD') : moment().add(2, "day").format("YYYY-MM-DD")}
                              />
                              <div class="invalid-feedback"><font size="1">La Fecha Sugerida no puede corresponderse con un fin de semana o feriado</font></div>
                            </div>
                            <div className="form-group sinmargeninferior">
                              <label for="fechaLimite">Fecha Límite</label>
                              <input
                                type="date"
                                className={"form-control " +
                                  String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaLimite))
                                    || moment(form.fechaLimite).day() === 6 || moment(form.fechaLimite).day() === 0 ? " is-invalid" : " ")}
                                id="fechaLimite"
                                name="fechaLimite"
                                aria-describedby="date-help"
                                onChange={e => handleFormChange(e)} value={form.fechaLimite || ''}
                                disabled={!(moment(form.fechaSugerida).isValid())}
                                min={(moment(form.fechaSugerida).day() === 5) ? moment(form.fechaSugerida).add(3, "day").format("YYYY-MM-DD")
                                  : (moment(form.fechaSugerida).day() === 6) ? moment(form.fechaSugerida).add(2, "day").format("YYYY-MM-DD")
                                    : moment(form.fechaSugerida).add(1, "day").format("YYYY-MM-DD")}
                              />
                              <div class="invalid-feedback"><font size="1">La Fecha Límite no puede corresponderse con un fin de semana o feriado</font></div>
                            </div>
                          </>
                        )
                        }
                        <div className={(seccionSeleccionada?.cod_proceso === "PR_PE" || seccionSeleccionada?.cod_proceso === "PR_COM" || (seccionSeleccionada?.cod_proceso == "PR_LIC" && form.idTipoProceso === 1)) ? ("form-group sinmargeninferior tags") : ("form-group sinmargeninferior tags-2")}>
                          <label for="tags">Tags</label>
                          <input type="text" className="form-control" placeholder="Ingrese los tags separados por una coma." id="tags" name="tags" pattern="^[a-zA-Z,]*$" onChange={e => handleFormChange(e)} value={form.tags} />
                        </div>
                        <div className="form-group sumario">
                          <label for="normaSumario">Sumario</label>
                          <textarea className="form-control" id="normaSumario" name="normaSumario" rows="4" onChange={e => handleFormChange(e)} value={form.normaSumario}></textarea>
                        </div>
                        <div className="form-group carga-documentos">
                          <label for="file-input" class="custom-file-upload">Documento Original</label>
                          <input type="file" className="form-control-file" id="file-input-documento" onChange={(e) => onChangeDoc(e.target.files[0])} disabled={validaGEDO} accept={extensionesPermitidas} />
                        </div>
                        <div className="card" style={{ padding: "20px" }}>
                          <div >
                            {
                              (form?.normaArchivoOriginal && form.normaArchivoOriginal != undefined) ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <div style={{ marginRight: "10px" }}>{form?.normaArchivoOriginal}</div>
                                  {!validaGEDO && <FaTimes color='#C93B3B' cursor="pointer" onClick={(e) => cancelarCargaArchivo(e, documento.name, 'documento')} />}
                                  {documento.esGEDO === true ? (<div className="badge badge-success">Doc. GEDO</div>) : ('')}
                                </div>
                              ) : ("No se ingresó ningún documento")
                            }
                          </div>
                          <hr />
                          <div style={{ maxHeight: "120px", maxWidth: "480px", overflowY: "auto" }}>
                            {
                              ((anexos && anexos.length > 0) || (anexosIniciales && anexosIniciales.length > 0)) ? (getNombresAnexos()) : ("No se ingresaron anexos")
                            }
                            {/* {(anexos && anexos.length > 0) ? (anexos.map(anexo => (anexo.esGEDO === true ? (<div className="badge badge-success">Doc. GEDO</div>):('')))) : ("")} */}
                          </div>
                        </div>
                        <div className="form-group carga-anexos">
                          <label for="file-input">Anexos</label>
                          <input type="file" multiple className="form-control-file" id="file-input-anexos" onChange={(e) => onChangeAnexos(e.target.files)}/* disabled={!habilitar} */ accept={extensionesPermitidas} />
                        </div>
                        <div>{
                          form.idSeccion === 2 &&
                          <div>
                            <label for="tags" style={{ fontSize: 14 }}>Anexo por GEDO (Opcional)</label>
                            <input type="text" className={"form-control " + (validaAnexoGEDO ? 'is-valid' : validaAnexoGEDO === false ? 'is-invalid' : '')} placeholder="Ingrese el nombre del anexo" id="nombreAnexoGEDO" name="nombreAnexoGEDO" pattern="[a-zA-Z0-9_-]+" onChange={e => handleFormChange(e)} />
                            <div class="valid-feedback">Validado con éxito</div>
                            <div class="invalid-feedback">{errorAnexoGEDO}</div>
                            <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: "5px" }} onClick={() => validarGEDO('anexo')}>
                              Validar Anexo GEDO
                            </button>
                          </div>
                        }
                        </div>
                        {/* <div className="form-group editor">
                  <SunEditor height="360px" placeholder="Ingrese norma digitalmente..." lang="es" setOptions={editorOptions}
                    setContents={contentEditor}
                    onChange={e => handleEditorChange(e)}
                    id="normaDocumento" name="normaDocumento"
                  />
                </div> */}

                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button type="submit" className="btn btn-primary" disabled={!validaForm} id="ingresar-solicitud">Actualizar Solicitud</button>
                        </div>
                      </>
                      }
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
          <Modal.Header>
            <Modal.Title>Error</Modal.Title>
            <i className='bx bx-x bx-sm' type="button" onClick={() => setModalError({ show: false, mensaje: '' })}></i>
          </Modal.Header>
          <Modal.Body>
            <div class="alert alert-danger" role="alert">
              <p>{modalError?.mensaje}</p>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>

      </>
    );
  }
};

export default EditarSolicitudBO;
