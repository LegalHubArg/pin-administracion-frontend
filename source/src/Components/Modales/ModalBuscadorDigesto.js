import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { ApiPinPost, ApiPinGet } from "../../Helpers/ApiComunicator";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import Spinner from '../Spinner/Spinner'
import { decode } from "html-entities";
import { Pagination } from '@gcba/obelisco'

export const ModalBuscador = ({ setNormaActiva }) => {
    const [showModal, setShowModal] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [normaTipos, setNormaTipos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [analistas, setAnalistas] = useState([]);
    const [totalResultados, setTotalResultados] = useState(null);
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNormaSDIN',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })
    const initForm = {
        idNormaTipo: null,
        idNormaSDIN: null,
        fechaSancion: '',
        idNormasEstadoTipo: null,
        normaAnio: '',
        normaNumero: '',
        usuarioAsignado: null
    }
    const [form, setForm] = useState(initForm);
    const [normas, setNormas] = useState([]);
    useEffect(async () => {
        await getNormaTipos()
        await getAnalistas()
        await getEstados()
    }, [])

    const getAnalistas = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/usuarios/sdin', body, token).then((res) => {
                setAnalistas(Array.from(res.data.data))
            }).catch(function (error) {
                throw error
            });
        }
        catch (error) {
        }
    }
    const getNormaTipos = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/sdin/normas/tipos', token).then((res) => {
                setNormaTipos(Array.from(res.data.data))
            }).catch(function (error) {
                throw error
            });
        }
        catch (error) {
        }
    }
    const getEstados = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/sdin/normas/estados', token).then((res) => {
                setEstados(Array.from(res.data.data))
            }).catch(function (error) {
                throw error
            });
        }
        catch (error) {
        }
    }

    const buscarNormas = async (e) => {
        e?.preventDefault();
        setLoadingTable(true)
        let body = { ...form, ...paginacion, ...ordenamiento, usuario: localStorage.getItem("user_cuit") };
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/sdin/normas', body, token).then((res) => {
            setNormas(res.data.normas)
            setTotalResultados(res.data.totalNormas)
            let auxPaginacion = paginacion;
            auxPaginacion.totalPaginas = Math.ceil(res.data.totalNormas / auxPaginacion.limite);
            auxPaginacion.botones = [];
            for (let i = 1; i <= paginacion.totalPaginas; i++) {
                auxPaginacion.botones.push(i)
            }
        }).catch(function (error) {
            // console.log(error);
        });
        setLoadingTable(false)
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await buscarNormas()
        }
    }, [paginacion])

    function cambiarPagina(e, btn) {
        e.preventDefault();
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = btn;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    function borrarFiltros(e) {
        e.preventDefault()
        setForm(initForm)
    }

    const seleccionarNorma = (e, norma) => {
        e.preventDefault();
        setNormaActiva(norma)
        setShowModal(false)
    }

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'idNormaTipo':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['idNormaTipo']: value })
                break;
            case 'idNormaSDIN':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['idNormaSDIN']: value })
                break;
            case 'fechaSancion':
                value = e.target.value;
                setForm({ ...form, ['fechaSancion']: value })
                break;
            case 'normaAnio':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['normaAnio']: value })
                break;
            case 'normaNumero':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['normaNumero']: value })
                break;
            case 'usuarioAsignado':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['usuarioAsignado']: value })
                break;
            case 'idNormasEstadoTipo':
                value = e.target.value;
                if (isNaN(parseInt(value))) {
                    value = '';
                }
                setForm({ ...form, ['idNormasEstadoTipo']: value })
                break;
        }
    }

    return (
        <>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}
                style={{ marginLeft: "2px", maxHeight: "100%" }}>
                <FaSearch />
            </button>
            <Modal
                size="lg"
                show={showModal}
                onHide={() => setShowModal(false)}
            >
                <Modal.Header>
                    <Modal.Title>
                        Buscar Normas
                    </Modal.Title>
                    <button type="button" className="btn" style={{ padding: 0 }} onClick={() => setShowModal(false)}><FaTimes /></button>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "500px", overflow: "auto" }}>
                    <div className="form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", columnGap: "1vh" }}>
                        <div className="form-group">
                            <label for="idNormaSDIN">idNorma</label>
                            <input type="number" className="form-control form-control-sm" id="idNormaSDIN" name="idNormaSDIN"
                                onChange={e => handleFormChange(e)} value={(form.idNormaSDIN != null) ? form.idNormaSDIN : ''}
                            />
                        </div>
                        <div className="form-group">
                            <label for="normaNumero">Número</label>
                            <input type="text" className="form-control form-control-sm" id="normaNumero" name="normaNumero" pattern="[0-9]*"
                                onChange={e => handleFormChange(e)} value={(form.normaNumero)}
                            />
                        </div>
                        <div className="form-group">
                            <label for="fechaSancion">Fecha Sanción</label>
                            <input type="date" className="form-control form-control-sm" id="fechaSancion" name="fechaSancion"
                                onChange={e => handleFormChange(e)} value={(form.fechaSancion)}
                            />
                        </div>
                        <div className="form-group">
                            <label for="idNormaTipo">Tipo de Norma</label>
                            <select className="custom-select custom-select-sm" id="idNormaTipo" name="idNormaTipo"
                                onChange={e => handleFormChange(e)} value={form.idNormaTipo != null ? form.idNormaTipo : -1}
                            ><option selected value=""></option>
                                {normaTipos && normaTipos.length > 0 ?
                                    normaTipos.map((elem) => (
                                        <option key={"opt-" + elem.idNormaTipo} value={elem.idNormaTipo}>{decode(elem.normaTipo)}</option>
                                    )) : <option selected hidden>No hay tipos de norma...</option>}
                            </select>
                        </div>
                        <div className="form-group">
                            <label for="usuarioAsignado">Analista</label>
                            <select className="custom-select custom-select-sm" id="usuarioAsignado" name="usuarioAsignado"
                                onChange={e => handleFormChange(e)} value={(form.usuarioAsignado != null) ? form.usuarioAsignado : -1}
                            ><option selected value=""></option>
                                {analistas && analistas.length > 0 ?
                                    analistas.map((elem) => (
                                        <option key={"opt-" + elem.idUsuario} value={elem.idUsuario}>{decode(elem.apellidoNombre)}</option>
                                    )) : <option selected hidden>No hay usuarios para mostrar...</option>}
                            </select>
                        </div>
                        <div className="form-group">
                            <label for="idNormasEstadoTipo">Estado</label>
                            <select className="custom-select custom-select-sm" id="idNormasEstadoTipo" name="idNormasEstadoTipo"
                                onChange={e => handleFormChange(e)} value={(form.idNormasEstadoTipo != null) ? form.idNormasEstadoTipo : -1}
                            ><option selected value=""></option>
                                {estados && estados.length > 0 ?
                                    estados.map((elem) => (
                                        <option key={"opt-" + elem.idNormasEstadoTipo} value={elem.idNormasEstadoTipo}>{decode(elem.normasEstadoTipo)}</option>
                                    )) : <option selected hidden>No hay estados para mostrar...</option>}
                            </select>
                        </div>
                        <div class="btn btn-link m-2 btn-sm" onClick={(e) => borrarFiltros(e)} id="boton-borrar-filtros">Borrar Filtros</div>
                        <button type="button" className="btn btn-primary m-2 btn-sm" style={{ gridColumn: "2/3" }} onClick={(e) => buscarNormas(e)}>Buscar</button>
                    </div>
                    {loadingTable ? <Spinner /> : (
                        normas && normas.length > 0 &&
                        <table className="table table-sm" style={{ fontSize: "12px" }}>
                            <thead>
                                <tr>
                                    <th>idNorma</th>
                                    <th>Tipo de Norma</th>
                                    <th>Número</th>
                                    <th>Estado</th>
                                    <th>Analista</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {normas.map((n) => (
                                    <tr>
                                        <td>{n.idNormaSDIN}</td>
                                        <td>{decode(n.normaTipo)}</td>
                                        <td>{n.normaNumero}</td>
                                        <td>{decode(n.normasEstadoTipo)}</td>
                                        <td>{n.analista ? n.analista : "Sin analista"}</td>
                                        <td><button className="btn btn-sm btn-success" onClick={(e) => seleccionarNorma(e, n)}>Seleccionar</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <br />
                    {paginacion && normas?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                    </div>}
                </Modal.Body>
            </Modal>
        </>
    )
}