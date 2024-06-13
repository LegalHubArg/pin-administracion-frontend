import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap'

const Front = props => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false)
  const [isLoadingPublicacion, setLoadingPublicacion] = useState(false)
  const [show, setShow] = useState(false)
  const [errorPublicacion, setErrorPublicacion] = useState({show:false, mensaje: ''})
  const [operacionCompletada, setOperacionCompletada] = useState(false)
  const [borradoCorrectamente, setBorradoCorrectamente] = useState(false)
  const [showConfirmacion, setShowConfirmacion] = useState(false)

  const initForm = {
    mostrarTA: (props.norma?.mostrarTA !== null && props.norma?.mostrarTA !== undefined) ? !!props.norma.mostrarTA : true,
    mostrarTC: (props.norma?.mostrarTC !== null && props.norma?.mostrarTC !== undefined) ? !!props.norma.mostrarTC : true,
    mostrarRamaTema: (props.norma?.mostrarRamaTema !== null && props.norma?.mostrarRamaTema !== undefined) ? !!props.norma.mostrarRamaTema : true
  }

  const initAux = {
    mostrarTA: initForm?.mostrarTA ? 1 : 0,
    mostrarTC: initForm?.mostrarTC ? 1 : 0,
    mostrarRamaTema: initForm?.mostrarRamaTema ? 1 : 0
  }

  const [form, setForm] = useState(initForm);
  const [aux, setAux] = useState(initAux);

  const handleFormChange = (e) => {
    switch (e.target.name) {
      case 'mostrarTA':
        setForm({ ...form, mostrarTA: e.target.checked })
        break;
      case 'mostrarTC':
        setForm({ ...form, mostrarTC: e.target.checked })
        break;
      case 'mostrarRamaTema':
        setForm({ ...form, mostrarRamaTema: e.target.checked })
        break;
    }
  }
  
  const handleAuxChange = (e) => {

    const name = e.target.name;
    const checked = e.target.checked;
  
    setForm({ ...form, [name]: checked });
  
    if (checked) {
      setAux({ ...aux, [name]: 1 });
    } else {
      setAux({ ...aux, [name]: 0 });
    }

  }

  const publicarNorma = async () => {
    setLoadingPublicacion(true)
    try {
      let body = {
        idNormaSDIN: props.norma?.idNormaSDIN,
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem('user_cuit'),
        ...aux
      }
      await ApiPinPost('/api/v1/sdin/norma/publicar', body, localStorage.getItem('token'))
      setLoadingPublicacion(false)
      setShow(false)
      setOperacionCompletada(true)
      window.location.reload()
    }
    catch (e) {
      let mensajeError = e?.data?.mensaje ? e.data.mensaje : "Ocurrió un error al intentar publicar la norma."
      setErrorPublicacion({show:true, mensaje: mensajeError})
      setLoadingPublicacion(false)
    }
  }
  const borrarPublicacion = async () => {
    try {
      let body = {
        idNormaSDIN: props.norma?.idNormaSDIN,
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem('user_cuit')
      }
      await ApiPinPost('/api/v1/sdin/norma/borrar-publicacion', body, localStorage.getItem('token'))
      setShowConfirmacion(false)
      setBorradoCorrectamente(true)
      window.location.reload()
    }
    catch (e) {
    }
  }

  useEffect(() => {
    if (!show && errorPublicacion) {
      setErrorPublicacion({show:false, mensaje: ''})
    }
  }, [show])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="card" id="accordion">
          <div className="card-body">
            <h4 className="card-title">
              OPCIONES FRONT
            </h4>
            <div className="card-body">
              <div className="form d-flex justify-content-around mb-5">
                <div className="form-group">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="mostrarTA" id="mostrarTA" 
                      checked={form.mostrarTA} 
                      onChange={(e) => handleAuxChange(e)}
                    />
                    <label for="mostrarTA" class="custom-control-label">Mostrar Texto Actualizado</label>
                  </div>
                </div>
                <div className="form-group">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="mostrarTC" id="mostrarTC" 
                      checked={form.mostrarTC} 
                      onChange={(e) => handleAuxChange(e)}
                    />
                    <label for="mostrarTC" class="custom-control-label">Mostrar TC</label>
                  </div>
                </div>
                <div className="form-group">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="mostrarRamaTema" id="mostrarRamaTema" 
                      checked={form.mostrarRamaTema} 
                      onChange={(e) => handleAuxChange(e)}
                    />
                    <label for="mostrarRamaTema" class="custom-control-label">Mostrar Temas, Ramas, Descriptores</label>
                  </div>
                </div>
                <br />
              </div>
              <div className="row">
                <button className="btn btn-primary col-5 m-3" type="button" id="publicar-en-front" onClick={() => setShow(true)}>Publicar en front de Normativa</button>
                <button className="btn btn-danger col-5 m-3" type="button" onClick={() => setShowConfirmacion(true)}>Borrar del front de Normativa</button>
                {operacionCompletada && <div className="ml-3 col alert alert-success d-flex justify-content-between">
                  Norma publicada/actualizada con éxito.
                  <div type="button" onClick={() => setOperacionCompletada(false)}>x</div>
                </div>}
                {borradoCorrectamente && <div className="ml-3 col alert alert-success d-flex justify-content-between">
                  Publicación borrada con éxito.
                  <div type="button" onClick={() => setBorradoCorrectamente(false)}>x</div>
                </div>}
              </div>
            </div>
          </div>
        </div>
        <Modal show={show} onHide={() => setShow(false)}>
          {isLoadingPublicacion ? <>
            <Modal.Header><Modal.Title>Por favor, espere que se complete la operación.</Modal.Title></Modal.Header>
            <Modal.Body><Spinner /></Modal.Body>
          </>
            :
            <>
              <Modal.Header>
                <Modal.Title>Está seguro que desea publicar/actualizar esta norma en el front?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                En caso de que la norma ya esté publicada, se reemplazaran los metadatos antiguos con los actuales.
              </Modal.Body>
              <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => setShow(false)}>
                  Volver
                </button>
                <button type="button" className="btn btn-primary" onClick={() => publicarNorma()}>
                  Confirmar
                </button>
                {errorPublicacion.show && <div className="alert alert-danger" role="alert">{errorPublicacion.mensaje}</div>}
              </Modal.Footer>
            </>}
        </Modal>
        <Modal show={showConfirmacion} onHide={() => setShowConfirmacion(false)}>
          <Modal.Header>
            <Modal.Title>Está seguro que desea borrar esta norma del FrontOffice?</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setShowConfirmacion(false)}>
              Volver
            </button>
            <button type="button" className="btn btn-danger" onClick={() => borrarPublicacion()}>
              Confirmar
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

}

export default Front;