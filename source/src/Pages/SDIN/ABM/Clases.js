import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';

const ClasesABM = props => {
    const [clasesABM, setClasesABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)

    const [form, setForm] = useState({
        idClase: null,
        clase: "",
        descripcion: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idClase: null,
        clase: "",
        descripcion: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'clase':
                setForm({ ...form, clase: value })
                break;
            case 'descripcion':
                setForm({ ...form, descripcion: value })
                break;

        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'clase':
                setFormEdicion({ ...formEdicion, clase: value })
                break;
            case 'descripcion':
                setFormEdicion({ ...formEdicion, descripcion: value })
                break;
        }
    }


    const getClasesABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        }
        await ApiPinPost('/api/v1/sdin/abm/clases/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setClasesABM(res.data.data)
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            clase: form.clase,
            descripcion: form.descripcion
        }
        await ApiPinPost('/api/v1/sdin/abm/clases/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    clase: "",
                    descripcion: ""
                })
                getClasesABM()
            })
            .catch(error =>
                setShowExiste(true))
        setLoading(false)
    }

    async function borrarUsuario(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idClase: id
        }
        await ApiPinPost('/api/v1/sdin/abm/clases/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getClasesABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idClase: id,
            clase: formEdicion.clase,
            descripcion: formEdicion.descripcion
        }
        await ApiPinPost('/api/v1/sdin/abm/clases/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getClasesABM();
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
            idClase: elem.idClase,
            clase: elem.clase,
            descripcion: elem.descripcion
        })
        if (habilitarEdicion) {
            setFormEdicion({ idClase: null, clase: "", descripcion: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getClasesABM().catch()
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
                                    Nueva Clase
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="clase">Clase</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="clase"
                                                    name="clase"
                                                    value={form.clase}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="descripcion">Descripción</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="descripcion"
                                                    name="descripcion"
                                                    value={form.descripcion}
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
                {clasesABM && clasesABM.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Clase</th>
                                <th>Descripción</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {clasesABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idClase === elem.idClase ? <>
                                    <td>{elem.idClase}</td>
                                    <td><input type="text" className="form-control" name="clase" id="clase"
                                        value={formEdicion.clase} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="descripcion" id="descripcion"
                                        value={formEdicion.descripcion} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idClase}</td>
                                        <td>{elem.clase}</td>
                                        <td>{elem.descripcion}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idClase === elem.idClase &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idClase)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idClase === elem.idClase) &&
                                    <td></td>}
                                <td>
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idClase); setShowModal(true) }}>
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
                    <Modal.Title>Está seguro que desea eliminar esta clase?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarUsuario(e, tipoBorrar)}>
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
                        Esta clase ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default ClasesABM;