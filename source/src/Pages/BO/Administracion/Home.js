import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator';

import {
  FiEye as IconVer,
  FiChevronDown as IconMenu,
  FiEdit3 as IconEditar,
  FiSearch as IconBuscar,
  FiSend as IconNotificaciones,
  FiFilePlus as IconNuevaSolicitud,
  FiList,
  FiSettings,
  FiCalendar
} from "react-icons/fi";
import { rutasSDIN, rutasBO, rutasAdmin } from "../../../routes";
import { FaChartLine, FaUserFriends } from "react-icons/fa";
import { RiOrganizationChart } from "react-icons/ri";

const HomeAdmin = props => {
  const navigate = useNavigate();

  return (
    <div className="container mb-5">
      <div className="card-deck">
        <Link className="card" to={rutasBO.admin_sumario}>
          <div className="card-body">
            <h3 className="card-title">Sumario</h3>
          </div>
        </Link>
        <Link className="card" to={rutasBO.secciones}>
          <div className="card-body">
            <h3 className="card-title">Secciones</h3>
          </div>
        </Link>
        <Link className="card" to={rutasAdmin.tipos_normas}>
          <div className="card-body">
            <h3 className="card-title">Tipos de Norma</h3>
          </div>
        </Link>
        <Link className="card" to={rutasAdmin.subtipos_normas}>
          <div className="card-body">
            <h3 className="card-title">Subtipos de Norma</h3>
          </div>
        </Link>
        <Link className="card" to={rutasAdmin.reparticiones}>
          <div className="card-body">
            <h3 className="card-title">Reparticiones</h3>
          </div>
        </Link>
        <Link className="card" to={rutasAdmin.cuentas}>
          <div className="card-body" style={{display:"flex", alignItems:"center"}}>
            <FaUserFriends />
            <h3 className="card-title" style={{marginLeft:"20px"}}>Cuentas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasAdmin.usuarios_bo}>
          <div className="card-body" style={{display:"flex", alignItems:"center"}}>
            <FaUserFriends />
            <h3 className="card-title" style={{marginLeft:"20px"}}>Usuarios</h3>
          </div>
        </Link>
        <Link className="card" to={rutasBO.feriados}>
          <div className="card-body" style={{display:"flex", alignItems:"center"}}>
            <FiCalendar />
            <h3 className="card-title" style={{marginLeft:"20px"}}>Feriados</h3>
          </div>
        </Link>
        <Link className="card" to={rutasBO.organismo_emisor}>
          <div className="card-body">
            <h3 className="card-title">Organismo Emisor</h3>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeAdmin;
