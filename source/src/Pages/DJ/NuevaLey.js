import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import "./NuevaLey.css";
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap';

const NuevaLey = props => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const initForm = {
    idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
    usuario: localStorage.getItem("user_cuit"),
    numeroLey: null,
    anio:null,
    fechaFin:"",
    leyendaLey:"",
    leyendaModificaciones:""
  }
  const [form, setForm] = useState(initForm);

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'numeroLey':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ""
        }
        setForm({
          ...form,
          ['numeroLey']: value
        })
        break;

      case 'anio':
        if (e.target.validity.valid) {
          value = parseInt(e.target.value);
          if (isNaN(value)) {
            value = ''
          }
          setForm({
            ...form,
            ['anio']: value
          })
        }
        break;
      case 'fechaFin':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaFin']: value
        })
        break;

      case 'leyendaLey':
        value = e.target.value;
        setForm({
          ...form,
          ['leyendaLey']: value
        })
        break;
      case 'leyendaModificaciones':
        value = e.target.value;
        setForm({
          ...form,
          ['leyendaModificaciones']: value
        })
        break;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmAndSubmit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("token");
      let body = { ...form, cuit: localStorage.getItem("user_cuit").toString() };
      await ApiPinPost('/api/v1/dj/crear-ley', body, token).then((res) => {
        navigate("/sdin/administrador-digesto");
      }).catch(function (error) {
        setLoading(false);
        //console.log(error);
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      //console.log(error);
    }
  };

  return (
    <>
      <div className="container responsive mb-5" id="pagina-nueva-ley">
        <form className="form" onSubmit={e => handleSubmit(e)}>
          <div className="accordion">
            <div className="card" id="datos">
              <button
                id="boton1"
                className="card-header card-link"
                data-toggle="collapse"
                data-target="#collapse1"
                type="button"
              >
                DATOS
              </button>
              <div id="collapse1" className="collapse show" data-parent="#accordion">
                <div className="card-body">
                  <div className="form-group">
                    <label for="">Número</label>
                    <input type="text" className="form-control" id="numeroLey" name="numeroLey" pattern="[0-9]*"
                      onChange={e => handleFormChange(e)}/>
                  </div>
                  <div className="form-group">
                    <label for="">Año</label>
                    <input type="text" required className="form-control" id="anio" name="anio" onChange={e => handleFormChange(e)} />
                  </div>
                  <div className="form-group">
                    <label for="fechaFin">Fecha Fin</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaFin"
                      name="fechaFin"
                      required
                      aria-describedby="date-help"
                      onChange={e => handleFormChange(e)}
                    />
                  </div>
                  <div className="form-group fila">
                    <label for="">Leyenda</label>
                    <textarea type="text" className="form-control" id="leyendaLey" name="leyendaLey" pattern="[0-9]*"
                      required onChange={e => handleFormChange(e)} />
                  </div>
                  <div className="form-group fila">
                    <label for="">Modificaciones</label>
                    <textarea type="text" className="form-control" id="leyendaModificaciones" name="leyendaModificaciones" pattern="[0-9]*"
                      onChange={e => handleFormChange(e)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-lg boton-guardar" type="submit">Cargar Ley Digesto</button>
        </form>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>¿Está seguro que desea crear esta ley? Esto no se puede deshacer.</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <button className="btn btn-link" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-success" onClick={()=>confirmAndSubmit()}>
            Confirmar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NuevaLey;