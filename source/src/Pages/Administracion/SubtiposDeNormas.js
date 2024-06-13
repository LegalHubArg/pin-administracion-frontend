import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { Pagination } from '@gcba/obelisco'

const SubtiposDeNormas = props => {
    const [subtiposDeNormas, setSubtiposDeNormas] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [totalP, setTotalP] = useState(null)

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getTiposDeNormas()
        }
    }, [paginacion])

    const [form, setForm] = useState({
        idNormaSubtipo: null,
        normaSubtipo: "",
        normaSubtipoSigla: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idNormaSubtipo: null,
        normaSubtipo: "",
        normaSubtipoSigla: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaSubtipo':
                setForm({ ...form, normaSubtipo: value })
                break;
            case 'normaSubtipoSigla':
                setForm({ ...form, normaSubtipoSigla: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaSubtipo':
                setFormEdicion({ ...formEdicion, normaSubtipo: value })
                break;
            case 'normaSubtipoSigla':
                setFormEdicion({ ...formEdicion, normaSubtipoSigla: value })
                break;
        }
    }

    const getTiposDeNormas = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            ...paginacion
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos', body, localStorage.getItem("token"))
            .then(res => {
                setSubtiposDeNormas(res.data.data)
                setTotalP(res.data.totalSubtipos)
                setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
            })
            .catch()
    }

    const handlePaginacion = (page) => {
        setPaginacion((prevPaginacion) => ({
            ...prevPaginacion,
            paginaActual: page + 1,
            cambiarPagina: true
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            descripcion: form.normaSubtipo,
            sigla: form.normaSubtipoSigla
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    normaSubtipo: "",
                    normaSubtipoSigla: ""
                })
                getTiposDeNormas()
            })
            .catch()
        setLoading(false)
    }

    async function borrarTipo(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idNormaSubtipo: id
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getTiposDeNormas();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idNormaSubtipo: id,
            descripcion: formEdicion.normaSubtipo,
            sigla: formEdicion.normaSubtipoSigla
        }
        console.log("lo que necesito:", body)
        await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getTiposDeNormas();
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
            idNormaSubtipo: elem.idNormaSubtipo,
            normaSubtipo: elem.normaSubtipo,
            normaSubtipoSigla: elem.normaSubtipoSigla
        })
        if (habilitarEdicion) {
            setFormEdicion({ idNormaSubtipo: null, normaSubtipo: "", normaSubtipoSigla: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getTiposDeNormas().catch()
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
                                    Nuevo Subtipo de Norma
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="normaSubtipo">Subtipo de Norma</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="normaSubtipo"
                                                    name="normaSubtipo"
                                                    value={form.normaSubtipo}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="normaSubtipoSigla">Sigla</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="normaSubtipoSigla"
                                                    name="normaSubtipoSigla"
                                                    value={form.normaSubtipoSigla}
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
                {subtiposDeNormas && subtiposDeNormas.length > 0 &&
                    <>
                        <span>Se encontraron {totalP} resultados</span>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Subtipo de Norma</th>
                                    <th>Sigla</th>
                                    <th></th>
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {subtiposDeNormas.sort((a, b) => b.idNormaSubtipo - a.idNormaSubtipo).map((elem) => (<tr>
                                    {habilitarEdicion && formEdicion.idNormaSubtipo === elem.idNormaSubtipo ? <>
                                        <td><input type="text" className="form-control" name="normaSubtipo" id="normaSubtipo"
                                            value={formEdicion.normaSubtipo} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control" name="normaSubtipoSigla" id="normaSubtipoSigla"
                                            value={formEdicion.normaSubtipoSigla} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                    </>
                                        : <>
                                            <td>{elem.normaSubtipo}</td>
                                            <td>{elem.normaSubtipoSigla}</td>
                                        </>}
                                    {habilitarEdicion && formEdicion.idNormaSubtipo === elem.idNormaSubtipo &&
                                        <td>
                                            <button type="button" className="btn btn-primary btn-sm mr-2"
                                                onClick={(e) => guardarEdicion(e, elem.idNormaSubtipo)}>
                                                <FaCheck />
                                            </button>
                                        </td>}
                                    {habilitarEdicion && !(formEdicion.idNormaSubtipo === elem.idNormaSubtipo) &&
                                        <td></td>}
                                    <td>
                                        <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                            <FaEdit />
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idNormaSubtipo); setShowModal(true) }}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => handlePaginacion(page)} />
                    </>
                }
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar esta norma?</Modal.Title>
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
        </>)
};

export default SubtiposDeNormas;