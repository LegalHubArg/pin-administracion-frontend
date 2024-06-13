import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap'
import { decode } from 'html-entities';
import moment from 'moment';

const Historial = ({ norma }) => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false)
  const [historial, setHistorial] = useState([])
  useEffect(async () => {
    await traerHistorial();
  }, [])

  const traerHistorial = async () => {
    setLoading(true)
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/historial', body, token)
        .then(res => {
          setLoading(false);
          setHistorial(res.data.historial)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //conso
    }
  }



  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="card" id="accordion">
          <div className="card-body">
            <h4 className="card-title">
              HISTORIAL
            </h4>
            <br></br>
            {historial && historial.length > 0 ? <table class="table table-bordered table-hover" >
              <thead>
                <tr>
                  <th scope="col">Norma</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Quien</th>
                  <th scope="col">A Quien</th>
                  <th scope="col">Fecha Evento</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((hist) => (
                  <tr>
                    <td>{hist.idNormaSDIN}</td>
                    <td>{decode(hist.normasEstadoTipo)}</td>
                    <td>{decode(hist.apellidoNombre)}</td>
                    <td>{decode(hist.analista)}</td>
                    <td>{moment(hist.fechaCarga).format('DD/MM/YYYY HH:mm:ss')}</td>
                  </tr>

                ))}
              </tbody>
            </table> : "No se encontraron historiales para esta norma..."}
            <div className="card-body">

            </div>
          </div>
        </div>

      </>
    )
  }

}

export default Historial;