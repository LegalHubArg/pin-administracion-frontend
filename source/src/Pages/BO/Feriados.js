import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';

const Feriados = props => {
    const [feriado, setFeriado] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)

    const [form, setForm] = useState({
        idFeriado: null,
        feriadoFecha: "",
        feriado: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idFeriado: null,
        feriadoFecha: "",
        feriado: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        console.log("esto:;;;" , e.target.name)
        switch (e.target.name) {
            case 'feriadoFecha':
                setForm({ ...form, feriadoFecha: value })
                break;
            case 'feriado':
                setForm({ ...form, feriado: value })
                break;
        }
        console.log("datos:", e.target.value)
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'feriadoFecha':
                setFormEdicion({ ...formEdicion, feriadoFecha: value })
                break;
            case 'feriado':
                setFormEdicion({ ...formEdicion, feriado: value })
                break;
        }
    }

    const getFeriado = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            fechaAnio: "2022",
        }
        await ApiPinPost('/api/v1/boletin-oficial/feriados', body, localStorage.getItem("token"))
            .then((res) => {
                setFeriado(res.data.data)
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            feriadoFecha: form.feriadoFecha,
            feriado: form.feriado
        }
        await ApiPinPost('/api/v1/boletin-oficial/feriados/feriado/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    feriadoFecha: "",
                    feriado: ""
                })
                getFeriado()
            })
            .catch()
        setLoading(false)
    }

    async function borrarFeriado(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idFeriado: id
        }
        await ApiPinPost('/api/v1/boletin-oficial/feriados/feriado/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getFeriado();
            })
            .catch()

        setLoading(false)
    }

    /* async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idReparticion: id,
            siglaReparticion: formEdicion.siglaReparticion,
            reparticion: formEdicion.reparticion
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getReparticion();
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    } */

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idFeriado: elem.idFeriado,
            feriadoFecha: elem.feriadoFecha,
            feriado: elem.feriado
        })
        if (habilitarEdicion) {
            setFormEdicion({ idFeriado: null, feriadoFecha: "", feriado: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getFeriado().catch()
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
                                    Nuevo Feriado
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="feriadoFecha">Fecha</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="feriadoFecha"
                                                    name="feriadoFecha"
                                                    value={form.feriadoFecha}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="feriado">Feriado</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="feriado"
                                                    name="feriado"
                                                    value={form.feriado}
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
                {feriado && feriado.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Feriado</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {feriado.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idFeriado === elem.idFeriado ? <>
                                    <td><input type="date" className="form-control" name="feriadoFecha" id="feriadoFecha"
                                        value={formEdicion.feriadoFecha} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="feriado" id="feriado"
                                        value={formEdicion.feriado} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{moment(elem["DATE(feriadoFecha)"]).format("DD/MM/YYYY")}</td>
                                        <td>{elem.feriado}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idFeriado === elem.idFeriado &&
                                    <td>
                                        {/* <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idFeriado)}>
                                            <FaCheck />
                                        </button> */}
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idFeriado === elem.idFeriado) &&
                                    <td></td>}
                                <td>
                                    {/* <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button> */}
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idFeriado); setShowModal(true) }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar esta repartición?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarFeriado(e, tipoBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Feriados;