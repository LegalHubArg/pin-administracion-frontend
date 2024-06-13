import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';

const PatologiasABM = props => {
    const [patologiasABM, setPatologiasABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)

    const [form, setForm] = useState({
        idPatologiaNormativa: null,
        nombre: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idPatologiaNormativa: null,
        nombre: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setForm({ ...form, nombre: value })
                break;
                
            } 
        console.log("valores=== ", e.target.value )
}

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setFormEdicion({ ...formEdicion, nombre: value })
                break;
            }
        }
    

    const getPatologiasABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        }
        await ApiPinPost('/api/v1/sdin/abm/patologias/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setPatologiasABM(res.data.data)
                console.log("quiero saber: ", res.data.data)
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            nombre: form.nombre
        }
        await ApiPinPost('/api/v1/sdin/abm/patologias/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    nombre: ""
                })
                getPatologiasABM()
            })
            .catch(error => {
            setShowExiste(true)
            })
        setLoading(false)
    }

    async function borrarUsuario(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idPatologiaNormativa: id
        }
        await ApiPinPost('/api/v1/sdin/abm/patologias/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getPatologiasABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idPatologiaNormativa: id,
            nombre: formEdicion.nombre
        }
        await ApiPinPost('/api/v1/sdin/abm/patologias/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getPatologiasABM();
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
            idPatologiaNormativa: elem.idPatologiaNormativa,
            nombre: elem.nombre
        })
        if (habilitarEdicion) {
            setFormEdicion({ idPatologiaNormativa: null, nombre: ""  })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getPatologiasABM().catch()
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
                                    Nueva Patologia
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="nombre">Nombre de la Patologia</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={form.nombre}
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
                {patologiasABM && patologiasABM.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre de la Patologia</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {patologiasABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idPatologiaNormativa === elem.idPatologiaNormativa ? <>
                                    <td>{elem.idPatologiaNormativa}</td>
                                    <td><input type="text" className="form-control" name="nombre" id="nombre"
                                        value={formEdicion.nombre} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idPatologiaNormativa}</td>
                                        <td>{elem.nombre}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idPatologiaNormativa === elem.idPatologiaNormativa &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idPatologiaNormativa)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idPatologiaNormativa === elem.idPatologiaNormativa) &&
                                    <td></td>}
                                <td>
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idPatologiaNormativa); setShowModal(true) }}>
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
                    <Modal.Title>Está seguro que desea eliminar esta patologia?</Modal.Title>
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
                        Esta patología ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default PatologiasABM;