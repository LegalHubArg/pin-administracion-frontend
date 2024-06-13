import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator';

import { rutasAdmin, rutasSDIN } from "../../routes";

const HomeBO = props => {
  const navigate = useNavigate();

  return (
    <>
      <article>
        <header className="pt-4 pb-3 mb-4">
        </header>

        <div className="container">
          <div className="row mb-5">
            <div className="col-12 col-lg-12">
              <header>
                <h1 className="mb-3">Sistema de Información Normativa y Digesto Jurídico</h1>
              </header>
              <hr />
              <div className="container">
                <div className="card-deck max-cards-3">
                  {/* <Link className="card card-horizontal" to={rutasSDIN.importar_normas_bo}> */}
                  <Link className="card card-horizontal" to={rutasSDIN.importar_normas_bo}>
                    <i className="bx bx-send card-icon-left" />
                    <div className="card-body">
                      <h3 className="card-title">Importación BO</h3>
                      <p class="card-text">

                      </p>
                    </div>
                  </Link>
                  <Link className="card card-horizontal" to={rutasSDIN.busqueda_avanzada}>
                    <i className="bx bx-search card-icon-left" />
                    <div className="card-body">
                      <h3 className="card-title">Búsqueda Avanzada y Operaciones</h3>
                      <p class="card-text">

                      </p>
                    </div>
                  </Link>
                  <Link className="card card-horizontal" to={rutasSDIN.mis_normas}>
                  {/* <Link className="card card-horizontal" to={'#'}> */}
                    <i className="bx bx-search card-icon-left" />
                    <div className="card-body">
                      <h3 className="card-title">Mis Normas</h3>
                      <p class="card-text">

                      </p>
                    </div>
                  </Link>
                  {JSON.parse(localStorage.getItem("perfiles")).find(item => item.idPerfil === 9) && <>
                    <Link className="card card-horizontal" to={rutasSDIN.reportes}>
                      <i className="bx bx-line-chart card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Reportes de Productividad</h3>
                        <p class="card-text">

                        </p>
                      </div>
                    </Link>
                    <Link className="card card-horizontal" to={rutasSDIN.vista_previa_anexos}>
                      <div className="card-icon-left">DJ</div>
                      <div className="card-body">
                        <h3 className="card-title">Generación de Anexos</h3>
                        <p class="card-text">
                          Vista Previa de anexos del Digesto
                        </p>
                      </div>
                    </Link>

                    <Link className="card card-horizontal" to={rutasSDIN.administrador_digesto}>
                      <div className="card-icon-left">DJ</div>
                      <div className="card-body">
                        <h3 className="card-title">Digesto Jurídico</h3>
                        <p class="card-text">

                        </p>
                      </div>
                    </Link>

                    

                    <Link className="card card-horizontal" to={rutasSDIN.logs}>
                      <i className="bx bx-list-ul card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Logs</h3>
                        <p class="card-text">
                          Registros de trazabilidad
                        </p>
                      </div>
                    </Link>

                    <Link className="card card-horizontal" to={rutasAdmin.home}>
                      <i className="bx bx-cog card-icon-left" />
                      <div className="card-body">
                        <h3 className="card-title">Administración</h3>
                        <p class="card-text">
                          Módulo de administración
                        </p>
                      </div>
                    </Link>
                  </>}
                </div>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </article>

    </>
  );
};

export default HomeBO;
