import React, { useState, useEffect } from 'react';

//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'

// Navigation
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@gcba/obelisco/dist/components/Spinner'

import moment from 'moment';
import './DetalleSolicitudBO.css';

import { Calendario } from '../../../Components/Calendario/Calendario'
import { Button } from '@gcba/obelisco'

const PublicacionesDesdeHasta = props => {

  const [isLoading, setLoading] = useState(true) //API Check
  const [publicaciones, setPublicaciones] = useState(null);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const [fechasDefault, setFechasDefault] = useState([]);
  const [fechaMinima, setFechaMinima] = useState();
  const [anioSeleccionado, setAnioSeleccionado] = useState(null)
  const [feriados, setFeriados] = useState([])
  const navigate = useNavigate();

  //Inicial Hook
  useEffect(() => {
    if (props.idNorma) {
      traerPublicaciones()
    }
  }, [])

  //Funcion que trae la fecha minima de modificación para el calendario de publicaciones
  function fechaMinimaModificacion() {

    //No se puede modificar el período desde-hasta
    let maxDate = moment(props.fechaHasta);
    let hoy = moment();
    if (hoy.isAfter(maxDate)) {
      maxDate = hoy;
    }
    maxDate = maxDate.add(1, 'day').format('YYYY-MM-DDT00:00')
    return new Date(maxDate);
  }

  //Traer Organismos
  const traerPublicaciones = async () => {
    try {
      let body = {};
      body.usuario = localStorage.getItem("user_cuit");
      body.idNorma = props.idNorma;
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/publicaciones', body, token).then(res => {
        let fechaDesde = moment(props.fechaDesde), fechas = [...res.data.data];

        while (fechaDesde.isSameOrBefore(props.fechaHasta)) {
          if (!(res.data.data.some(n => moment(n.fechaPublicacion).format('YYYY-MM-DD') === fechaDesde.format('YYYY-MM-DD')))) {
            fechas.push({ fechaPublicacion: fechaDesde.format('YYYY-MM-DD') })
          }
          fechaDesde.add(1, 'days');
        }

        fechas.sort((a, b) => new Date(a.fechaPublicacion) - new Date(b.fechaPublicacion));

        setPublicaciones(fechas)
        let anio = [...fechas].map(n => moment(n.fechaPublicacion).format('YYYY'))[0]
        setFechasSeleccionadas([...fechas].map(n => moment(n.fechaPublicacion).format('YYYY-MM-DD')))
        setAnioSeleccionado(anio)
        traerFeriados(anio)
        setFechasDefault([...fechas].map(n => moment(n.fechaPublicacion).format('YYYY-MM-DD')))
        setFechaMinima(fechaMinimaModificacion())
      })
      setLoading(false)
    }
    catch (error) {
      setLoading(true)
    }
  }
  //traer feriados
  const traerFeriados = async (fechaAnio) => {
    try {
      let token = localStorage.getItem("token");
      let body = {fechaAnio: fechaAnio}
      const response = await ApiPinPost('/api/v1/boletin-oficial/feriados', body, token)
      setFeriados(response.data.data)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  //Guarda las fechas seleccionadas del calendario para publicar la norma
  const guardarPublicaciones = async () => {
    setLoading(true)
    try {
      let body = {};
      body.usuario = localStorage.getItem("user_cuit");
      body.idUsuario = localStorage.getItem("idUsuarioBO");
      body.idNorma = props.idNorma;
      body.fechas = fechasSeleccionadas.filter(n => moment(n).isAfter(props.fechaHasta));
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/norma/guardar-republicaciones', body, token).then(_ => {
        traerPublicaciones()
      })
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (<Spinner type="primary" />)
  }
  else {
    return (
      <>
        <table className="table table-bordered">
          <thead><tr><th colspan="999">Publicaciones de la Norma</th></tr></thead>
          {publicaciones.length > 0 ? <>
            <thead>
              <tr>
                <th>N° Boletín</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Documento Publicado</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map(n => (<tr>
                <td>{n.boletinNumero ?? "-"}</td>
                <td>{n.boletinEstadoTipo ?? "-"}</td>
                <td>{n.fechaPublicacion ? moment(n.fechaPublicacion).format('DD/MM/YYYY') : null}</td>
                <td>{ }</td>
              </tr>))}
            </tbody></> : <tbody><tr><td>No hay publicaciones de esta norma en Boletín Oficial...</td></tr></tbody>}
        </table>
        <h3>Calendario de Publicaciones</h3>
        <Calendario
          fechasSeleccionadas={fechasSeleccionadas}
          setFechasSeleccionadas={setFechasSeleccionadas}
          defaultValues={fechasDefault}
          yaPublicadas={publicaciones.filter(n => n.boletinNumero).map(n => moment(n.fechaPublicacion).format('YYYY-MM-DD'))}
          fechaMinima={fechaMinima}
          feriados={feriados}
        />
        <br />
        <button className="btn btn-primary" onClick={() => guardarPublicaciones()}>Guardar</button>
      </>
    )
  }
}


export default PublicacionesDesdeHasta;