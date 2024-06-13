import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import TiposDeNorma from '../../../Controllers/SDIN/TiposDeNormaController';
import { Pagination } from '@gcba/obelisco'

const TemasABM = props => {
    const [tiposNormaABM, setTiposNormaABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [ramas, setRamas] = useState([])
    const [ramaNorma, setRamaNorma] = useState()
    const [totalResultados, setTotalResultados] = useState(null)

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
    /* const [idRama, setIdRama] = useState(''); */

    const [form, setForm] = useState({
        normaTipo: "",
        nomenclatura: "",
        sigla: "",
        orden: null
    })

    const [formEdicion, setFormEdicion] = useState({
        idNormaTipo: null,
        normaTipo: "",
        nomenclatura: "",
        sigla: "",
        orden: null
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaTipo':
                setForm({ ...form, normaTipo: value })
                break;
            case 'nomenclatura':
                setForm({ ...form, nomenclatura: value })
                break;
            case 'sigla':
                setForm({ ...form, sigla: value })
                break;
            case 'orden':
                setForm({ ...form, orden: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaTipo':
                setFormEdicion({ ...formEdicion, normaTipo: value })
                break;
            case 'sigla':
                setFormEdicion({ ...formEdicion, sigla: value })
                break;
            case 'nomenclatura':
                setFormEdicion({ ...formEdicion, nomenclatura: value })
                break;
            case 'orden':
                setFormEdicion({ ...formEdicion, orden: value })
                break;
        }
    }


    const getTiposNormaABM = async () => {
        if (paginacion.paginaActual && paginacion.limite) {
            await ApiPinGet(`/api/v1/sdin/normas/tipos?paginaActual=${paginacion?.paginaActual}&limite=${paginacion?.limite}`, localStorage.getItem("token"))
                .then((res) => {
                    setTiposNormaABM(res.data.data)
                    setTotalResultados(res.data.total)
                    let auxPaginacion = paginacion;
                    auxPaginacion.totalPaginas = Math.ceil(res.data.total / auxPaginacion.limite);
                    auxPaginacion.botones = [];
                    for (let i = 1; i <= paginacion.totalPaginas; i++) {
                        auxPaginacion.botones.push(i)
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getTiposNormaABM()
        }
    }, [paginacion])


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            normaTipo: form.normaTipo,
            nomenclatura: form.nomenclatura,
            sigla: form.sigla,
            orden: form.orden
        }
        await ApiPinPost('/api/v1/sdin/abm/normas/tipos/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    normaTipo: "",
                    nomenclatura: "",
                    sigla: "",
                    orden: null
                })
                getTiposNormaABM()
            })
            .catch(error =>
                setShowExiste(true))
        setLoading(false)
    }

    async function borrarTipo(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idNormaTipo: id
        }
        await ApiPinPost('/api/v1/sdin/abm/normas/tipos/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getTiposNormaABM()
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idNormaTipo: id,
            normaTipo: formEdicion.normaTipo,
            nomenclatura: formEdicion.nomenclatura,
            sigla: formEdicion.sigla,
            orden: formEdicion.orden
        }
        await ApiPinPost('/api/v1/sdin/abm/normas/tipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getTiposNormaABM()
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    }

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idNormaTipo: elem.idNormaTipo,
            normaTipo: elem.normaTipo,
            nomenclatura: elem.nomenclatura,
            sigla: elem.sigla,
            orden: elem.orden
        })
        if (habilitarEdicion) {
            setFormEdicion({ idNormaTipo: null, normaTipo: "", sigla: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getTiposNormaABM()
        /* await getRamas(); */
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5">
                <div id="accordion">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapseOne"
                                >
                                    Nuevo Tipo de Norma
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group ml-5">
                                                <label for="normaTipo">Tipo de Norma</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="normaTipo"
                                                    name="normaTipo"
                                                    value={form.normaTipo}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="nomenclatura">Nomenclatura</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nomenclatura"
                                                    name="nomenclatura"
                                                    value={form.nomenclatura}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="sigla">Sigla</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="sigla"
                                                    name="sigla"
                                                    value={form.sigla}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="orden">Orden</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="orden"
                                                    name="orden"
                                                    value={form.orden}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p>Resultados ({totalResultados}): </p>
                {
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tipo de Norma</th>
                                <th>Nomenclatura</th>
                                <th>Sigla</th>
                                <th>Orden</th>
                                <th>Acciones</th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tiposNormaABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idNormaTipo === elem.idNormaTipo ? <>
                                    <td>{elem.idNormaTipo}</td>
                                    <td><input type="text" className="form-control form-control-sm" name="normaTipo" id="normaTipo"
                                        value={formEdicion.normaTipo} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control form-control-sm" name="nomenclatura" id="nomenclatura"
                                        value={formEdicion.nomenclatura} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control form-control-sm" name="sigla" id="sigla"
                                        value={formEdicion.sigla} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="number" className="form-control form-control-sm" name="orden" id="orden"
                                        value={formEdicion.orden} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idNormaTipo}</td>
                                        <td>{elem.normaTipo}</td>
                                        <td>{elem.nomenclatura}</td>
                                        <td>{elem.sigla}</td>
                                        <td>{elem.orden}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idNormaTipo === elem.idNormaTipo &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idNormaTipo)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idNormaTipo === elem.idNormaTipo) &&
                                    <td></td>}
                                <td className="d-flex">
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)} >
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idNormaTipo); setShowModal(true) }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>

            {paginacion && tiposNormaABM?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination pages={paginacion.totalPaginas}
                    onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
            </div>}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este tema?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarTipo(e, tipoBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={showExiste} onHide={() => setShowExiste(true)}>
                <Modal.Header>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <h1>
                        Este tema ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default TemasABM;