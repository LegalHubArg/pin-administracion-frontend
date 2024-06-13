import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import moment from "moment";
import "./Formularios.css";
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import { ModalBuscador } from '../../Components/Modales/ModalBuscadorDigesto';
import { getCausales, getNormaSubtipos } from '../../Helpers/consultas';
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasSDIN } from '../../routes';
import { getPatologiasNormativas, getTiposAbrogacion } from '../../Helpers/consultas';
import { decode } from 'html-entities';
import { Modal } from 'react-bootstrap';

const PerdidaVigenciaJuridica = props => {
  const navigate = useNavigate();
  const { idNormaSDIN } = useParams();

  const [norma, setNorma] = useState({})
  const [normaActiva, setNormaActiva] = useState({})
  const [isLoading, setLoading] = useState(false)
  const [tiposAbrogacion, setTiposAbrogacion] = useState([])
  const [causales, setCausales] = useState(false)
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })

  const initForm = {
    fundamentacionJuridica: null,
    solucionAdoptada: null,
    detallesActiva: [],
    detallesPasiva: [],
    observaciones: null,
    idAbrogacionTipoPasiva: null,
    idAbrogacionTipoActiva: null,
    idNormaActiva: null,
    fechaInicioVigencia: null,
    fechaPerdidaVigencia: null,
    idCausal: null
  }

  const [form, setForm] = useState(initForm)

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'idCausal':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({ ...form, ['idCausal']: value })
        break;
      case 'idAbrogacionTipoActiva':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({ ...form, ['idAbrogacionTipoActiva']: value })
        break;
      case 'idAbrogacionTipoPasiva':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = null
        }
        setForm({ ...form, ['idAbrogacionTipoPasiva']: value })
        break;
      case 'observaciones':
        value = e.target.value;
        setForm({ ...form, ['observaciones']: value })
        break;
      case 'fundamentacionJuridica':
        value = e.target.value;
        setForm({ ...form, ['fundamentacionJuridica']: value })
        break;
      case 'idNormaActiva':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setForm({ ...form, ['idNormaActiva']: value })
        break;
      case 'fechaInicioVigencia':
        value = e.target.value;
        setForm({ ...form, ['fechaInicioVigencia']: value })
        break;
      case 'fechaPerdidaVigencia':
        value = e.target.value;
        setForm({ ...form, ['fechaPerdidaVigencia']: value })
        break;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      ...form,
      idNormaActiva: normaActiva.idNormaSDIN ? normaActiva.idNormaSDIN : null,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario3/guardar', body, token)
        .then(_ => {
          navigate(`${rutasSDIN.home}/${rutasSDIN.ficha_norma.replace(':idNormaSDIN', idNormaSDIN)}`, {state: {tab: "Analisis Epistemologico"}})
        })
    }
    catch (error) {
      setModalError({ show: true, mensaje: error.data.mensaje ? error.data.mensaje : 'Ocurrió un error al guardar el formulario.' })
      setLoading(false)
    }
  }

  const getNorma = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma', body, token)
        .then(res => {
          setNorma(res.data.norma[0]);
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      //console.log(e)
    }
  }

  const getFormulario3 = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      const formulario = await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario3', body, token)
        .catch((err) => {
          throw err
        });
      if (formulario.data.data.length === 1) {
        const data = formulario.data.data[0];
        setForm({
          idCausal: data.idCausal,
          fundamentacionJuridica: data.fundamentacionJuridica,
          detallesActiva: data.detallesActiva,
          detallesPasiva: data.detallesPasiva,
          fechaInicioVigencia: data.fechaInicioVigencia,
          fechaPerdidaVigencia: data.fechaPerdidaVigencia,
          observaciones: data.observaciones,
          idAbrogacionTipoPasiva: data.idAbrogacionTipoPasiva,
          idAbrogacionTipoActiva: data.idAbrogacionTipoActiva,
          idNormaActiva: data.idNormaActiva
        });
        let body2 = {
          usuario: localStorage.getItem('user_cuit'),
          idNormaSDIN: data.idNormaActiva,
          idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        await ApiPinPost('/api/v1/sdin/norma', body2, token)
          .then(res => {
            setNormaActiva(res.data.norma[0]);
          })
          .catch((err) => {
            throw err
          })
      }
    }
    catch (e) {
      //console.log(e)
    }
  }


  //Hook inicial
  useEffect(async () => {
    setLoading(true)
    const causales = await getCausales().catch(err => { })
    setCausales([...causales])
    const tiposAbrogacion = await getTiposAbrogacion().catch(err => { })
    setTiposAbrogacion([...tiposAbrogacion])
    await getNorma()
    await getFormulario3()
    setLoading(false)
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="container responsive mb-5" id="perdida-vigencia-juridica">
          <h3>Norma:</h3>
          <div className="card">
            <div className="card-body formulario-asiento">
              <div className="form-group">
                <label for="asiento">idNorma</label>
                <input className="form-control" id="idNorma" name="idNorma"
                  onChange={e => handleFormChange(e)} value={norma.idNormaSDIN} disabled />
              </div>
              <div className="form-group">
                <label for="tipo">Tipo</label>
                <input className="form-control" id="tipo" name="tipo" disabled value={decode(norma.normaTipo)} />
              </div>
              <div className="form-group">
                <label for="normaNumero">Número</label>
                <input className="form-control" id="normaNumero" name="normaNumero" disabled value={norma.normaNumero} />
              </div>
              <div className="form-group">
                <label for="normaAnio">Año</label>
                <input className="form-control" id="normaAnio" name="normaAnio" disabled value={norma.normaAnio} />
              </div>
              <div className="form-group">
                <label for="fechaSancion">Fecha Sanción</label>
                <input className="form-control" id="fechaSancion" name="fechaSancion" disabled value={norma.fechaSancion ? moment(norma.fechaSancion).format("DD/MM/YYYY") : ""} />
              </div>
              <div className="form-group rama">
                <label for="rama">Rama</label>
                <input className="form-control" id="rama" name="rama" disabled value={norma.rama} />
              </div>
              <div className="form-group organismo">
                <label for="rama">Organismo</label>
                <input className="form-control" id="organismo" name="organismo" disabled value={decode(norma.organismo)} />
              </div>
            </div>
          </div>
          <br />
          <form className="form" onSubmit={e => handleSubmit(e)}>
            <div className="d-flex justify-content-between">
              <h4>Abrogación/Derogación</h4>
              {tiposAbrogacion && tiposAbrogacion.map((elem) =>
                <div class="custom-control custom-radio">
                  <input
                    className="custom-control-input"
                    type="radio"
                    name="idAbrogacionTipoPasiva"
                    value={elem.idAbrogacionTipo}
                    id={elem.nombre + "-pasiva"}
                    checked={form.idAbrogacionTipoPasiva === elem.idAbrogacionTipo}
                    onChange={(e) => handleFormChange(e)}
                  />
                  <label class="custom-control-label" for={elem.nombre + "-pasiva"}>
                    {elem.nombre}
                  </label>
                </div>
              )}
              <button type="button" className="btn btn-success btn-sm"
                onClick={() => setForm({ ...form, ['detallesPasiva']: [...form.detallesPasiva, { detalle: '', esAnexo: false }] })}>
                Agregar Detalle <FaPlus />
              </button>
            </div>
            {form.detallesPasiva && form.detallesPasiva.map((elem, index) => (
              <div className="form-group mt-2">
                <label for={"detalle-pasiva-" + (index + 1)}
                  className="d-flex justify-content-between">
                  Detalle
                  <div>
                    <input type="checkbox" checked={elem.esAnexo} className="custom-checkbox m-1" id={"check-pasiva-anexo-" + (index + 1)}
                      onChange={e => { let aux = form.detallesPasiva; aux[index].esAnexo = e.target.checked; setForm({ ...form, ['detallesPasiva']: [...aux] }) }}
                    />
                    <label for={"check-pasiva-anexo-" + (index + 1)}>Es anexo</label>
                    <button type="button" className="btn btn-danger btn-sm ml-5"
                      onClick={() => { let aux = form.detallesPasiva; aux.splice(index, 1); setForm({ ...form, ['detallesPasiva']: [...aux] }) }}>
                      x
                    </button>
                  </div>
                </label>
                <textarea className="form-control" id={"detalle-pasiva-" + (index + 1)}
                  name={"detalle-pasiva-" + (index + 1)} rows="2"
                  onChange={e => { let aux = form.detallesPasiva; aux[index].detalle = e.target.value; setForm({ ...form, ['detallesPasiva']: [...aux] }) }}
                  value={elem.detalle}
                />
              </div>
            ))}
            <hr className="mt-5 mb-5" />
            <h3>Norma Involucrada:</h3>
            <div className="card">
              <div className="card-body formulario-asiento">
                <div className="form-group buscar">
                  <label for="asiento">idNorma</label>
                  <div className="d-flex align-items-stretch">
                    <input className="form-control" id="idNorma" name="idNorma"
                      onChange={e => handleFormChange(e)} value={normaActiva.idNormaSDIN} />
                    <ModalBuscador setNormaActiva={setNormaActiva} />
                  </div>
                </div>
                <div className="form-group">
                  <label for="tipo">Tipo</label>
                  <input className="form-control" id="tipo" name="tipo" disabled value={decode(normaActiva.normaTipo) || ''} />
                </div>
                <div className="form-group">
                  <label for="normaNumero">Número</label>
                  <input className="form-control" id="normaNumero" name="normaNumero" disabled value={normaActiva.normaNumero || ''} />
                </div>
                <div className="form-group">
                  <label for="normaAnio">Año</label>
                  <input className="form-control" id="normaAnio" name="normaAnio" disabled value={normaActiva.normaAnio || ''} />
                </div>
                <div className="form-group">
                  <label for="fechaSancion">Fecha Sanción</label>
                  <input className="form-control" id="fechaSancion" name="fechaSancion" disabled
                    value={normaActiva.fechaSancion ? moment(normaActiva.fechaSancion).format("DD/MM/YYYY") : ''} />
                </div>
                <div className="form-group rama">
                  <label for="rama">Rama</label>
                  <input className="form-control" id="rama" name="rama" disabled value={normaActiva.rama} />
                </div>
                <div className="form-group organismo">
                  <label for="rama">Organismo</label>
                  <input className="form-control" id="organismo" name="organismo" disabled value={decode(normaActiva.organismo) || ''} />
                </div>
                {normaActiva && Object.values(normaActiva).length > 0 &&
                  <button className="btn btn-sm btn-danger borrar-norma-activa" type="button" onClick={() => setNormaActiva({})}><FaTrashAlt /></button>}
              </div>
            </div>
            <br />
            <div className="d-flex justify-content-between">
              <h4>Abrogación/Derogación</h4>
              {tiposAbrogacion && tiposAbrogacion.map((elem) =>
                <div class="custom-control custom-radio">
                  <input
                    className="custom-control-input"
                    type="radio"
                    name="idAbrogacionTipoActiva"
                    id={elem.nombre + "-activa"}
                    value={elem.idAbrogacionTipo}
                    checked={form.idAbrogacionTipoActiva === elem.idAbrogacionTipo}
                    onChange={(e) => handleFormChange(e)}
                  />
                  <label class="custom-control-label" for={elem.nombre + "-activa"}>
                    {elem.nombre}
                  </label>
                </div>
              )}
              <button type="button" className="btn btn-success btn-sm"
                onClick={() => setForm({ ...form, ['detallesActiva']: [...form.detallesActiva, { detalle: '', esAnexo: false }] })}>
                Agregar Detalle <FaPlus />
              </button>
            </div>
            {form.detallesActiva && form.detallesActiva.map((elem, index) => (
              <div className="form-group mt-2">
                <label for={"detalle-activa-" + (index + 1)}
                  className="d-flex justify-content-between">
                  Detalle
                  <div>
                    <input type="checkbox" checked={elem.esAnexo} className="custom-checkbox m-1" id={"check-activa-anexo-" + (index + 1)}
                      onChange={e => { let aux = form.detallesActiva; aux[index].esAnexo = e.target.checked; setForm({ ...form, ['detallesActiva']: [...aux] }) }}
                    />
                    <label for={"check-activa-anexo-" + (index + 1)}>Es anexo</label>
                    <button type="button" className="btn btn-danger btn-sm ml-5"
                      onClick={() => { let aux = form.detallesActiva; aux.splice(index, 1); setForm({ ...form, ['detallesActiva']: [...aux] }) }}>
                      x
                    </button>
                  </div>
                </label>
                <textarea className="form-control" id={"detalle-activa-" + (index + 1)}
                  name={"detalle-activa-" + (index + 1)} rows="2"
                  onChange={e => { let aux = form.detallesActiva; aux[index].detalle = e.target.value; setForm({ ...form, ['detallesActiva']: [...aux] }) }} value={elem.detalle}
                />
              </div>
            ))}
            <br />
            <div className="d-flex justify-content-between">
              <div className="form-group" style={{ width: "fit-content" }}>
                <label for="idCasual">Causal</label>
                <select className="custom-select" id="idCausal" name="idCausal"
                  onChange={e => handleFormChange(e)} value={form.idCausal ? form.idCausal : -1}
                ><option hidden value={-1}></option>{causales && causales.length > 0 ?
                  causales.map((n) => (
                    <option selected value={n.idCausal}>{n.nombre}</option>
                  )) : <option selected hidden>No hay causales</option>}
                </select>
              </div>
              <div className="form-group">
                <label for="fechaInicioVigencia">Fecha de Inicio de Vigencia</label>
                <input type="date" className="form-control" id="fechaInicioVigencia" name="fechaInicioVigencia"
                  value={form.fechaInicioVigencia ? moment(form.fechaInicioVigencia).format("YYYY-MM-DD") : ""}
                  onChange={e => handleFormChange(e)} />
              </div>
              <div className="form-group">
                <label for="fechaPerdidaVigencia">Fecha de Pérdida de Vigencia</label>
                <input type="date" className="form-control" id="fechaPerdidaVigencia" name="fechaPerdidaVigencia"
                  value={form.fechaPerdidaVigencia ? moment(form.fechaPerdidaVigencia).format("YYYY-MM-DD") : ""}
                  onChange={e => handleFormChange(e)} />
              </div>
            </div>
            <div className="form-group">
              <label for="observaciones">Fundamentación jurídica</label>
              <textarea className="form-control" id="fundamentacionJuridica" name="fundamentacionJuridica" rows="4"
                onChange={e => handleFormChange(e)} value={form.fundamentacionJuridica}
              />
            </div>
            <div className="form-group">
              <label for="observaciones">Observaciones</label>
              <textarea className="form-control" id="observaciones" name="observaciones" rows="4"
                onChange={e => handleFormChange(e)} value={form.observaciones}
              />
            </div>
            <br />
            <button type="button" className="btn btn-secondary mr-2"
              onClick={() => navigate('/sdin/ficha-norma/' + norma.idNormaSDIN, { state: { tab: 'Analisis Epistemologico' } })}>
              Volver a Análisis Epistemológico
            </button>
            <button className="btn btn-primary">Guardar</button>
          </form>
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
    )
  }

}

export default PerdidaVigenciaJuridica;