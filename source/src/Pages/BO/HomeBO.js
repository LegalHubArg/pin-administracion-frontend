import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator';
import moment from "moment";
import { rutasAdmin, rutasBO } from "../../routes";

import {
  BiChevronDown as IconMenu
} from "react-icons/bi";

const HomeBO = props => {
  const navigate = useNavigate();


  const [observacionesPropias, setObservacionesPropias] = useState([])
  const [observacionesRepas, setObservacionesRepas] = useState([])

  const getObservacionesPropias = async () => {
    if (observacionesPropias.length === 0) {
      let data = []
      try {
        let body = {
          idUsuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),

        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/observaciones-propias', body, token).then(res => {
          data = res.data.respuesta
          setObservacionesPropias(data)
        }).catch(e => { throw new Error(e) })

      }
      catch (error) {
        //console.log(error)
      }
    }
  }

  const getObservacionesRepas = async () => {
    if (observacionesRepas.length === 0) {
      let data = []
      try {
        let body = {
          idUsuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
          usuario: localStorage.getItem("user_cuit"),

        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/observaciones-reparticiones', body, token).then(res => {
          data = res.data.data
          setObservacionesRepas(data)
        }).catch(e => { throw new Error(e) })

      }
      catch (error) {
        //console.log(error)
      }
    }
  }

  const linkearANorma = (e, id) => {
    e.preventDefault();
    navigate(`${rutasBO.normas}/${id}`)
  }
  return (
    <>
      <article>
        <header className="pt-4 pb-3 mb-4">
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                <li className="breadcrumb-item">Home BO</li>
              </ol>
            </nav>
          </div>
        </header>

        <div className="container">
          <div className="row mb-5">
            <div className="col-12 col-lg-12">
              <header>
                <h1 className="mb-3">Backoffice Boletín Oficial</h1>
              </header>
              <hr />
              <div className="container">
                <div className="card-deck max-cards-3">
                  <Link className="card card-horizontal" to={rutasBO.mis_solicitudes}>
                    <i class="bx bx-send card-icon-left"></i>
                    <div class="card-body">
                      <h4 class="card-title">Mis Solicitudes</h4>
                      <p class="card-text">
                        Visualizar solicitudes de publicación en BO.
                      </p>
                    </div>
                  </Link>
                  {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    <Link className="card card-horizontal" to={rutasBO.generar_boletin}>
                      <i className="bx bx-edit card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Generar BO</h3>
                        <p className="card-text">
                          Creación y Publicación del Boletin Oficial.
                        </p>
                      </div>
                    </Link>
                  }
                  <Link className="card card-horizontal" to={rutasBO.normas}>
                    <i className="bx bx-search card-icon-left" />
                    <div className="card-body">
                      <h3 className="card-title">Buscar Normas</h3>
                      <p className="card-text">
                        Buscar Normas, estados de trámites, reportes.
                      </p>
                    </div>
                  </Link>


                  <Link className="card card-horizontal" to={rutasBO.alta_solicitud}>
                    <i className="bx bx-plus card-icon-left"></i>
                    <div className="card-body">
                      <h3 className="card-title">Nueva Solicitud</h3>
                      <p className="card-text">
                        Ingrese una solicitud de alta de norma.
                      </p>
                    </div>
                  </Link>

                  {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    <Link className="card card-horizontal" to={rutasAdmin.home}>
                      <i className="bx bx-cog card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Administración</h3>
                        <p class="card-text">
                          Módulo de administración
                        </p>
                      </div>
                    </Link>
                  }

                  {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 &&
                    <Link className="card card-horizontal" to={rutasBO.boletines_publicados}>
                      <i className="bx bx-archive card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Boletines Publicados</h3>
                        <p class="card-text">
                          Historial de boletines.
                        </p>
                      </div>
                    </Link>
                  }
                </div>
              </div>
              <hr />
              {/* <section>
                <h2 className="mt-4">Mis Notificaciones</h2>
                <div id="accordion">
                  <div className="accordion-wrapper">
                    <div className="accordion" id="accordionExample">
                      <div className="card">
                        <button className="card-header collapsed card-link" data-toggle="collapse" data-target="#collapseOne" onClick={() => getObservacionesPropias()}>
                          Observaciones sobre Solicitudes Propias
                        </button>
                        <div id="collapseOne" className="collapse" data-parent="#accordion">
                          <div className="card-body">
                            <div className="table-responsive-sm">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col">Norma</th>
                                    <th scope="col">Motivo</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Acciones de Usuario</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    observacionesPropias && (
                                      observacionesPropias.length > 0 ? (
                                        observacionesPropias.map((observacion) => (
                                          <tr>
                                            <td>{observacion.normaAcronimoReferencia}</td>
                                            <td>{observacion.motivo}</td>
                                            <td>{moment(observacion.fechaCreacion).format('DD/MM/YYYY, h:mm:ss a')}</td>
                                            <td>
                                              <div className="dropdown-container">
                                                <div className="dropdown">
                                                  <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    data-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                  >
                                                    Acciones <IconMenu />
                                                  </button>
                                                  <div className="dropdown-menu">
                                                    <button className="dropdown-item" type="button" onClick={(e) => linkearANorma(e, observacion.idNorma)}>
                                                      Ver Detalle
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>No hay observaciones</tr>
                                      )
                                    )
                                  }

                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <button className="card-header collapsed card-link" data-toggle="collapse" data-target="#collapseTwo" onClick={() => getObservacionesRepas()}>
                          Observaciones sobre Solicitudes de Reparticiones
                        </button>
                        <div id="collapseTwo" className="collapse" data-parent="#accordion">
                          <div className="card-body">
                            <div className="table-responsive-sm">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col">Norma</th>
                                    <th scope="col">Motivo</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Acciones de Usuario</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    observacionesRepas && (
                                      observacionesRepas.length > 0 ? (
                                        observacionesRepas.map((observacion) => (
                                          <tr>
                                            <td>{observacion.normaAcronimoReferencia}</td>
                                            <td>{observacion.motivo}</td>
                                            <td>{moment(observacion.fechaCreacion).format('DD/MM/YYYY, h:mm:ss a')}</td>
                                            <td>
                                              <div className="dropdown-container">
                                                <div className="dropdown">
                                                  <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    data-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                  >
                                                    Acciones <IconMenu />
                                                  </button>
                                                  <div className="dropdown-menu">
                                                    <button className="dropdown-item" type="button" onClick={(e) => linkearANorma(e, observacion.idNorma)}>
                                                      Ver Detalle
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>No hay observaciones</tr>
                                      )
                                    )
                                  }

                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section> */}
            </div>
          </div>
        </div>
      </article>

    </>
  );
};

export default HomeBO;
