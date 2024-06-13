import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import moment from "moment";
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import { getCausales, getNormaSubtipos } from '../../Helpers/consultas';
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasBO } from '../../routes';
const b64toBlob = require('b64-to-blob');

const AltaSeccion = props => {
  const navigate = useNavigate();

  const { idSeccion } = useParams();

  const [isLoading, setLoading] = useState(false)

  const initForm = {
    seccion: null,
    seccionSigla: null,
    seccionOrden: null
  }
  

  const [form, setForm] = useState(initForm)

  

  const handleFormChange = (e) => {
      console.log('este es el evento:', e.target.value)
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
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
      seccion: form.seccion,
      seccionSigla: form.seccionSigla,
      seccionOrden: form.seccionOrden
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/seccion/crear', body, token)
        .then(_ => {
          navigate(`${rutasBO.home}/${rutasBO.alta_seccion.replace(':idSeccion', idSeccion)}`)
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

  //Hook inicial
  /* useEffect(async () => {
    setLoading(true)
    await getCrear()
    setLoading(false)
  }, []) */

  if (isLoading) {
    return (<Spinner />)
  }
  else {
      return (
          <>
        <div className="container responsive mb-5" id="abrogacion-expresa">
          <h3>Nueva Sección:</h3>
          <form className="form" onSubmit={e => handleSubmit(e)}>
            <div className="card">
                <div className="card-body formulario-asiento">
                <div className="form-group">
                    <label for="seccion">Sección</label>
                    <input className="form-control" id="seccion" name="seccion"
                    onChange={e => handleFormChange(e)} value={form.seccion} />
                </div>
                <div className="form-group">
                    <label for="seccionSigla">Sección Sigla</label>
                    <input className="form-control" id="seccionSigla" name="seccionSigla"
                    onChange={e => handleFormChange(e)} value={form.seccionSigla} />
                </div>
                <div className="form-group">
                    <label for="seccionOrden">Sección Orden</label>
                    <input className="form-control" id="seccionOrden" name="seccionOrden"
                    onChange={e => handleFormChange(e)} value={form.seccionOrden} />
                </div>
                </div>
            </div>
            <br />
            <button type='submit' className="btn btn-primary">Guardar</button>
          </form>
        </div >

      </>
    )
  }

}

export default AltaSeccion;