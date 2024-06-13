import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasBO } from '../../routes';
import { FaCheck, FaEdit, FaTimes, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

const BMSeccion = props => {
  const navigate = useNavigate();

  const { idSeccion } = useParams();

  const [isLoading, setLoading] = useState(false)
  const [secciones, setSecciones] = useState([])
  const [borrar, setBorrar] = useState(null)
  const [error, setError] = useState()
  if (error) throw error

  const initForm = {
     seccion: null,
     seccionSigla: null,
     es_poder: false
  }


  const [showModal, setShowModal] = useState(false)
  const [habilitarEdicion, setHabilitarEdicion] = useState(false)
  const [formEdicion, setFormEdicion] = useState({
    idSeccion: null,
    seccion: "",
    seccionSigla: "",
    seccionOrden: "",
    es_poder: null
  })

  const [form, setForm] = useState(initForm)



  const handleFormChange = (e) => {
    let valores = e.target.value;
    switch (e.target.name) {
      case 'seccion':
        setForm({ ...form, ['seccion']: valores })
        break;
      case 'seccionSigla':
        setForm({ ...form, ['seccionSigla']: valores })
        break;
      case 'seccionOrden':
        setForm({ ...form, ['seccionOrden']: valores })
        break;
      case 'es_poder':
        setForm({ ...form, ['es_poder']: e.target.checked })
        break;
    }
  }

  const handleFormEdicion = (e) => {
    let value = e.target.value;
    switch (e.target.name) {
      case 'seccion':
        setFormEdicion({ ...formEdicion, seccion: value })
        break;
      case 'seccionSigla':
        setFormEdicion({ ...formEdicion, seccionSigla: value })
        break;
      case 'es_poder':
        setFormEdicion({ ...formEdicion, es_poder: e.target.checked })
        break;
    }
  }


  async function edicion(e, elem) {
    e.preventDefault();
    setFormEdicion({
      idSeccion: elem.idSeccion,
      seccion: elem.seccion,
      seccionSigla: elem.seccionSigla,
      seccionOrden: elem.seccionOrden,
      es_poder: elem.es_poder
    })
    if (habilitarEdicion) {
      setFormEdicion({ idSeccion: null, seccion: "", seccionSigla: "", seccionOrden: "", es_poder: null })
    }
    setHabilitarEdicion(!habilitarEdicion)
  }

  async function guardarEdicion(e, id) {
    e.preventDefault();
    setLoading(true)
    let body = {
      idSeccion: formEdicion.idSeccion,
      seccion: formEdicion.seccion,
      seccionSigla: formEdicion.seccionSigla,
      seccionOrden: formEdicion.seccionOrden,
      es_poder: formEdicion.es_poder
    }
    await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/seccion/actualizar', body, localStorage.getItem("token"))
      .then(() => {
        getSecciones()
        setHabilitarEdicion(false)
      })
      .catch(() => {

      })
      .finally(() => {
        setLoading(false)
      })

  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
      seccion: form.seccion,
      seccionSigla: form.seccionSigla,
      seccionOrden: form.seccionOrden,
      es_poder: form.es_poder
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/seccion/crear', body, token)
        .then(_ => {
          getSecciones()
        })
        .catch((err) => {
          throw err
        })
        setLoading(false)
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/seccion/borrar', body, token)
        .then(_ => {
          navigate(`${rutasBO.home}/${rutasBO.bm_seccion.replace(':idSeccion', idSeccion)}`)
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

  const getSecciones = async () => {

    let body = {
      idSeccion: props.idSeccion
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinGet('/api/v1/boletin-oficial/sumario/secciones', body, token).then((res) => {
        setSecciones(res.data.data);
      }).catch(function (error) {
        throw error
      });

    }
    catch (error) {
      throw error
    }
  }

  const borrarSeccion = async (e, idSeccion) => {
    e.preventDefault();
    setLoading(true)
    let token = localStorage.getItem("token");
    let body = {
      idSeccion: idSeccion
    }
    await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/seccion/borrar', body, token)
      .then(_ => {
        setShowModal(false);
        getSecciones();
      })
      .catch()

    setLoading(false)
  }


  //Hook inicial
  /* useEffect(async () => {
    setLoading(true)
    await getCrear()
    setLoading(false)
  }, []) */

console.log(form)
  useEffect(async () => {
    await getSecciones().catch(e => setError(e.data.mensaje))
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="container responsive mb-5" id="abrogacion-expresa">
          <div>
            <div id="accordion">
              <div class="accordion-wrapper">
                <div class="accordion">
                  <div class="card">
                    <button
                      type="button"
                      class="card-header collapsed card-link"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                    >
                      Nuevo Sección
                    </button>
                    <div id="collapseOne" class="collapse" data-parent="#accordion">
                      <div class="card-body">
                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmitCreate(e)}>
                          <div class="form-group" style={{ width: "60%" }}>
                            <label for="seccion">Sección</label>
                            <input
                              type="text"
                              className="form-control"
                              id="seccion"
                              name="seccion"
                              value={form.seccion}
                              onChange={e => handleFormChange(e)}
                            />
                          </div>
                          <div class="form-group ml-5">
                            <label for="seccionSigla">Sigla</label>
                            <input
                              type="text"
                              className="form-control"
                              id="seccionSigla"
                              name="seccionSigla"
                              value={form.seccionSigla}
                              onChange={e => handleFormChange(e)}
                            />
                          </div>
                          <div class="custom-control custom-checkbox ml-5">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="es_poder_new"
                              name="es_poder"
                              checked={form.es_poder}
                              onChange={e => handleFormChange(e)}
                            />
                            <label for="es_poder_new" class="custom-control-label">Es poder</label>
                          </div>
                          {/* <div class="form-group ml-5">
                            <label for="seccionOrden">Orden</label>
                            <input
                              type="text"
                              className="form-control"
                              id="seccionOrden"
                              name="seccionOrden"
                              value={form.seccionOrden}
                              onChange={e => handleFormChange(e)}
                            />
                          </div> */}
                          <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <h3>Secciones:</h3> */}
            <form className="form" onSubmit={e => handleSubmit(e)}>
              {secciones.length > 0 &&
                <table class="table table-bordered table-hover" >
                  <thead>
                    <tr>
                      <th>Secciones</th>
                      <th>Sigla</th>
                      <th>Es poder</th>
                      <th></th>
                      {habilitarEdicion && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {secciones.map(n => (
                      <tr>
                        {habilitarEdicion && formEdicion.idSeccion === n.idSeccion ? <>
                          <td><input type="text" className="form-control" name="seccion" id="seccion"
                            value={formEdicion.seccion} onChange={(e) => handleFormEdicion(e)} />
                          </td>
                          <td><input type="text" className="form-control" name="seccionSigla" id="seccionSigla"
                            value={formEdicion.seccionSigla} onChange={(e) => handleFormEdicion(e)} />
                          </td>
                          <td><input type="checkbox" className="custom-checkbox" name="es_poder" id="es_poder"
                            checked={formEdicion.es_poder} onChange={(e) => handleFormEdicion(e)} />
                          </td>
                        </>
                          : <>
                            <td>{n.seccion}</td>
                            <td>{n.seccionSigla}</td>
                            <td>{n.es_poder ? <FaCheck /> : "-"}</td>
                          </>}
                        {habilitarEdicion && formEdicion.idSeccion === n.idSeccion &&
                          <td>
                            <button type="button" className="btn btn-primary btn-sm mr-2"
                              onClick={(e) => guardarEdicion(e, n.idSeccion)}>
                              <FaCheck />
                            </button>
                          </td>}
                        {habilitarEdicion && !(formEdicion.idSeccion === n.idSeccion) &&
                          <td></td>}
                        <td>
                          <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, n)}>
                            <FaEdit />
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => { setBorrar(n.idSeccion); setShowModal(true) }}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
              <br />
            </form>
          </div>
        </div >
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>Está seguro que desea eliminar esta seccion?</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <button className="btn btn-link" onClick={() => setShowModal(false)}>
              Volver
            </button>
            <button className="btn btn-danger" onClick={(e) => borrarSeccion(e, borrar)}>
              Confirmar
            </button>
          </Modal.Footer>
        </Modal>

      </>
    )
  }

}

export default BMSeccion;