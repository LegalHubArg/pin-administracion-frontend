import React, { useState, useEffect } from "react";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaEye, FaTimes, FaTrashAlt } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import { Pagination } from '@gcba/obelisco'

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";
import { Modal } from 'react-bootstrap';
//HTML decode
import { decode } from 'html-entities';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { getNormaTipos } from "../../Helpers/consultas";
import { ExportarExcel } from "../../Components/Dropdown/ExportarExcel";
import { Autocomplete } from '../../Components/Autocomplete/Autocomplete';
import './Logs.css';
var b64toBlob = require('b64-to-blob');

const Logs = (props) => {

    const navigate = useNavigate();

    const [detalle, setDetalle] = useState(props?.props?.detalle ? props?.props?.detalle : 4)
    const [isLoading, setLoading] = useState(true)
    const [loadingLogs, setLoadingLogs] = useState(false)
    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });
    const [logs, setLogs] = useState([])
    const [user, setUser] = useState([])
    const [tipos, setTipos] = useState([])
    const [auxLog, setAuxLogs] = useState([])
    const initForm = {
        idNorma: props?.props?.norma?.idNormaSDIN,
        user: '',
        fechaDesde: '',
        fechaHasta: '',
        idTipoOperacion: ''
    }
    const [formAux, setFormAux] = useState(initForm)

    const [totalResultados, setTotalResultados] = useState(null);

    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNormaSDIN',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 25,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    const traerUsuarios = () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            ApiPinPost(`/api/v1/sdin/logs/trazabilidad/usuarios`, body, token)
                .then((res) => {
                    setUser(res.data.data)
                }).catch(function (error) {
                    console.log(error);
                });
        }
        catch (error) {
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const traerTipos = () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            ApiPinPost(`/api/v1/sdin/logs/trazabilidad/tipos`, body, token)
                .then((res) => {
                    setTipos(res.data.data)
                }).catch(function (error) {
                    console.log(error);
                });
        }
        catch (error) {
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }


    const traerTrazabilidad = async () => {
        setLoadingLogs(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                ...paginacion, ...ordenamiento,
                idNorma: props?.props?.norma?.idNormaSDIN
            }
            let token = localStorage.getItem("token");
            await ApiPinPost(`/api/v1/sdin/logs/trazabilidad`, body, token)
                .then((res) => {
                    setLogs(res.data.logs)
                    setAuxLogs(res.data.logs)
                    setTotalResultados(res.data.totalLogs)
                    let auxPaginacion = paginacion;
                    auxPaginacion.totalPaginas = Math.ceil(res.data.totalLogs / auxPaginacion.limite);
                    setPaginacion({ ...auxPaginacion });
                })
            setLoadingLogs(false)
        }
        catch (error) {
            setLoadingLogs(false)
            // console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const handleSearch = (e) => {
        setFormAux({
            ...formAux,
            [e.target.name]: e.target.value
        })
    }

    const filtroLogs = async (e) => {
        e.preventDefault()
        setLoading(true);
        try {
            let body = {
                user: parseInt(formAux.user),
                idNorma: parseInt(formAux.idNorma),
                idTipoOperacion: parseInt(formAux.idTipoOperacion),
                fechaDesde: formAux?.fechaDesde,
                fechaHasta: formAux?.fechaHasta,
                usuario: localStorage.getItem("user_cuit"),
                ...paginacion, ...ordenamiento
            }
            let token = localStorage.getItem("token");
            await ApiPinPost(`/api/v1/sdin/logs/trazabilidad`, body, token)
                .then((res) => {
                    setLogs(res.data.logs)
                    setTotalResultados(res.data.totalLogs)
                    let auxPaginacion = paginacion;
                    auxPaginacion.totalPaginas = Math.ceil(res.data.totalLogs / auxPaginacion.limite);
                    auxPaginacion.botones = [];
                    for (let i = 1; i <= paginacion.totalPaginas; i++) {
                        auxPaginacion.botones.push(i)
                    }
                    setPaginacion({ ...auxPaginacion });
                }).catch(function (error) {
                    setLoading(false)
                    console.log(error);
                });
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            console.log(error);
            linkToParams('/', {}, navigate)
        }
    }

    const vacio = (e) => {
        e.preventDefault()
        setFormAux({ ...initForm })
    }

    const TablaTrazabilidad = ({ logs }) => {
        return (
            <table class="table table-bordered table-hover" >
                <thead>
                    <tr>
                        <th className="col-2">Id Norma</th>
                        <th className="col-5">Operación</th>
                        <th className="col-3">Tipo Operación</th>
                        <th className="col-3">Usuario</th>
                        <th className="col-2">Fecha</th>
                        <th className="col-2">Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        logs.length > 0 ? (
                            logs.map(n => (
                                <tr>
                                    <td>{n.idNorma}</td>
                                    <td>{decode(n.operacion)}</td>
                                    <td>{n.nombre_operacion}</td>
                                    <td>{n.apellidoNombre}</td>
                                    <td>{moment(n.fechaHora).format('DD/MM/YYYY')}</td>
                                    <td>{moment(n.fechaHora).format('HH:mm')}</td>
                                </tr>
                            ))
                        )
                            : (<tr><td>Sin datos...</td></tr>)
                    }
                </tbody>
            </table>
        )
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await traerTrazabilidad()
        }
    }, [paginacion])

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    const handleCantidadLogs = (e) => {
        let auxPaginacion = paginacion;
        auxPaginacion.limite = e;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    useEffect(() => {
        traerTrazabilidad()
        traerUsuarios()
        traerTipos()
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5">
                    <div className="accordion" id="accordion">
                        <div className="card" id="pagina-filtros">
                            <button
                                id="boton1"
                                className="card-header card-link collapsed"
                                data-toggle="collapse"
                                data-target="#collapse1"
                            >
                                Filtros de Búsqueda
                            </button>
                            <div id="collapse1" className="collapse" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                        <form className="form"
                                            onSubmit={(e) => filtroLogs(e)}
                                        >
                                            <div className="form-group">
                                                <label for="user">Usuario</label>
                                                <select
                                                    name="user"
                                                    className="custom-select"
                                                    id="user"
                                                    placeholder="Seleccione un usuario..."
                                                    onChange={(e) => handleSearch(e)}
                                                    value={formAux.user}
                                                >
                                                    <option value=""></option>
                                                    {user && user.length > 0 ? (
                                                        user.map(n => (
                                                            <option value={n.idUsuario} key={n.idUsuario}>{n.apellidoNombre}</option>
                                                        ))
                                                    ) : (
                                                        <option disabled>No hay usuarios.</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idTipoOperacion">Tipo de Operación</label>
                                                <select
                                                    name="idTipoOperacion"
                                                    className="custom-select"
                                                    id="idTipoOperacion"
                                                    placeholder="Seleccione un tipo..."
                                                    onChange={(e) => handleSearch(e)}
                                                    value={formAux.idTipoOperacion}
                                                >
                                                    <option value=""></option>
                                                    {tipos && tipos.length > 0 ? (
                                                        tipos.map(n => (
                                                            <option value={n.idTipoOperacion} key={n.idTipoOperacion}>{n.nombre_operacion}</option>
                                                        ))
                                                    ) : (
                                                        <option disabled>No hay Tipos.</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label for="idNorma">Id Norma</label>
                                                <input type="number" className="form-control" id="idNorma" name="idNorma" pattern="[0-9]*"
                                                    onChange={e => handleSearch(e)} value={initForm.idNorma}
                                                    disabled={detalle === 1}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label for="fechaDesde">Rango de Fechas</label>
                                                <div className="rango-fechas">
                                                    <input type="date"
                                                        className="form-control"
                                                        id="fechaDesde"
                                                        name="fechaDesde"
                                                        aria-describedby="date-help"
                                                        onChange={(e) => handleSearch(e)} value={formAux.fechaDesde}
                                                    />
                                                    -
                                                    <input type="date"
                                                        className="form-control"
                                                        id="fechaHasta"
                                                        name="fechaHasta"
                                                        aria-describedby="date-help"
                                                        onChange={e => handleSearch(e)} value={formAux.fechaHasta}
                                                    />
                                                </div>
                                            </div>
                                            <div></div>
                                            <div>
                                                <button
                                                    style={{ float: "right" }}
                                                    className="btn btn-primary m-2"
                                                    type="submit"
                                                    id="boton-buscar"
                                                >
                                                    Buscar
                                                </button>
                                                &nbsp;&nbsp;
                                                <div
                                                    style={{ float: "right" }}
                                                    class="btn btn-link m-2"
                                                    onClick={(e) => { vacio(e) }}
                                                    id="boton-borrar-filtros"
                                                >
                                                    Borrar Filtros
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(loadingLogs) ? (<Spinner />) :
                        logs && (logs.length > 0) ? (
                            <div className="container responsive mb-5" class="resultados" id="resultados-busqueda">
                                <TablaTrazabilidad logs={logs} />
                                <br />
                            </div>
                        ) : (
                            <div>
                                <br />
                                <option disabled>No hay datos para los filtros aplicados.</option>
                                <br />
                            </div>
                        )}
                    {paginacion && logs?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => { setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true }) }} />
                    </div>}
                </div>
            </>
        )
    }
}

export default Logs