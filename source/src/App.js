import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, Outlet } from "react-router-dom";

//Obelisco
import '@gcba/obelisco/dist/obelisco.css';
//API PIN
import { ApiPinGet } from "./Helpers/ApiComunicator";
//Spinner
import Spinner from "./Components/Spinner/Spinner";
import { rutasBO, rutasSDIN, rutasDJ, rutasAdmin } from "./routes";

//VISTAS AUTH
const Login = React.lazy(() => import('./Controllers/Auth/LoginController'));

//VISTAS BO
const BOHome = React.lazy(() => import('./Controllers/BO/HomeBOController'));
const BOSumario = React.lazy(() => import('./Controllers/BO/SumarioBOController'));
const BOAltaSolicitud = React.lazy(() => import('./Controllers/BO/AltaSolicitudBOController'));
const BODetalleSolicitud = React.lazy(() => import('./Controllers/BO/DetalleSolicitudBOController'));
const BOEditarSolicitud = React.lazy(() => import('./Controllers/BO/EditarSolicitudBOController'));
const BOMisSolicitudes = React.lazy(() => import('./Controllers/BO/MisSolicitudesBOController'));
const BOObservacionSolicitud = React.lazy(() => import('./Controllers/BO/ObservacionSolicitudBOController'));
const BOCotizacionSolicitud = React.lazy(() => import('./Controllers/BO/CotizacionSolicitudBOController'));
const BOGenerarBoletin = React.lazy(() => import('./Controllers/BO/GenerarBoletinController'));
const BODiseniadorBoletin = React.lazy(() => import('./Controllers/BO/DiseniadorBoletinController'));
const BOBoletinVistaPrevia = React.lazy(() => import('./Controllers/BO/VistaPreviaBoletinController'));
const BOBuscarNormas = React.lazy(() => import('./Controllers/BO/BuscarNormasBOController'));
const BOFirmarBoletin = React.lazy(() => import('./Controllers/BO/FirmarBoletinController'));
const BODetalleBoletin = React.lazy(() => import('./Controllers/BO/DetalleBoletinController'));
const BODocumentosBoletin = React.lazy(() => import('./Controllers/BO/VistaDocumentosBoletinController'));
const BOAltaSeccion = React.lazy(() => import('./Controllers/BO/AltaSeccionController'));
const BOBMSeccion = React.lazy(() => import('./Controllers/BO/BMSeccionController'));
const BOTiposDeNormas = React.lazy(() => import('./Controllers/Administracion/TiposDeNormasController'));
const BOSubtiposDeNormas = React.lazy(() => import('./Controllers/Administracion/SubtiposDeNormasController'));
const BOReparticiones = React.lazy(() => import('./Controllers/Administracion/ReparticionesController'));
const BOFeriados = React.lazy(() => import('./Controllers/BO/FeriadosController'));
const BOAdminUsuarios = React.lazy(() => import('./Controllers/Administracion/AdministracionUsuariosController'));
const Jerarquia = React.lazy(() => import('./Controllers/Administracion/JerarquiaController'));
const Cuentas = React.lazy(() => import('./Controllers/BO/CuentasController'));
const Cuenta = React.lazy(() => import('./Controllers/BO/CuentaController'));
const UsuariosBO = React.lazy(() => import('./Controllers/BO/UsuariosBOController'));
const BoletinesPublicados = React.lazy(() => import('./Controllers/BO/BoletinesPublicadosController'));
const BOOrganismoEmisor = React.lazy(() => import('./Controllers/BO/OrganismoEmisorController'));

//VISTAS SDIN
const SDINHome = React.lazy(() => import('./Controllers/SDIN/HomeSDINController'));
const SDINNuevaNorma = React.lazy(() => import('./Controllers/SDIN/NuevaNormaController'));
const SDINImportarNormasBO = React.lazy(() => import('./Controllers/SDIN/ImportarNormasBOController'));
const SDINBusquedaAvanzada = React.lazy(() => import('./Controllers/SDIN/BusquedaAvanzadaController'));
const SDINMisNormas = React.lazy(() => import('./Controllers/SDIN/MisNormasController'));
const SDINNomenclatura = React.lazy(() => import('./Controllers/SDIN/MiNorma/NomenclaturaController'));
const SDINArchivoADescargar = React.lazy(() => import('./Controllers/SDIN/MiNorma/ArchivoADescargarController'));
const SDINReportes = React.lazy(() => import('./Controllers/SDIN/ReportesController'));
const SDINTemas = React.lazy(() => import('./Controllers/SDIN/TemasFrontController'));
const SDINVistaPreviaAnexos = React.lazy(() => import('./Controllers/SDIN/VistaPreviaAnexosController'));
const SDINAdministradorDigesto = React.lazy(() => import('./Controllers/SDIN/AdministradorDigestoController'));
const SDINAnexos = React.lazy(() => import('./Controllers/SDIN/AnexosController'));
const SDINTemasABM = React.lazy(() => import('./Controllers/SDIN/ABM/TemasController'));
const SDINClasesABM = React.lazy(() => import('./Controllers/SDIN/ABM/ClasesController'));
const SDINRelacionesTiposABM = React.lazy(() => import('./Controllers/SDIN/ABM/RelacionesTiposController'));
const SDINDescriptores = React.lazy(() => import('./Controllers/SDIN/DescriptoresController'));
const SDINJerarquiaTemas = React.lazy(() => import('./Controllers/SDIN/JerarquiaTemasController'));
const SDINRamasABM = React.lazy(() => import('./Controllers/SDIN/ABM/RamasController'));
const SDINCausalesABM = React.lazy(() => import('./Controllers/SDIN/ABM/CausalesController'));
const SDINPatologiasABM = React.lazy(() => import('./Controllers/SDIN/ABM/PatologiasController'));
const SDINIndiceTematico = React.lazy(() => import('./Controllers/SDIN/IndiceTematicoController'));
const SDINTiposDeNormas = React.lazy(() => import('./Controllers/SDIN/TiposDeNormaController'));
const SDINDependencias = React.lazy(() => import('./Controllers/SDIN/DependenciasController'));
const SDINLogs = React.lazy(() => import('./Controllers/SDIN/LogsController'));

//VISTAS DJ
const DJNuevaLey = React.lazy(() => import('./Controllers/DJ/NuevaLeyController'));
const DJAbrogacion = React.lazy(() => import('./Controllers/DJ/AbrogacionController'));
const DJAntecedentesEquivalencias = React.lazy(() => import('./Controllers/DJ/AntecedentesEquivalenciasController'));
const DJConflictosNormativos = React.lazy(() => import('./Controllers/DJ/ConflictosNormativosController'));
const DJNecesidadDeAbrogacion = React.lazy(() => import('./Controllers/DJ/NecesidadDeAbrogacionController'));
const DJNecesidadDeRefundir = React.lazy(() => import('./Controllers/DJ/NecesidadDeRefundirController'));
const DJPerdidaVigenciaJuridica = React.lazy(() => import('./Controllers/DJ/PerdidaVigenciaJuridicaController'));
const DJTextoDefinitivo = React.lazy(() => import('./Controllers/DJ/TextoDefinitivoController'));

const Administracion = React.lazy(() => import('./Controllers/Administracion/HomeController'));
const Usuario = React.lazy(() => import('./Controllers/Administracion/UsuarioController'));

const Error404 = React.lazy(() => import('./Pages/Error404'));

function App() {
  const [isAuth, setIsAuth] = useState(true)
  const [url, setURL] = useState('/login')
  let navigate = useNavigate();
  const location = useLocation();
  const vistasDelUsuario = JSON.parse(localStorage?.getItem("vistas")) || []

  const autorizar = async () => {
    try {
      let token = localStorage.getItem("token");
      if (token == null) {
        localStorage.clear();
        navigate("/login", { replace: true })
      }
      else {
        await ApiPinGet('/api/v1/auth/checkToken', token).then(res => {
          let vistas = vistasDelUsuario?.map(elem => elem.rutaVista);
          if (res.data.status === "ok" && validarRuta(location.pathname, vistas)) {
            setIsAuth(true);
          }
          else {
            setIsAuth(false);
            if (!(res.data.status === "ok")) { localStorage.clear() }
          }

        }).catch(e => {
          throw e
        }
        )
      }

    }
    catch (error) {
      localStorage.clear()
      navigate("/login", { replace: true })
    }

  }

  function validarRuta(ruta, vistas) {
    /* if (isAuth) return true; */
    let rutas_generales = ["/", "/login"];
    if (rutas_generales.includes(ruta)) { return true }
    if (vistas.includes('/' + location.pathname.split('/').at(-1)) ||
      !isNaN(parseInt(location.pathname.split('/').at(-1)))) {
      return true
    } else { return false }
  }

  const RutasPrivadas = () => {
    return (
      isAuth ? <React.Suspense fallback={<Spinner />}><Outlet /></React.Suspense> : <Redireccionar />
    )
  }


  const Redireccionar = () => {
    const todasLasRutas = Object.values(rutasBO).concat(Object.values(rutasSDIN));
    const existeLaRuta = validarRuta(location.pathname, todasLasRutas.map(n => n.at(0) === '/' ? '/' + n.replace(/\//, '') : '/' + n));
    if (existeLaRuta) {
      return (
        <Home />
      )
    }
    return (
      <Outlet />
    )
  }

  const Home = () => {
    if (vistasDelUsuario.map(n => n.rutaVista).includes(rutasBO.home)) {
      return (<Navigate to={rutasBO.home} replace />)
    }
    if (vistasDelUsuario.map(n => n.rutaVista).includes(rutasSDIN.home)) {
      return (<Navigate to={rutasSDIN.home} replace />)
    }
    return (
      <Navigate to="/login" replace />
    )
  }

  useEffect(() => {
    if (location.pathname !== url) {
      //console.log('Cambio de URL')
      //console.log('Location: ', location.pathname)
      autorizar()
      setURL(location.pathname)
    }

  }, [location])

  useEffect(() => {
    //console.log('URL: ', url)
  }, [url])

  useEffect(() => {
    autorizar()
  }, [])

  return (
    <Routes>
      {/* GENERAL */}
      <Route path="/login" element={<React.Suspense fallback={<Spinner />}><Login /></React.Suspense>}></Route>
      <Route path="/" element={<Home />} />

      <Route element={<RutasPrivadas />}>
        <Route path="/sumario" element={<BOSumario />}></Route>
        <Route path="*" element={<React.Suspense fallback={<Spinner />}><Error404 /></React.Suspense>} />

        {/* BOLETIN OFICIAL */}
        <Route path={rutasBO.home}>
          <Route index element={<BOHome />}></Route>
          <Route path={rutasBO.alta_solicitud} element={<BOAltaSolicitud />}></Route>
          <Route path={rutasBO.mis_solicitudes} element={<BOMisSolicitudes />}></Route>
          <Route path={rutasBO.alta_seccion} element={<BOAltaSeccion />}></Route>

          <Route path={rutasBO.boletines_publicados}>
            <Route index  element={<BoletinesPublicados />} />
            <Route path={rutasBO.ver_documentos_bo} element={<BODocumentosBoletin />} />
          </Route>

          <Route path={rutasBO.generar_boletin}>
            <Route index element={<BOGenerarBoletin />} />
            <Route path={rutasBO.diseniador_bo} element={<BODiseniadorBoletin />} />
            <Route path={rutasBO.vista_previa_bo} element={<BOBoletinVistaPrevia />} />
            <Route path={rutasBO.detalle_boletin} element={<BODetalleBoletin />} />
            <Route path={rutasBO.firmar_bo} element={<BOFirmarBoletin />} />
            <Route path={rutasBO.ver_documentos_bo} element={<BODocumentosBoletin />} />
          </Route>

          <Route path={rutasBO.normas}>
            <Route index element={<BOBuscarNormas />} />
            <Route path={rutasBO.detalle_solicitud}>
              <Route index element={<BODetalleSolicitud />} />
              <Route path={rutasBO.observacion} element={<BOObservacionSolicitud />} />
              <Route path={rutasBO.cotizar} element={<BOCotizacionSolicitud />} />
              <Route path={rutasBO.editar_solicitud} element={<BOEditarSolicitud />} />
            </Route>
          </Route>
        </Route>

        {/* SDIN */}
        <Route path={rutasSDIN.home}>
          <Route index={true} element={<SDINHome />}></Route>
          <Route path={rutasSDIN.importar_normas_bo} element={<SDINImportarNormasBO />}></Route>
          <Route path={rutasSDIN.reportes} element={<SDINReportes />}></Route>
          <Route path={rutasSDIN.busqueda_avanzada} element={<SDINBusquedaAvanzada />}></Route>
          <Route path={rutasSDIN.mis_normas} element={<SDINMisNormas />}></Route>
          <Route path={rutasSDIN.nueva_norma} element={<SDINNuevaNorma />}></Route>
          <Route path={rutasSDIN.ficha_norma} element={<SDINNomenclatura />}></Route>
          <Route path={rutasSDIN.ficha_norma_imagen} element={<SDINArchivoADescargar />}></Route>
          <Route path={rutasSDIN.vista_previa_anexos} element={<SDINVistaPreviaAnexos />}></Route>
          <Route path={rutasSDIN.administrador_digesto} element={<SDINAdministradorDigesto />}></Route>
          <Route path={rutasSDIN.anexos} element={<SDINAnexos />}></Route>
          <Route path={rutasSDIN.logs} element={<SDINLogs />}></Route>
        </Route>

        {/* DIGESTO JURIDICO */}
        <Route path={rutasDJ.home}>
          <Route index={true} />
          <Route path={rutasDJ.nueva_ley} element={<DJNuevaLey />}></Route>
          <Route path={rutasDJ.abrogacion} element={<DJAbrogacion />}></Route>
          <Route path={rutasDJ.antecedentes_equivalencias} element={<DJAntecedentesEquivalencias />}></Route>
          <Route path={rutasDJ.conflictos_normativos} element={<DJConflictosNormativos />}></Route>
          <Route path={rutasDJ.necesidad_abrogacion} element={<DJNecesidadDeAbrogacion />}></Route>
          <Route path={rutasDJ.necesidad_refundir} element={<DJNecesidadDeRefundir />}></Route>
          <Route path={rutasDJ.perdida_vigencia_juridica} element={<DJPerdidaVigenciaJuridica />}></Route>
          <Route path={rutasDJ.texto_definitivo} element={<DJTextoDefinitivo />}></Route>
        </Route>

        {/* ADMINISTRACIÓN */}
        <Route path={rutasAdmin.home}>
          <Route index element={<Administracion />} />
          <Route path={rutasAdmin.tipos_normas} element={<BOTiposDeNormas />}></Route>
          <Route path={rutasAdmin.subtipos_normas} element={<BOSubtiposDeNormas />}></Route>
          <Route path={rutasAdmin.reparticiones}>
            <Route index element={<BOReparticiones />}></Route>
            <Route path={rutasAdmin.jerarquia} element={<Jerarquia />}></Route>
          </Route>
          <Route path={rutasAdmin.usuarios}>
            <Route index element={<BOAdminUsuarios />}></Route>
            <Route path={":idUsuario"} element={<Usuario />}></Route>
          </Route>
          <Route path={rutasBO.feriados} element={<BOFeriados />}></Route>
          <Route path={rutasBO.secciones} element={<BOBMSeccion />}></Route>
          <Route path={rutasBO.admin_sumario} element={<BOSumario />}></Route>
          <Route path={rutasSDIN.descriptores} element={<SDINDescriptores />}></Route>
          <Route path={rutasSDIN.ramas} element={<SDINRamasABM />}></Route>
          <Route path={rutasSDIN.causales} element={<SDINCausalesABM />}></Route>
          <Route path={rutasSDIN.patologias} element={<SDINPatologiasABM />}></Route>
          <Route path={rutasSDIN.clases} element={<SDINClasesABM />}></Route>
          <Route path={rutasSDIN.relaciones_tipos} element={<SDINRelacionesTiposABM />}></Route>
          <Route path={rutasSDIN.temas_front} element={<SDINTemas />}></Route>
          <Route path={rutasSDIN.temas}>
            <Route index={true} element={<SDINTemasABM />} />
            <Route path={rutasSDIN.temas_jerarquia} element={<SDINJerarquiaTemas />}></Route>
            <Route path={rutasSDIN.indice_tematico} element={<SDINIndiceTematico />}></Route>
          </Route>
          <Route path={rutasSDIN.tipos_de_norma} element={<SDINTiposDeNormas />}></Route>
          <Route path={rutasSDIN.dependencias} element={<SDINDependencias />}></Route>
          <Route path={rutasAdmin.cuentas}>
            <Route index element={<Cuentas />} />
            <Route path={":idCuenta"} element={<Cuenta />} />
          </Route>
          <Route path={rutasAdmin.usuarios_bo} element={<UsuariosBO />}></Route>
          <Route path={rutasBO.organismo_emisor} element={<BOOrganismoEmisor />}></Route>
        </Route>
      </Route>

    </Routes >
  );
}

export default App;