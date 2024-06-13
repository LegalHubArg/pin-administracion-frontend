import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator';

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
import { rutasSDIN, rutasBO, rutasAdmin } from "../../routes";
import { FaChartLine, FaUserFriends } from "react-icons/fa";
import { RiOrganizationChart } from "react-icons/ri";

const HomeAdmin = props => {
  const navigate = useNavigate();

  return (
    <div className="container mb-5">
      <div className="card-deck">
        {/* <Link className="card" to={rutasBO.admin_sumario}>
          <div className="card-body">
            <h3 className="card-title">Sumario</h3>
          </div>
        </Link>
        <Link className="card" to={rutasBO.secciones}>
          <div className="card-body">
            <h3 className="card-title">Secciones</h3>
          </div>
        </Link> */}
        <Link className="card" to={rutasSDIN.tipos_de_norma}>
          <div className="card-body">
            <h3 className="card-title">Tipos de Norma</h3>
          </div>
        </Link>

        <Link className="card" to={rutasSDIN.dependencias}>
          <div className="card-body">
            <h3 className="card-title">Dependencias</h3>
          </div>
        </Link>
        {/* <Link className="card" to={rutasAdmin.reparticiones + "/" + rutasAdmin.jerarquia}>
          <div className="card-body">
            <RiOrganizationChart />
            <h3 className="card-title">Jerarquía de Reparticiones</h3>
          </div>
        </Link> */}
        <Link className="card" to={rutasAdmin.usuarios}>
          <div className="card-body" style={{display:"flex", gap:5}}>
            <FaUserFriends />
            <h3 style={{marginTop:-2}} className="card-title">Usuarios</h3>
          </div>
        </Link>{/* 
        <Link className="card" to={rutasBO.feriados}>
          <div className="card-body">
            <FiCalendar />
            <h3 className="card-title">Feriados</h3>
          </div>
        </Link> */}
        <Link className="card" to={rutasSDIN.temas}>
          <div className="card-body">
            <h3 className="card-title">Temas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.temas + "/" + rutasSDIN.temas_jerarquia}>
          <div className="card-body" style={{display:"flex", gap:5}}>
            <RiOrganizationChart />
            <h3 style={{marginTop:-2}} className="card-title">Jerarquía de Temas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.ramas}>
          <div className="card-body">
            <h3 className="card-title">Ramas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.patologias}>
          <div className="card-body">
            <h3 className="card-title">Patologías Normativas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.causales}>
          <div className="card-body">
            <h3 className="card-title">Causales</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.relaciones_tipos}>
          <div className="card-body">
            <h3 className="card-title">Relaciones</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.descriptores}>
          <div className="card-body">
            <h3 className="card-title">Descriptores</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.clases}>
          <div className="card-body">
            <h3 className="card-title">Clases</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.temas_front}>
          <div className="card-body">
            <h3 className="card-title">(Front) Árbol de Temas</h3>
          </div>
        </Link>
        <Link className="card" to={rutasSDIN.temas + "/" + rutasSDIN.indice_tematico}>
          <div className="card-body">
            <h3 className="card-title">Desplegar Árbol Temático</h3>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeAdmin;
