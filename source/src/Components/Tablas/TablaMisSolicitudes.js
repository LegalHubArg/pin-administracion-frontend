import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiChevronDown as IconMenu,
} from "react-icons/fi";
//Navigate
import { linkToParams } from "../../Helpers/Navigation";
import "./TablaMisSolicitudes.css";
import { rutasBO } from "../../routes";

const TablaMisSolicitudes = ({ data, handleDelete }) => {
  const [tabla, setTabla] = useState([]); //Solicitudes de la API
  const navigate = useNavigate();
  const linkearANorma = (e, id) => {
    e.preventDefault();
    linkToParams(`/${rutasBO.normas}/${id}`, navigate)
  }

  useEffect(() => {
    //console.log(data)
    let rows = []
    if (data != null) {
      for (let i = 0; i < data.length; i++) {
        rows.push(<><tr>
          <td>{data[i].idNorma}</td>
          <td>{data[i].normaAcronimoReferencia}</td>
          <td class="limitada">{data[i].normaSumario.substring(0, 50) + '...'}</td>
          <td class="limitada"><span className="badge badge-info active">{data[i].normasEstadoTipo}</span></td>
          <td><span className="badge badge-success active">{data[i].prioridad}</span></td>
          <td><span className="badge badge-secondary active">{data[i].apellidoNombre}</span></td>
          <td class="limitada"><span className="badge badge-secondary active">{data[i].reparticion}</span></td>
          <td>
            <Link to={rutasBO.home + "/" + rutasBO.normas + "/" + data[i].idNorma} target="_blank">Ver Detalle</Link>
            {/* <button className="dropdown-item" type="button" onClick={ (e) => handleDelete(e, data[i].idNorma, data[i].normaAcronimoReferencia)}>Eliminar</button> */}
          </td>
        </tr > </>)
      }
    }
    if (data?.length <= 0 || !data) {
      rows.push(<tr class="tabla-vacia">
        <br />
        No hay solicitudes para mostrar...
        <br />
        <br />
      </tr>)
    }

    setTabla(rows)

  }, [data])

  return (<>
    <div className="table-responsive-sm" style={{ fontSize: 13 }} id="tabla-solicitudes">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Id Norma</th>
            <th scope="col">Norma</th>
            <th scope="col">Descripción</th>
            <th scope="col">Estado</th>
            <th scope="col">Prioridad</th>
            <th scope="col">Usuario Carga</th>
            <th scope="col">Reparticion</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tabla}
        </tbody>
      </table>
    </div>

  </>);
};

export default TablaMisSolicitudes;