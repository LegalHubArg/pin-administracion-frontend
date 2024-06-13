import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap';
import { ModalBuscador } from '../../../Components/Modales/ModalBuscadorDigesto';

//HTML decode
import { decode } from 'html-entities';
import { Pagination } from '@gcba/obelisco'


const Relaciones = ({ norma }) => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false)
  const [acciones, setAcciones] = useState([])
  const [relacionesDeLaNorma, setRelacionesDeLaNorma] = useState([])
  const [showModalEdicion, setShowModalEdicion] = useState(false)
  const [loadingModalEdicion, setLoadingModalEdicion] = useState(false)
  const [showModalEliminar, setShowModalEliminar] = useState(false)
  const [metaNormaActiva, setMetaNormaActiva] = useState({})
  const [totalResultados, setTotalResultados] = useState(null)

    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNormaSDIN',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

  const initForm = {
    idNormaDestino: null,
    idNormaOrigen: norma.idNormaSDIN,
    detalle: '',
    idRelacion: null
  }

  const [form, setForm] = useState(initForm);

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'idNormaDestino':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setForm({
          ...form,
          ['idNormaDestino']: value
        })
        break;
      case 'detalle':
        value = e.target.value;
        setForm({
          ...form,
          ['detalle']: value
        })
        break;
      case 'idRelacion':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setForm({ ...form, ['idRelacion']: value })
    }
  }

  const [formEdicion, setFormEdicion] = useState(initForm);

  const handleFormChangeEdicion = (e) => {
    let value;
    switch (e.target.name) {
      case 'idNormaDestino':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setFormEdicion({
          ...formEdicion,
          ['idNormaDestino']: value
        })
        break;
      case 'detalle':
        value = e.target.value;
        setFormEdicion({
          ...formEdicion,
          ['detalle']: value
        })
        break;
      case 'idRelacionEdicion':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setFormEdicion({ ...formEdicion, ['idRelacion']: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let body = {
      ...form,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/relaciones/crear', body, token)
        .then(_ => {
          setForm(initForm)
          traerRelacionesDeLaNorma()
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }
  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    setLoadingModalEdicion(true)
    let body = {
      ...formEdicion,
      usuario: localStorage.getItem('user_cuit'),
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/relaciones/editar', body, token)
        .then(_ => {
          setShowModalEdicion(false)
          setLoadingModalEdicion(false)
          traerRelacionesDeLaNorma()
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoadingModalEdicion(false)
      //console.log(e)
    }
  }

  const traerRelaciones = async () => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/relaciones', body, token)
        .then(res => {
          setLoading(false)
          setAcciones(res.data.relaciones)
          let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.total / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  useEffect(async () => {
    if (paginacion.cambiarPagina === true) {
        let auxPaginacion = paginacion;
        auxPaginacion.cambiarPagina = false;
        setPaginacion({ ...auxPaginacion })
        await traerRelaciones()
    }
}, [paginacion])

  const traerRelacionesDeLaNorma = async () => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/relaciones', body, token)
        .then(res => {
          setLoading(false);
          setRelacionesDeLaNorma(res.data.relaciones)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const eliminarRelacion = async (idNormasRelaciones) => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormasRelaciones: idNormasRelaciones,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/relaciones/eliminar', body, token)
        .then(_ => {
          setLoading(false);
          setShowModalEliminar(false);
          traerRelacionesDeLaNorma()
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  function setNormaPasivaEdicion(norma) {
    setForm({ ...formEdicion, idNormaPasiva: norma.idNormaSDIN })
  }

  useEffect(async () => {
    await traerRelaciones();
    await traerRelacionesDeLaNorma();
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="card" id="accordion">
          <div className="card-body">
            <h4>
              Relaciones de la Norma
            </h4>
            {relacionesDeLaNorma && relacionesDeLaNorma.length > 0 ? <table class="table table-bordered table-hover" >
              <thead>
                <tr>
                  <th scope="col">idRelacion</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Relacion</th>
                  <th scope="col">Detalle</th>
                  <th scope="col">Norma Relacionada</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {relacionesDeLaNorma.map((rel) => (
                  <tr>
                    <td>{rel.idNormasRelaciones}</td>
                    <td>{rel.tipo}</td>
                    <td>{rel.relacion}</td>
                    <td><div
                      dangerouslySetInnerHTML={{ __html: rel.detalle }}
                    /></td>
                    <td><Link to={'./../' + rel.idNormaDestino}>{decode(rel.normaTipo) + " " + rel.normaNumero + " " + rel.normaAnio}</Link></td>
                    <td>

                      {<>
                        <button className="btn btn-sm btn-link mr-2" title="Editar" onClick={() => { setShowModalEdicion(true); setFormEdicion(rel) }}><i className="bx bx-edit" /></button>
                        <button type="button" class="btn btn-danger btn-sm" onClick={() => setShowModalEliminar(true)}>
                          Eliminar
                        </button>
                        <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)} size="sm" centered>
                          <Modal.Header>
                            Está seguro que desea eliminar esta relación?
                          </Modal.Header>
                          <Modal.Footer>
                            <button type="button" className="btn btn-link" onClick={() => setShowModalEliminar(false)}>
                              Volver
                            </button>
                            <button type="submit" className="btn btn-danger" onClick={() => eliminarRelacion(rel.idNormasRelaciones)}>
                              Continuar
                            </button>
                          </Modal.Footer>
                        </Modal>
                      </>
                      }
                    </td>
                  </tr>

                ))}
              </tbody>
            </table> : "No se encontraron relaciones para esta norma..."}
            <div className="accordion mt-2" id="accordionNuevaNorma">
              <div className="card">
                <button
                  class="card-header collapsed card-link"
                  data-toggle="collapse"
                  data-target="#collapseNuevaRelacion"
                >
                  Nueva Relación
                </button>
                <div id="collapseNuevaRelacion" class="collapse" data-parent="#accordionNuevaNorma">
                  <form className="form card-body" onSubmit={e => handleSubmit(e)}>
                    <div className="row">
                      <div className="form-group col-4">
                        <label for="normaOrigen">Norma Origen</label>
                        <input type="text" className="form-control" id="normaOrigen" name="normaOrigen"
                          value={decode(norma.normaTipo) + " N° " + norma.normaNumero + " " + norma.normaAnio} disabled />
                      </div>
                      <div className="form-group col-5">
                        <label for="relaciones">Relación</label>
                        <select className="custom-select" id="idRelacion" name="idRelacion"
                          onChange={e => handleFormChange(e)} value={(form.idRelacion != null) ? form.idRelacion : -1} required
                        ><option selected value="" hidden></option>
                          {acciones && (acciones.length > 0) ? (
                            acciones.map((p, index) => (
                              <option value={p.idRelacion} key={'opt-sec-' + index}>{decode(p.relacion)}</option>
                            ))

                          ) : (<option selected disabled>No hay relaciones para mostrar</option>)
                          }
                        </select>
                      </div>
                      <div className="form-group d-flex col-3">
                        <div style={{ width: "90%" }}>
                          <label for="idNormaPasiva">Norma Destino (id)</label>
                          <input type="text" className="form-control" id="idNormaDestino" name="idNormaDestino" pattern="[0-9]*"
                            onChange={e => handleFormChange(e)} value={form.idNormaDestino} required />
                        </div>
                        <div style={{ alignSelf: "center" }}>
                          {/* el nombre del setter es setNormaActiva porque el componente se pensó para los formularios de digesto */}
                          <ModalBuscador setNormaActiva={e => setForm({ ...form, idNormaDestino: e.idNormaSDIN })} /></div>
                      </div>
                    </div>
                    <div className="form-group texto3">
                      <label for="articuloPasiva">Detalle</label>
                      <textarea className="form-control" id="detalle" name="detalle"
                        onChange={e => handleFormChange(e)} value={form.detalle} />
                    </div>
                    <br />
                    <button className="btn btn-success" type="submit" id="boton-guardar">Guardar</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <Modal show={showModalEdicion} onHide={() => setShowModalEdicion(false)} size="lg">
            <form className="form tab" onSubmit={e => handleSubmitEdicion(e)}>
              <Modal.Header>
                <Modal.Title>Editar</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {loadingModalEdicion ? <Spinner /> :
                  <>
                    <div className="row">
                      <div className="form-group col-4">
                        <label for="normaOrigen">Norma Origen</label>
                        <input type="text" className="form-control" id="normaOrigen" name="normaOrigen"
                          value={decode(norma.normaTipo) + " N° " + norma.normaNumero + " " + norma.normaAnio} disabled />
                      </div>
                      <div className="form-group col-5">
                        <label for="idRelacionEdicion">Relación</label>
                        <select className="custom-select" id="idRelacionEdicion" name="idRelacionEdicion"
                          onChange={e => handleFormChangeEdicion(e)} value={(formEdicion.idRelacion != null) ? formEdicion.idRelacion : -1} required
                        ><option selected value="" hidden></option>
                          {acciones && (acciones.length > 0) ? (
                            acciones.map((p, index) => (
                              <option value={p.idRelacion} key={'opt-sec-' + index}>{p.relacion}</option>
                            ))

                          ) : (<option selected disabled>No hay relaciones para mostrar</option>)
                          }
                        </select>
                      </div>
                      <div className="form-group col-3">
                        <label for="idNormaPasivaEdicion">Norma Destino</label>
                        <input type="text" className="form-control" id="idNormaDestinoEdicion" name="idNormaDestinoEdicion" pattern="[0-9]*"
                          value={formEdicion.idNormaDestino} readOnly />
                      </div>
                    </div>
                    <div className="form-group texto3">
                      <label for="articuloPasivaEdicion">Detalle</label>
                      <textarea className="form-control" id="detalle" name="detalle"
                        onChange={e => handleFormChangeEdicion(e)} value={formEdicion.detalle} />
                    </div>
                    <br />
                  </>}
              </Modal.Body>
              <Modal.Footer>
                <button type="button" className="btn btn-link" onClick={() => setShowModalEdicion(false)} disabled={loadingModalEdicion}>
                  Volver
                </button>
                <button type="submit" className="btn btn-success" disabled={loadingModalEdicion}>
                  Confirmar
                </button>
              </Modal.Footer>
            </form>
          </Modal>
        </div>
      </>
    )
  }

}

export default Relaciones;