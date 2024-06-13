import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
// Tabla Mis Solicitudes
import TablaMisSolicitudes from "../../Components/Tablas/TablaMisSolicitudes";
// Navigation
import { linkToParams } from "../../Helpers/Navigation";
// Modal
import { Modal, Button } from 'react-bootstrap';
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import {
  FiFilePlus as IconNuevaSolicitud
} from "react-icons/fi";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import "./MisSolicitudesBO.css";
import BuscarNormasBO from "./BuscarNormasBO";
import { Pagination } from "@gcba/obelisco";

const MisSolicitudesBO = props => {
  //DATOS
  const [solicitudesPropias, setSolicitudesPropias] = useState([]); //Solicitudes de la API
  const [solicitudesRepa, setSolicitudesRepa] = useState([]); //Solicitudes de la API
  const [isLoading, setLoading] = useState(true); // Api Check
  const [isLoadingRepa, setLoadingRepa] = useState(true); // Api Check
  const [isLoadingPropias, setLoadingPropias] = useState(true); // Api Check

  const [paginacionPropias, setPaginacionPropias] = useState({
    paginaActual: 1,
    limite: 10,
    totalPaginas: 1,
    botones: [],
    cambiarPagina: false
  })


  useEffect(async () => {
    if (paginacionPropias.cambiarPagina === true) {
      let auxPaginacion = paginacionPropias;
      auxPaginacion.cambiarPagina = false;
      setPaginacionPropias({ ...auxPaginacion })
      await getSolicitudesPropias()
    }
  }, [paginacionPropias])

  const [paginacionRepa, setPaginacionRepa] = useState({
    paginaActual: 1,
    limite: 10,
    totalPaginas: 1,
    botones: [],
    cambiarPagina: false
  })
  useEffect(async () => {
    if (paginacionRepa.cambiarPagina === true) {
      let auxPaginacion = paginacionRepa;
      auxPaginacion.cambiarPagina = false;
      setPaginacionRepa({ ...auxPaginacion })
      await getSolicitudesCuenta()
    }
  }, [paginacionRepa])

  useEffect(() => {
    // console.log(solicitudesPropias)
    if (solicitudesPropias.totalNormas) {
      let auxPaginacion = paginacionPropias;
      auxPaginacion.totalPaginas = Math.ceil(solicitudesPropias.totalNormas / auxPaginacion.limite);
      auxPaginacion.botones = [];
      for (let i = 1; i <= paginacionPropias.totalPaginas; i++) {
        auxPaginacion.botones.push(i)
      }
      setPaginacionPropias({ ...auxPaginacion });
    }
  }, [solicitudesPropias])

  useEffect(() => {
    if (solicitudesRepa.totalNormas) {
      let auxPaginacion = paginacionRepa;
      auxPaginacion.totalPaginas = Math.ceil(solicitudesRepa.totalNormas / auxPaginacion.limite);
      auxPaginacion.botones = [];
      for (let i = 1; i <= paginacionRepa.totalPaginas; i++) {
        auxPaginacion.botones.push(i)
      }
      setPaginacionRepa({ ...auxPaginacion });
    }
  }, [solicitudesRepa])

  function cambiarPagina(e, btn) {
    e.preventDefault();
    let auxPaginacion = paginacionPropias;
    auxPaginacion.paginaActual = btn;
    auxPaginacion.cambiarPagina = true;
    setPaginacionPropias({ ...auxPaginacion })
  }

  const handlePaginacionRepa = (page) => {
    setPaginacionRepa((prevPaginacion) => ({
      ...prevPaginacion,
      paginaActual: page + 1,
      cambiarPagina: true
    }));
  };
  const handlePaginacionPropias = (page) => {
    setPaginacionPropias((prevPaginacion) => ({
      ...prevPaginacion,
      paginaActual: page + 1,
      cambiarPagina: true
    }));
  };

  //MODAL
  const [idNormaSeleccion, setIdNormaSeleccion] = useState(null);
  const [normaSeleccion, setNormaSeleccion] = useState('');
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();

  const getSolicitudesPropias = async () => {
    setLoadingPropias(true)
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        ...paginacionPropias
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/normas/normas-propias', body, token).then(res => {
        setSolicitudesPropias(res.data)
        setLoading(false)
      }).catch(function (error) {
        setLoading(true)
        // console.log(error.toJSON());
        // linkToParams('/', {}, navigate)
      });
    }
    catch (error) {
      setLoading(true)
      // console.log(error);
      // linkToParams('/', {}, navigate)
    }
    setLoadingPropias(false)
  }

  const getSolicitudesCuenta = async () => {
    try {
      let perfil = parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil)
      // console.log(perfil)
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idCuenta: JSON.parse(localStorage.getItem("perfiles"))[0].idCuenta,
        ...paginacionRepa
      }
      let token = localStorage.getItem("token");
      let url = '/api/v1/boletin-oficial/normas/normas-cuenta'
      /* if (perfil === 5) {
        url = '/api/v1/boletin-oficial/normas/normas-reparticiones-todas'
      } */
      await ApiPinPost(url, body, token).then(res => {
        setSolicitudesRepa(res.data)
        setLoadingRepa(false)
      }).catch(function (error) {
        throw error
        // console.log(error.toJSON());
      });
    }
    catch (error) {
      setLoadingRepa(true)
      // console.log(error);
      //linkToParams('/', {}, navigate)
    }

  }

  useEffect(async () => {
    setLoading(true)
    await getSolicitudesPropias()
    if (parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 2) {
      await getSolicitudesCuenta()
    }
    setLoading(false)
  }, [])

  function handleDelete(e, idNorma, nombreNorma) {
    e.preventDefault();
    setIdNormaSeleccion(idNorma)
    setNormaSeleccion(nombreNorma)
    handleShow();

  }

  //LLAMADA A LA API PARA ELIMINAR
  const eliminarSolicitud = async (e, idNorma) => {
    e.preventDefault();
    handleClose();
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idNorma: idNorma
      }
      let token = localStorage.getItem("token");
      const res = await ApiPinPost('/api/v1/boletin-oficial/normas/norma/borrar', body, token).then(res => {
        // console.log('Eliminado con éxito')
        window.location.reload(false);
      }).catch(function (error) {
        // console.log(error.toJSON());
        window.location.reload(false);
      });
    }
    catch (error) {
      // console.log(error);
      window.location.reload(false);
    }

  }

  const handleCantidadNormasPropias = (e) => {
    let auxPaginacion = paginacionPropias;
    auxPaginacion.limite = e;
    auxPaginacion.cambiarPagina = true;
    setPaginacionPropias({ ...auxPaginacion })
  }

  if (isLoading) {
    //Spinner
    return (<Spinner loading={isLoading} />)
  }
  else {
    return (
      <>
        <article>
          <header className="pt-4 pb-3 mb-4">
            <div className="container">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                  <li className="breadcrumb-item">Mis Solicitudes</li>
                </ol>
              </nav>
            </div>
          </header>

          <div className="container" id="pagina-mis-solicitudes">
            <div className="row mb-5">
              <div className="col-12 col-lg-12">
                <header>
                  <div className="row align-items-center">
                    <div className="col">
                      <h1 className="mb-3">Mis Solicitudes </h1>
                    </div>
                    <div className="col">
                    </div>
                    <div classNAme="col text-right">
                      <h3><Link to={'/bo/alta-solicitud'} style={{ textDecoration: 'none' }}><IconNuevaSolicitud /> Crear Solicitud de Carga</Link></h3>
                    </div>
                  </div>

                </header>
                <hr />
                <section>
                  <div>
                    <h2 className="mt-4">Solicitudes Propias</h2>
                    <div>
                      <label for="idNorma">Mostrar: </label>
                      &nbsp;&nbsp;
                      <select value={paginacionPropias.limite} className="custom-select" id="cantidadNormasPropias" name="cantidadNormasPropias"
                        onChange={(e) => { handleCantidadNormasPropias(e.target.value) }}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>

                      </select>
                    </div>
                  </div>
                  {(isLoadingPropias === false) ? <TablaMisSolicitudes data={solicitudesPropias?.data} handleDelete={handleDelete} /> : <Spinner />}
                  <div className="d-flex justify-content-center"><Pagination pages={paginacionPropias.totalPaginas}
                    onPageSelected={page => handlePaginacionPropias(page)} /></div>
                </section>
                {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) !== 5 && (<section>
                  <h2 className="mt-4">Solicitudes de la Cuenta</h2>
                  {isLoadingRepa ? <Spinner /> : <TablaMisSolicitudes data={solicitudesRepa.data} handleDelete={handleDelete} />}
                  <div className="d-flex justify-content-center"><Pagination pages={paginacionRepa.totalPaginas}
                    onPageSelected={page => handlePaginacionRepa(page)} /></div>
                </section>)}

                {parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) === 5 && <BuscarNormasBO />}
              </div>
            </div>
          </div>
        </article>
        <Modal className="modal fade " role="dialog" dialogClassName="modal-dialog modal-sm" tabindex="-1" show={show} onHide={handleClose}>

          <Modal.Header>
            <Modal.Title>Eliminar Solicitud</Modal.Title>
          </Modal.Header>
          <Modal.Body>Está seguro que desae eliminar la norma #{normaSeleccion} ?.</Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-link" onClick={handleClose} data-dismiss="modal">
              Cancelar
            </Button>
            <Button className="btn btn-primary" onClick={(e) => eliminarSolicitud(e, idNormaSeleccion)} >
              Si, eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );

  }


};

export default MisSolicitudesBO;
