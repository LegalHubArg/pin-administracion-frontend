import React, { useState, useEffect } from 'react';

import { FaTimes, FaCheckSquare, FaPlus, FaMinus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
import { validarFormAltaSolicitud } from '../../../Helpers/ValidacionForm'
// Navigation
import { linkToParams } from "../../../Helpers/Navigation";
import './AltaSolicitudBO.css';
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
//Moment
import moment from 'moment';
import { rutasBO } from '../../../routes';
import '../../../Components/Autocomplete/Autocomplete.css'
import { Modal } from 'react-bootstrap';

let b64toBlob = require('b64-to-blob');

const AltaSolicitudBO = props => {

  const today = moment();

  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true) //API Check
  const [isArraying, setIsArraying] = useState(true) //API Check
  const [permisos, setPermisos] = useState();
  const [validaForm, setValidaForm] = useState(false) //Form Check
  const [error, setError] = useState(false) //Flag de error de la página
  if (error) throw error //Lo catchea el ErrorBoundary

  const initForm = {
    idUsuario: localStorage.idUsuarioBO,
    usuario: localStorage.getItem("user_cuit"),
    normaAcronimoReferencia: '',
    idReparticionOrganismo: null,
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
  const [reparticionesSeleccionadas, setReparticionesSeleccionadas] = useState([]);


  const [documento, setDocumento] = useState({});
  const [anexos, setAnexos] = useState([]);
  const [documentoBase64, setDocumentoBase64] = useState([]);
  const [archivosCargados, setArchivosCargados] = useState(false);
  const [validaGEDO, setValidaGEDO] = useState(null);
  const [validaAnexoGEDO, setValidaAnexoGEDO] = useState(null);
  const [errorIngresarSolicitud, setErrorIngresarSolicitud] = useState(false);
  const [mensajeErrorIngresarSolicitud, setMensajeErrorIngresarSolicitud] = useState('');
  const [errorAnexoGEDO, setErrorAnexoGEDO] = useState('');
  const [errorGEDOEspecial, setErrorGEDOEspecial] = useState('');
  const [extensionesPermitidas, setExtensionesPermitidas] = useState()
  const [limiteArchivo,setLimiteArchivo] = useState()

  //Guardo la seccion completa en un estado separado, para controlar mejor los cambios que dependen de cod_proceso o es_poder
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [sinSubtipo, setSinSubtipo] = useState(false);
  const [valoresAutocomplete, setValoresAutocomplete] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })
  const [reparticionesCombo,setReparticionesCombo] = useState(null)

  const getReparticionesCombo = async () =>{
    try {
      let token = localStorage.getItem("token");
      await ApiPinGet('/api/v1/organismos/reparticiones', token).then((res) => {
        if (res.data.data.length>0){
          setReparticionesCombo(res.data.data)
        }else{
          setReparticionesCombo([])
        }
      }).catch(function (error) {
        throw error
      });
      setLoading(false)
    } catch (error) {
      //console.log(error)
      throw error
    }
  }
  
  const getPermisos = async () => {
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
  }

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
          await traerSubtiposDeNormasPorTipo(permisos, value)
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
        if (!validaGEDO) { await traerOrganismos(value); }
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
            ['normaAnio']: e.target.value
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

  //Si es GO BO carga todas las secciones, si no, usa los permisos
  const traerSecciones = async (perm) => {
    if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5) {
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
        setLoading(false)
        throw error
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
    }
  }

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
        let organismos_filtrados = permisos.filter(n => n.idSeccion === form.idSeccion && (n.idNormaTipo === form.idNormaTipo || n.idNormaTipo === 0) && n.idReparticion === idReparticion);
        setOrganismos(organismos_filtrados.map(({ nombre, sigla }) => ({ nombre, sigla })))
      }
    }
    catch (error) {
    }
  }

  useEffect(() => {
    if (reparticionesSeleccionadas && reparticiones) {
      let reparticionesAux = form?.reparticiones.split('-')[0];
      let siglasReparticionesAux = form?.siglasReparticiones.split('-')[0];
      for (const repa of reparticionesSeleccionadas) {
        if (repa.length > 0) {
          const reparticionNombre = reparticionesCombo.find(n => n.siglaReparticion === repa).reparticion
          siglasReparticionesAux += '-' + repa;
          reparticionesAux += '-' + reparticionNombre;
        }
      }
      if (reparticionesAux?.length > 0 && siglasReparticionesAux?.length > 0) {
        setForm({ ...form, ['reparticiones']: reparticionesAux, ['siglasReparticiones']: siglasReparticionesAux })
      }
    }
  }, [reparticionesSeleccionadas])
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
        ////console.log(error);
      });
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
      ////console.log(error);
      linkToParams('/', {}, navigate)
    }
  }

  useEffect(() => { if (permisos) { getFeriados() } }, [permisos])

  const traerTiposDeNormasPorSeccion = async (perm, idSeccion) => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSeccion: idSeccion
      }
      let token = localStorage.getItem("token");
      const { data: { data: data } } = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipos', body, token)

      if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 || !secciones.find(n => n.idSeccion === idSeccion).es_poder) {
        setNormaTipos(data.map(({ idSeccion, seccion, normaTipoOrden, ...n }) => n))
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
        }
      }
    }
    catch (error) {
    }
  }

  const traerSubtiposDeNormasPorTipo = async (perm, idNormaTipo) => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTipo: normaTipos.filter(n => n.idNormaTipo === idNormaTipo)[0].idSumarioNormasTipo
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
    if (!secciones.find(n => n.idSeccion === form.idSeccion).es_poder) {
      repas = perm.filter(item => item.idSeccion === form.idSeccion && item.idNormaTipo === 0).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
      //Filtro repetidos
      let aux = new Set(repas.map(n => n.idReparticion))
      repas = Array.from(aux).map(n => repas.find(r => r.idReparticion === n))
    }
    else {
      repas = perm.filter(item => item.idNormaTipo === idNormaTipo && item.idSeccion === form.idSeccion).map(({ idReparticion, siglaReparticion, reparticion }) => ({ idReparticion, siglaReparticion, reparticion }))
    }
    setReparticiones(repas);
  }

  const onChangeDoc = async (doc) => {
    let auxArray = [];
    let docSize = doc.size
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
    if (docSize > limiteArchivo){
      setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
      setForm({
        ...form,
        ['normaArchivoOriginal']: null
      })
      setDocumentoBase64(null);
      setDocumento({})
      document.getElementById('file-input-documento').value = null;
      return;
    }
    if (doc instanceof Blob) {
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
    }
  }

  //Se acumulan los anexos cargados
  //anexos contiene los files crudos y el codificado respectivo en base64
  const onChangeAnexos = (ax) => {
    let auxAnexos = [...anexos];
    let nombres = [];
    let docSize = ax[0].size
    if (!extensionesPermitidas.includes(ax[0].type)) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setAnexos(auxAnexos)
      document.getElementById('file-input-anexos').value = null;
      document.getElementById('file-input-anexos').files = null;
      return;
    }
    if (docSize > limiteArchivo){
      setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
      setAnexos(auxAnexos)
      document.getElementById('file-input-anexos').value = null;
      document.getElementById('file-input-anexos').files = null;
      return;
    }
    //Controlo que no ingrese 2 archivos con el mismo nombre
    for (const anexo of auxAnexos) {
      nombres.push(anexo.name)
    }
    Array.from(ax).forEach(async (anexo) => {
      if (!(nombres.includes(anexo.name))) {
        auxAnexos.push(anexo)
      }
    })
    for (const anexo of auxAnexos) {
      convertirABase64(anexo)
        .then(res => {
          anexo['base64'] = res.split(',');
        })
    }
    setAnexos(auxAnexos)
    document.getElementById('file-input-anexos').value = null;
    document.getElementById('file-input-anexos').files = null;

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
        setAnexos(auxAnexos)
        setValidaAnexoGEDO(null)
    }
  }

  const getNombresAnexos = () => {
    let aux = [];
    for (let i = 0; i < anexos.length; i++) {
      aux.push(anexos[i])
    }
    return (aux.map((n, index) => <div>
      {n.name} <FaTimes color='#C93B3B' cursor="pointer" onClick={(e) => cancelarCargaArchivo(e, index, 'anexo')} />
      {(n.esGEDO === true ? (<div className="badge badge-success">Doc. GEDO</div>) : (''))}
    </div>));
  }

  useEffect(async () => {
    await getPermisos().catch(e => {
      if (!JSON.parse(localStorage.getItem('perfiles')).find(n => n.idPerfil === 5 || n.idPerfil === 1))
        setError(e.data.mensaje)
    })
    await traerExtensiones();
    await getReparticionesCombo()
    await traerLimiteArchivo()
  }, [])

  useEffect(async () => {
    if (!isLoading && isArraying) {
      ////console.log('TRAIGA')
      await traerSecciones(permisos).catch(e => setError(e.data.mensaje))
      setIsArraying(false)
    }
  }, [isLoading])

  //Validador FORM
  useEffect(async () => {
    if (form && feriados) {
      let validacion = await validarFormAltaSolicitud(form, feriados, validaGEDO, permisos, sinSubtipo, seccionSeleccionada, organismos);
      setValidaForm(validacion)
    }
  }, [form])

  //Autocomplete
  function filtrarValores(inputValue) {
    let auxArray = organismos.filter(n => n.nombre.toUpperCase().includes(inputValue.toUpperCase()));
    setValoresAutocomplete(auxArray)
    setAutocompleteValue(inputValue)
  }

  useEffect(() => {
    if (autocompleteValue) {
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
      setAutocompleteValue('')
    }
  }, [organismos])

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Deshabilita el botón antes de realizar la solicitud
    const botonIngresar = document.getElementById("ingresar-solicitud");
    if (botonIngresar) {
      botonIngresar.disabled = true;
    }
  
    let body = {
      ...form,
      archivo: documentoBase64.join(),
      anexos: anexos.map((n) => {
        return { nombre: n.name, base64: n.base64.join() }
      })
    };
    let token = localStorage.getItem("token");

    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/crear', body, token).then(res => {
      navigate(`../${rutasBO.normas}/${res.data.data.idNorma}`)
    }).catch(function (error) {
      //console.log(error);
      setErrorIngresarSolicitud(true)
      setMensajeErrorIngresarSolicitud(error.data.mensaje.replace('PIN:', 'Error:') + `(${error.data.norma.normaAcronimoReferencia})`)
    });

  }

  const validarGEDO = async (tipo) => {
    if (tipo === 'anexo' || tipo === 'documento') {
      try {
        if (tipo === 'anexo' && anexos.filter(elem => elem.name.split('.')[0] === document.getElementById('nombreAnexoGEDO').value).length > 0) {
          throw new Error('No puede ingresar el mismo documento más de una vez.')
        }
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
              setValidaAnexoGEDO(true)
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
            throw 'Error al validar documento GEDO'
          });
        setLoading(false)
      }
      catch (error) {
        setLoading(false);
        //console.log(error);
        setValidaAnexoGEDO(false)
        setErrorAnexoGEDO(String(error))
      }
    }
  }
  const validarGEDOEspecial = async (tipo) => {
    if (tipo === 'anexo' || tipo === 'documento') {
      try {
        let body = {
          idUsuario: localStorage.idUsuarioBO,
          idCuenta: JSON.parse(localStorage?.perfiles)[0]?.idCuenta,
          idPerfil: JSON.parse(localStorage.getItem("perfil")).idPerfil,
          cuit: localStorage.getItem("user_cuit"),
          nombreNorma: tipo === 'documento' ? (form.normaAcronimoReferencia) : (document.getElementById('nombreAnexoGEDO').value)
        }
        let token = localStorage.getItem("token");
        let res = await ApiPinPost('/api/v1/boletin-oficial/normas/traerPdfGEDO/numeroespecial', body, token).catch(function (error) {
          setErrorGEDOEspecial(error.data.mensaje)
          throw error
        });

        //console.log(res.data.metadatos)
        let nombreSeparado = res.data.metadatos.numeroDocumento.split('-');
        if (res.data.metadatos.numeroEspecial !== undefined) {
          nombreSeparado = res.data.metadatos.numeroEspecial.split('-')
        }
        if (tipo === 'anexo') {
          setAnexos([...anexos, { name: (res.data.metadatos.numeroDocumento + '.pdf'), base64: ['data:application/pdf;base64', res.data.base64], esGEDO: true }]);
          document.getElementById('nombreAnexoGEDO').value = null;
          setValidaAnexoGEDO(true)
        }
        else {
          setValidaGEDO(true)
          setDocumento({ name: (res.data.metadatos.numeroDocumento + '.pdf'), esGEDO: true })
          setDocumentoBase64([['data:application/pdf;base64', res.data.base64]])
          // setValoresAutocomplete([{ idOrgEmisor: res.data.metadatos.organismo.idOrgEmisor, nombre: res.data.metadatos.organismo.nombre, sigla: res.data.metadatos.organismo.sigla }])
          setAutocompleteValue(res.data.metadatos.organismo.nombre)
          setNormaTipos([{ idNormaTipo: res.data.metadatos.idNormaTipo, normaTipo: res.data.metadatos.normaTipo }])
          setNormaSubtipos([{ idNormaSubtipo: res.data.metadatos.idNormaSubtipo, normaSubtipo: res.data.metadatos.normaSubtipo }])
          setForm({
            ...form,
            ['normaNumero']: ~~nombreSeparado[2],
            ['normaAnio']: nombreSeparado[1],
            ['organismoEmisor']: res.data.metadatos.organismo.sigla,
            ['idReparticionOrganismo']: res.data.metadatos.organismo.idOrgEmisor,
            ['idNormaTipo']: res.data.metadatos.idNormaTipo,
            ['idNormaSubtipo']: res.data.metadatos.idNormaSubtipo,
            ['normaArchivoOriginal']: (res.data.metadatos.numeroDocumento + '.pdf')
          });
          if (!(JSON.parse(localStorage.getItem("perfiles")).some(item => item.idPerfil === 5))) {
            traerRepasPorNormaTipo(permisos, form.idSeccion)
          }
          else {
            let repas = seccionSeleccionada.es_poder ?
              await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', { idSumarioNormasTipo: normaTipos.filter(n => n.idNormaTipo === form.idSeccion)[0].idSumarioNormasTipo }, localStorage.getItem("token"))
              :
              await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: form.idSeccion }, localStorage.getItem("token"))
            setReparticiones(repas.data.data)
          }
        }
        setLoading(false)
      }
      catch (error) {
        setValidaGEDO(false)
        setLoading(false)
        //console.log(error);
      }
    }
  }

  if (isLoading) {
    //Spinner
    return (<Spinner loading={isLoading} />)
  }
  else {
    return (
      <>
        <header className="pt-4 pb-3 mb-4">
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                <li className="breadcrumb-item">Alta de Solicitud</li>
              </ol>
            </nav>
          </div>
        </header>

        <div className="container mb-5" id="pagina-alta-solicitud">
          <header>
            <h1 className="mb-3">BO - Alta de Solicitud</h1>
          </header>
          <hr />
          <div className="container responsive">
            <form className="form" onSubmit={e => handleSubmit(e)}>
              <div className="form-group">
                <label for="idSeccion">Sección *</label>
                <select className="custom-select" id="idSeccion" name="idSeccion" onChange={e => handleFormChange(e)} value={(form.idSeccion != null) ? form.idSeccion : -1}
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
                      defaultChecked
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
                        onChange={e => handleFormChange(e)} value={form.normaAcronimoReferencia} />
                      <div class="valid-feedback">Norma validada con éxito</div>
                      <div class="invalid-feedback">{errorGEDOEspecial}</div>

                      <button type="button" className="btn btn-primary" onClick={() => validarGEDOEspecial('documento')}>
                        Validar GEDO
                      </button>

                    </div> : (<><div></div><div></div></>))}
                <div className="form-group">
                  <label for="idNormaTipo">Tipo de Norma *</label>
                  <select className="custom-select" id="idNormaTipo" name="idNormaTipo" disabled={validaGEDO}
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
                  <label for="idNormaSubtipo">Subtipo de Norma *</label>
                  <select className="custom-select" id="idNormaSubtipo" name="idNormaSubtipo" disabled={validaGEDO || sinSubtipo}
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
                    <label for="normaNumero">Número *</label>
                    <input type="text" className="form-control" placeholder="Ingrese un número de Solicitud" id="normaNumero" name="normaNumero" pattern="[0-9]*"
                      onChange={e => handleFormChange(e)} value={form.normaNumero} disabled={validaGEDO} />
                  </div>}
                <div className="form-group">
                  <label for="normaAnio">Año *</label>
                  <input type="text" className="form-control" placeholder="Ej: 23" id="normaAnio" name="normaAnio" pattern="[0-9]*"
                    onChange={e => handleFormChange(e)} value={form.normaAnio} disabled={validaGEDO} maxlength="2" />
                </div>
                <div className="form-group">
                  <label for="idReparticion">Repartición *</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <select className="custom-select" id="idReparticion" name="idReparticion"
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
                              setReparticionesSeleccionadas([...reparticionesSeleccionadas, { reparticion: "", siglaReparticion: "" }])
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
                                    value={(reparticionesSeleccionadas[index]?.siglaReparticion !== "") ? (reparticionesSeleccionadas[index].siglaReparticion) : -1} >
                                    {reparticionesCombo && (reparticionesCombo != []) ? (
                                      <>
                                        <option value={-1} selected disabled>Seleccione una reparticion</option>
                                        {reparticionesCombo.map((p, index) => (
                                          <option value={p.siglaReparticion} key={'opt-repa-conjunta-' + index}>{p.reparticion}</option>
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
                  <label for="organismoEmisor">Organismo Emisor *</label>
                  <div id="autocomplete">
                    <div className="dropdown-container" >
                      <div className="dropdown">
                        <input className="form-control buscador" value={autocompleteValue ? autocompleteValue : ''}
                          onChange={e => filtrarValores(e.target.value)}
                          data-toggle="dropdown" disabled={validaGEDO} />
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
                      <label for="fechaDesde">Fecha Desde *</label>
                      <input
                        type="date"
                        className={"form-control " + String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaDesde))
                          || moment(form.fechaDesde).day() === 6 || moment(form.fechaDesde).day() === 0 ? " is-invalid" : " ")}
                        id="fechaDesde"
                        name="fechaDesde"
                        aria-describedby="date-help"
                        onChange={e => handleFormChange(e)} value={form.fechaDesde || ''}
                        min={
                          JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 ? 
                            moment().day() === 5
                              ? moment().add(3, 'day').format('YYYY-MM-DD')
                              : moment().day() === 6
                                ? moment().add(2, 'day').format('YYYY-MM-DD')
                                : moment().format('YYYY-MM-DD')
                            : moment().hours() < 15 // simples mortales
                              ? moment().day() === 5
                                ? moment().add(3, 'day').format('YYYY-MM-DD')
                                : moment().add(1, 'day').format('YYYY-MM-DD')
                              : moment().day() === 5
                                ? moment().add(4, 'day').format('YYYY-MM-DD')
                                : moment().add(2, 'day').format('YYYY-MM-DD')
                        }
                      />
                      <div class="invalid-feedback"><font size="1">La Fecha Desde no puede corresponderse con un fin de semana o feriado</font></div>
                    </div>
                    <div className="form-group sinmargeninferior">
                      <label for="fechaHasta">Fecha Hasta *</label>{/* console.log(moment(form.fechaHasta).day()) */}
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
                      <label for="fechaSugerida">Fecha Sugerida *</label>
                      <input
                        type="date"
                        className={"form-control " +
                          String((feriados.map(n => moment(n['DATE(feriadoFecha)']).format("YYYY-MM-DD")).includes(form.fechaSugerida))
                            || moment(form.fechaSugerida).day() === 6 || moment(form.fechaSugerida).day() === 0 ? " is-invalid" : " ")}
                        id="fechaSugerida"
                        name="fechaSugerida"
                        aria-describedby="date-help"
                        onChange={e => handleFormChange(e)} value={form.fechaSugerida || ''}
                        min={
                          JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 ? 
                            moment().day() === 5
                              ? moment().add(3, 'day').format('YYYY-MM-DD')
                              : moment().day() === 6
                                ? moment().add(2, 'day').format('YYYY-MM-DD')
                                : moment().format('YYYY-MM-DD')
                            : moment().hours() < 15 // simples mortales
                              ? moment().day() === 5
                                ? moment().add(3, 'day').format('YYYY-MM-DD')
                                : moment().add(1, 'day').format('YYYY-MM-DD')
                              : moment().day() === 5
                                ? moment().add(4, 'day').format('YYYY-MM-DD')
                                : moment().add(2, 'day').format('YYYY-MM-DD')
                        }
                      />
                      <div class="invalid-feedback"><font size="1">La Fecha Sugerida no puede corresponderse con un fin de semana o feriado</font></div>
                    </div>
                    <div className="form-group sinmargeninferior">
                      <label for="fechaLimite">Fecha Límite *</label>
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
                      (documento.name && documento.name != undefined) ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ marginRight: "10px" }}>{documento.name}</div>
                          {!validaGEDO && <FaTimes color='#C93B3B' cursor="pointer" onClick={(e) => cancelarCargaArchivo(e, documento.name, 'documento')} />}
                          {documento.esGEDO === true ? (<div className="badge badge-success">Doc. GEDO</div>) : ('')}
                        </div>
                      ) : ("No se ingresó ningún documento")
                    }
                  </div>
                  <hr />
                  <div style={{ maxHeight: "120px", maxWidth: "480px", overflowY: "auto" }}>
                    {
                      (anexos && anexos.length > 0) ? (getNombresAnexos()) : ("No se ingresaron anexos")
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
                  <button type="submit" className="btn btn-primary" disabled={!validaForm} id="ingresar-solicitud">Ingresar Solicitud</button>
                </div>
              </>
              }
            </form>
          </div>
          <div class="alert-wrapper mt-3" hidden={!errorIngresarSolicitud}>
            <div class="alert alert-danger" role="alert">
              <p>{mensajeErrorIngresarSolicitud}</p>
            </div>
          </div>
        </div >
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

export default AltaSolicitudBO;
