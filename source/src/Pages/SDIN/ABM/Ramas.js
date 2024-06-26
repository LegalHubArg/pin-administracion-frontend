import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';

const RamasABM = props => {
    const [ramasABM, setRamasABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)

    const [form, setForm] = useState({
        idRama: null,
        rama: "",
        descripcion: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idRama: null,
        rama: "",
        descripcion: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'rama':
                setForm({ ...form, rama: value })
                break;
            case 'descripcion':
                setForm({ ...form, descripcion: value })
                break;
                
            } 
        console.log("valores=== ", e.target.value )
}

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'rama':
                setFormEdicion({ ...formEdicion, rama: value })
                break;
            case 'descripcion':
                setFormEdicion({ ...formEdicion, descripcion: value })
                break;
            }
        }
    

    const getRamasABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        }
        await ApiPinPost('/api/v1/sdin/abm/ramas/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setRamasABM(res.data.data)
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
            rama: form.rama,
            descripcion: form.descripcion
        }
        await ApiPinPost('/api/v1/sdin/abm/ramas/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    rama: "",
                    descripcion: ""
                })
                getRamasABM()
            })
            .catch( error => {{console.log(error)}
            
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
            idRama: id
        }
        await ApiPinPost('/api/v1/sdin/abm/ramas/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getRamasABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idRama: id,
            rama: formEdicion.rama,
            descripcion: formEdicion.descripcion
        }
        await ApiPinPost('/api/v1/sdin/abm/ramas/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getRamasABM();
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
            idRama: elem.idRama,
            rama: elem.rama,
            descripcion: elem.descripcion
        })
        if (habilitarEdicion) {
            setFormEdicion({ idRama: null, rama: "", descripcion: ""  })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getRamasABM().catch()
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
                                    Nueva Rama
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => {handleSubmit(e); setShowExiste(false)}}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="rama">Rama</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="rama"
                                                    name="rama"
                                                    value={form.rama}
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
                                            <button type="submit" className="btn btn-primary ml-5" >Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {ramasABM && ramasABM.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Rama</th>
                                <th>Descripción</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {ramasABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idRama === elem.idRama ? <>
                                    <td>{elem.idRama}</td>
                                    <td><input type="text" className="form-control" name="rama" id="rama"
                                        value={formEdicion.rama} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="descripcion" id="descripcion"
                                        value={formEdicion.descripcion} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idRama}</td>
                                        <td>{elem.rama}</td>
                                        <td>{elem.descripcion}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idRama === elem.idRama &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idRama)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idRama === elem.idRama) &&
                                    <td></td>}
                                <td className='d-flex'>
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idRama); setShowModal(true) }}>
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
                    <Modal.Title>Está seguro que desea eliminar esta rama?</Modal.Title>
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
                        Esta rama ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default RamasABM;