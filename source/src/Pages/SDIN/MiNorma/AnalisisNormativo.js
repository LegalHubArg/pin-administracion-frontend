import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import moment from "moment";
//API PIN
import { ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { getNormaTipos } from '../../../Helpers/consultas';
//API PIN
import { ApiPinGet } from '../../../Helpers/ApiComunicator'
import { FaTimes } from 'react-icons/fa';
//HTML decode
import { decode } from 'html-entities';
import { Modal } from 'react-bootstrap';

const AnalisisNormativo = ({ norma }) => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false)
  const [anexos, setAnexos] = useState([])
  const [normaTipos, setNormaTipos] = useState([]);
  const [secciones, setSecciones] = useState([])
  const [gestiones, setGestiones] = useState([])
  const [clase, setClase] = useState([])
  const [reparticiones, setReparticiones] = useState(null);
  const [tiposPublicacion, setTiposPublicacion] = useState([])
  const [organismos, setOrganismos] = useState(null);
  const [dependencias, setDependencias] = useState(null);
  const [dependenciasBorradas, setDependenciasBorradas] = useState([]);
  const [dependenciasAgregadas, setDependenciasAgregadas] = useState([]);
  const [normaSubtipos, setNormaSubtipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })

  const initForm = {
    idNormaTipo: norma.idNormaTipo,
    idNormaSubtipo: norma.idNormaSubtipo,
    idReparticionOrganismo: norma.idOrganismo,
    idReparticion: norma.idDependencia,
    normaNumero: norma.normaNumero,
    numeroBO: norma.numeroBO,
    fechaPublicacion: moment(norma.fechaPublicacion).isValid() ? moment(norma.fechaPublicacion).format('YYYY-MM-DD') : null,
    fechaSancion: moment(norma.fechaSancion).isValid() ? moment(norma.fechaSancion).format('YYYY-MM-DD') : null,
    fechaRatificacion: moment(norma.fechaRatificacion).isValid() ? moment(norma.fechaRatificacion).format('YYYY-MM-DD') : null,
    fechaPromulgacion: moment(norma.fechaPromulgacion).isValid() ? moment(norma.fechaPromulgacion).format('YYYY-MM-DD') : null,
    idClase: norma.idClase,
    titulo: norma.titulo,
    normaSumario: norma.normaSumario,
    idTipoPublicacion: norma.idTipoPublicacion,
    idGestion: norma.idGestion,
    firmantes: norma.firmantes,
    linkPublicacionBO: norma.linkPublicacionBO,
    observaciones: norma.observaciones,
    generaTA: norma.generaTA,
    clausulaDerogatoria: norma.clausulaDerogatoria,
    clausulaDerogatoriaDescripcion: norma.clausulaDerogatoriaDescripcion,
    vigente: norma.vigente,
    vigenciaEspecial: norma.vigenciaEspecial,
    vigenciaEspecialDescripcion: norma.vigenciaEspecialDescripcion,
    alcance: norma.alcance,
    importadaBO: norma.importadaBO,
    normaAcronimoReferencia: norma.normaAcronimoReferencia,
    idSeccion: norma.idSeccion,
    normaAnio: norma.normaAnio, //moment(norma.fechaSancion).isValid() ? moment(norma.fechaSancion).format('YY') : null
    descriptores: norma.descriptores,
    fechaCarga: norma.fechaCarga,
    dependencias: norma.dependencias,
    checkDigesto: norma.checkDigesto,
    aprobadoNormativamente: norma.aprobadoNormativamente,
    temasGenerales: norma.temasGenerales,
    checkTA: norma.checkTA,
    numeroAD: norma.numeroAD,
    numeroCD: norma.numeroCD,
    plazoDeterminado: norma.plazoDeterminado
  }

  const [form, setForm] = useState(initForm);

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'idNorma':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({
          ...form,
          ['idNorma']: value
        })
        break;
      case 'alcance':
        value = e.target.value;
        setForm({
          ...form,
          ['alcance']: value
        })
        break;
      case 'vigente':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({
          ...form,
          ['vigente']: value
        })
        break;
      case 'normaNumero':
        if (e.target.validity.valid) {
          value = parseInt(e.target.value);
          if (isNaN(value)) {
            value = null
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
      case 'fechaPublicacion':
        value = e.target.value;
        if (!moment(value).isValid()) {
          setForm({
            ...form,
            ['fechaPublicacion']: null
          })
          break;
        }
        setForm({
          ...form,
          ['fechaPublicacion']: value
        })
        break;
      case 'fechaSancion':
        value = e.target.value;
        if (!moment(value).isValid()) {
          setForm({
            ...form,
            ['fechaSancion']: null
          })
          break;
        }
        setForm({
          ...form,
          ['fechaSancion']: value
        })
        break;
      case 'fechaPromulgacion':
        value = e.target.value;
        if (!moment(value).isValid()) {
          setForm({
            ...form,
            ['fechaPromulgacion']: null
          })
          break;
        }
        setForm({
          ...form,
          ['fechaPromulgacion']: value
        })
        break;
      case 'fechaRatificacion':
        value = e.target.value;
        if (!moment(value).isValid()) {
          setForm({
            ...form,
            ['fechaRatificacion']: null
          })
          break;
        }
        setForm({
          ...form,
          ['fechaRatificacion']: value
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
          ['idReparticionOrganismo']: value
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
          ['idReparticion']: value
        })
        break;
      case 'idNormaTipo':
        value = e.target.value;
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
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
          value = null
        }
        setForm({
          ...form,
          ['idNormaSubtipo']: value
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
      case 'temasGenerales':
        value = e.target.value;
        setForm({
          ...form,
          ['temasGenerales']: value
        })
        break;
      case 'idGestion':
        value = e.target.value;
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
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
          value = null
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
          value = null
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
          value = null
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
      case 'checkTA':
        value = e.target.checked;
        setForm({
          ...form,
          ['checkTA']: value
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
          value = null
        }
        setForm({
          ...form,
          ['idTipoPublicacion']: value
        })
        break;
      case 'checkDigesto':
        value = e.target.checked;
        setForm({
          ...form,
          ['checkDigesto']: value
        })
        break;
      case 'aprobadoNormativamente':
        value = e.target.checked;
        setForm({
          ...form,
          ['aprobadoNormativamente']: value
        })
        break;
      case 'dependencias':
        value = e.target.value;
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          break;
        }
        setForm({
          ...form,
          ['dependencias']: [...form.dependencias, { idDependencia: value, dependencia: dependencias.find(n => n.idDependencia === value).dependencia }]
        })
        setDependenciasAgregadas([...dependenciasAgregadas, value])
        break;
      case 'numeroBO':
        value = e.target.value;
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({
          ...form,
          ['numeroBO']: value
        })
        break;
      case 'firmantes':
        value = e.target.value;
        setForm({
          ...form,
          ['firmantes']: value
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
      case 'plazoDeterminado':
        value = e.target.checked;
        setForm({
          ...form,
          ['plazoDeterminado']: value
        })
        break;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    //Envío únicamente los metadatos que se modificaron
    let modificaciones = {};
    for (const [key, value] of Object.entries(form)) {
      if (['fechaPublicacion', 'fechaSancion', 'fechaRatificacion', 'fechaPromulgacion'].includes(key)) {
        if (moment(value).isSame(norma[key])) { continue }
      }
      if (key === 'dependencias') { continue };
      if (value === norma[key]) { continue };
      modificaciones[key] = value
    }

    let body = {
      metadatos: modificaciones,
      usuario: localStorage.getItem('user_cuit'),
      normas: [norma.idNormaSDIN],
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
      dependenciasBorradas,
      dependenciasAgregadas
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/normas/editar', body, token)
        .then(_ => {
          window.location.reload();
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      setModalError({ show: true, mensaje: e?.data?.mensaje })
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
        //console.log(error);
      });
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
      //console.log(error);
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

  const handleBorrarDependencias = (elem) => {
    setForm({
      ...form,
      ['dependencias']: [...form.dependencias.filter(n => n !== elem)]
    })
    let aux = [...dependenciasBorradas]
    aux.push(elem.idDependencia)
    setDependenciasBorradas(aux)
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

  //Hook inicial
  useEffect(async () => {
    await getOrganismos();
    await getDependencias();
    await getTiposPublicaciones();
    await getGestion();
    await getClase();
    const normaTiposArray = await ApiPinGet('/api/v1/sdin/normas/tipos', localStorage.getItem('token')).catch(err => { });
    setNormaTipos(normaTiposArray.data.data);
    const normaSubtiposArray = await ApiPinGet('/api/v1/sdin/normas/subtipos', localStorage.getItem('token')).catch(err => { });
    setNormaSubtipos(normaSubtiposArray.data.data)
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="card" id="analisis-normativo">
          <div className="card-body">
            <h4 className="card-title">
              DATOS BÁSICOS
            </h4>
            <hr />
            <form className="form" onSubmit={e => handleSubmit(e)}>
              <div className="form-group">
                <label for="idAlcance">Alcance</label>
                <select className="custom-select" id="alcance" name="alcance" onChange={e => handleFormChange(e)} value={(form.alcance != null) ? form.alcance : null}
                >
                  <option value={null}></option>
                  <option value={'X'}>N/A</option>
                  <option value={'G'}>General</option>
                  <option value={'P'}>Particular</option>
                  <option value={'M'}>Mixto</option>

                </select>
              </div>
              <div className="form-group">
                <label for="idNormaTipo">Tipo de Norma</label>
                <select className="custom-select" id="idNormaTipo" name="idNormaTipo" onChange={e => handleFormChange(e)}
                  value={(form.idNormaTipo != null) ? form.idNormaTipo : -1}>
                  <option value={-1}></option>
                  {normaTipos && (normaTipos.length > 0) ? (
                    normaTipos.map((p, index) => (
                      <option value={p.idNormaTipo} key={'opt-sec-' + index}>{decode(p.normaTipo)}</option>
                    ))

                  ) : (<option selected disabled>No hay tipos de normas para mostrar</option>)
                  }
                </select>
              </div>
              <div className="form-group">
                <label for="idNormaSubtipo">Subtipo de Norma</label>
                <select className="custom-select" id="idNormaSubtipo" name="idNormaSubtipo" onChange={e => handleFormChange(e)}
                  value={(form.idNormaSubtipo != null) ? form.idNormaSubtipo : -1} disabled>
                  <option value={-1}></option>
                  {normaSubtipos && (normaSubtipos.length > 0) ? (
                    normaSubtipos.map((p, index) => (
                      <option value={p.idNormaSubtipo} key={'opt-sec-' + index}>{p.normaSubtipo}</option>
                    ))

                  ) : (<option selected disabled>No hay subtipos de normas para mostrar</option>)
                  }
                </select>
              </div>
              <div className="form-group">
                <label for="vigente">Vigencia</label>
                <select className="custom-select" id="vigente" name="vigente" onChange={e => handleFormChange(e)} value={(form.vigente != null) ? form.vigente : -1}
                ><option value={0}>No vigente</option>
                  <option value={1}>Vigente</option>
                </select>
              </div>
              <div className="form-group">
                <label for="normaNumero">Número</label>
                <input type="text" className="form-control" id="normaNumero" name="normaNumero" pattern="[0-9]*"
                  onChange={e => handleFormChange(e)} value={form.normaNumero} />
              </div>
              <div className="form-group">
                <label for="normaAnio">Año</label>
                <input type="text" className="form-control" id="normaAnio" name="normaAnio"
                  onChange={e => handleFormChange(e)} value={form.normaAnio} />
              </div>
              <div className="form-group">
                <label for="normaAnio">Número de Boletín</label>
                <input type="text" className="form-control" id="numeroBO" name="numeroBO"
                  onChange={e => handleFormChange(e)} value={form.numeroBO} />
              </div>
              <div className="form-group titulo">
                <label for="">Título</label>
                <input type="text" className="form-control" id="titulo" name="titulo" onChange={e => handleFormChange(e)} value={form.titulo} />
              </div>
              <div className="form-group">
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" name="checkDigesto" id="checkDigesto"
                    checked={form.checkDigesto} onChange={e => handleFormChange(e)} />
                  <label for="checkDigesto" class="custom-control-label">Check Digesto</label>
                </div>
              </div>
              <div className="form-group fila">
                <label for="normaSumario">Síntesis</label>
                <textarea type="text" className="form-control" id="normaSumario" name="normaSumario"
                  onChange={e => handleFormChange(e)} value={decode(form.normaSumario)} />
              </div>
              <div className="form-group fila">
                <label for="temasGenerales">Temas Generales</label>
                <textarea type="text" className="form-control" id="temasGenerales" name="temasGenerales"
                  onChange={e => handleFormChange(e)} value={form.temasGenerales} />
              </div>
              <div className="form-group">
                <label for="idSeccion">Tipo Publicacion</label>
                <select className="custom-select" id="tipoPublicacion" name="tipoPublicacion"
                  onChange={e => handleFormChange(e)} value={(form.idTipoPublicacion != null) ? form.idTipoPublicacion : -1}
                ><option value={-1}></option>
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
                  onChange={e => handleFormChange(e)} value={form.fechaPublicacion !== null ? form.fechaPublicacion : ''}
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
                  onChange={e => handleFormChange(e)} value={form.fechaPromulgacion !== null ? form.fechaPromulgacion : ''}
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
                  onChange={e => handleFormChange(e)} value={form.fechaRatificacion !== null ? form.fechaRatificacion : ''}
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
                  onChange={e => handleFormChange(e)} value={form.fechaSancion !== null ? form.fechaSancion : ''}
                />
              </div>
              <div className="form-group">
                <label for="idSeccion">Gestion</label>
                <select className="custom-select" id="idGestion" name="idGestion" onChange={e => handleFormChange(e)}
                  value={(form.idGestion != null) ? form.idGestion : -1}
                ><option value={null}></option>
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
                  onChange={e => handleFormChange(e)} value={(form.idReparticionOrganismo != null) ? form.idReparticionOrganismo : -1}
                ><option value={-1}></option>
                  {organismos && (organismos.length > 0) ? (
                    organismos.map((p, index) => (
                      <option value={p.idOrganismo} key={'opt-sec-' + index}>{p.sigla} - {decode(p.organismo)}</option>
                    ))

                  ) : (<option selected disabled>No hay organismos para mostrar</option>)
                  }
                </select>
              </div>
              <div className="form-group">
                <label for="idDependencia">Dependencia</label>
                <select className="custom-select" id="idDependencia" name="idDependencia" onChange={e => handleFormChange(e)}
                  value={(form.idReparticion != null) ? form.idReparticion : -1}>
                  <option value={-1}></option>
                  {dependencias && (dependencias.length > 0) ? (
                    dependencias.map((p, index) => (
                      <option value={p.idDependencia} key={'opt-sec-' + index}>{p.sigla} - {decode(p.dependencia)}</option>
                    ))

                  ) : (<option selected disabled>No hay dependencias para mostrar</option>)
                  }
                </select>
              </div>
              <div className="form-group fila">
                <label for="">Firmantes</label>
                <input type="text" className="form-control" id="firmantes" name="firmantes"
                  onChange={e => handleFormChange(e)} value={decode(form.firmantes)} />
              </div>
              <div className="form-group">
                <label for="">Link Publicación BO</label>
                <input type="text" className="form-control" id="linkPublicacionBO" name="linkPublicacionBO"
                  onChange={e => handleFormChange(e)} value={form.linkPublicacionBO} />
              </div>
              <div className="form-group">
                <label for="">Dependencias</label>
                <select className="custom-select" id="dependencias" name="dependencias"
                  onChange={e => handleFormChange(e)} value={""}><option selected value="" hidden />
                  {dependencias && (dependencias.length > 0) ? (
                    dependencias.filter((org) => !(form?.dependencias?.includes(org.idDependencia))).map(
                      (p, index) => (
                        <option value={p.idDependencia} key={'opt-sec-' + index}>{p.sigla} - {p.dependencia}</option>
                      ))

                  ) : (<option selected disabled>No hay dependencias para mostrar</option>)
                  }
                </select>
              </div>
              <div className="card dependencias">
                {dependencias && form.dependencias && form.dependencias.map((elem) =>
                  <span className="badge badge-info">
                    {decode(elem.dependencia)}&nbsp;
                    <FaTimes color='#C93B3B' type='button'
                      onClick={() => handleBorrarDependencias(elem)} />
                  </span>
                )}
              </div>
              <div className="form-group">
                <label for="">Numero AD</label>
                <input type="text" className="form-control" id="numeroAD" name="numeroAD"
                  onChange={e => handleFormChange(e)} value={form.numeroAD} autoComplete="off" />
              </div>
              <div className="form-group">
                <label for="">Numero CD</label>
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
                <select className="custom-select" id="idClase" name="idClase" onChange={e => handleFormChange(e)}
                  value={(form.idClase != null) ? form.idClase : -1}>
                  <option selected value="" hidden></option>
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
                  <input type="checkbox" className="custom-control-input" name="generaTA" id="generaTA"
                    checked={form.generaTA} onChange={e => handleFormChange(e)} />
                  <label for="generaTA" className="custom-control-label">Genera TA</label>
                </div>
              </div>
              <div className="form-group">
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" name="clausulaDerogatoria" id="clausulaDerogatoria"
                    checked={form.clausulaDerogatoria} onChange={e => handleFormChange(e)} />
                  <label for="clausulaDerogatoria" className="custom-control-label">Clausula Derogatoria Indeterminada</label>
                </div>
              </div>
              <div class="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" name="vigenciaEspecial" id="vigenciaEspecial"
                  checked={form.vigenciaEspecial} onChange={e => handleFormChange(e)} />
                <label for="vigenciaEspecial" className="custom-control-label">Vigencia Especial</label>
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
                <textarea type="text" className="form-control" id="clausulaDerogatoriaDescripcion" name="clausulaDerogatoriaDescripcion"
                  onChange={e => handleFormChange(e)} value={form.clausulaDerogatoriaDescripcion} hidden={!form.clausulaDerogatoria} placeholder='Clausula derogatoria' />
              </div>
              <div className="form-group">
                <textarea type="text" className="form-control" id="vigenciaEspecialDescripcion" name="vigenciaEspecialDescripcion"
                  onChange={e => handleFormChange(e)} value={form.vigenciaEspecialDescripcion} hidden={!form.vigenciaEspecial} placeholder='Vigencia especial' />
              </div>
              <div className="form-group">
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" name="checkTA" id="checkTA"
                    checked={form.checkTA} onChange={e => handleFormChange(e)} />
                  <label for="checkTA" class="custom-control-label">TA</label>
                </div>
              </div>
              <button className="btn btn-success boton-guardar" type="submit" id="boton-buscar">Guardar cambios</button>
            </form>
          </div>
        </div >
        <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
          <Modal.Header className='d-flex justify-content-between'>Error<i type="button" className="bx bx-x" style={{ justifySelf: "end" }} onClick={_ => setModalError({ show: false, mensaje: '' })} /></Modal.Header>
          <Modal.Body>
            <div className="alert alert-danger">{modalError.mensaje}</div>
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

}

export default AnalisisNormativo;