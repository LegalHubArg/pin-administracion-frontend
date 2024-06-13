import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { Pagination } from '@gcba/obelisco'

const CausalesABM = props => {
    const [causalesABM, setCausalesABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
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

    const [form, setForm] = useState({
        idCausal: null,
        nombre: "",
        causal: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idCausal: null,
        nombre: "",
        causal: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setForm({ ...form, nombre: value })
                break;
            case 'causal':
                setForm({ ...form, causal: value })
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
            case 'causal':
                setFormEdicion({ ...formEdicion, causal: value })
                break;
            }
        }
    

    const getCausalesABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            ...paginacion
        }
        await ApiPinPost('/api/v1/sdin/abm/causales/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setCausalesABM(res.data.data)
                setTotalResultados(res.data.totalCausales)
                // console.log(res.data)
                // console.log("quiero saber: ", res.data.data)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalCausales / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({...auxPaginacion})
            })
            .catch()
    }

    console.log(paginacion)

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getCausalesABM()
        }
    }, [paginacion])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            nombre: form.nombre,
            causal: form.causal
        }
        await ApiPinPost('/api/v1/sdin/abm/causales/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    nombre: "",
                    causal: ""
                })
                getCausalesABM()
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
            idCausal: id
        }
        await ApiPinPost('/api/v1/sdin/abm/causales/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getCausalesABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idCausal: id,
            nombre: formEdicion.nombre,
            causal: formEdicion.causal
        }
        await ApiPinPost('/api/v1/sdin/abm/causales/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getCausalesABM();
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
            idCausal: elem.idCausal,
            nombre: elem.nombre,
            causal: elem.causal
        })
        if (habilitarEdicion) {
            setFormEdicion({ idCausal: null, nombre: "", causal: ""  })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getCausalesABM().catch()
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
                                    Nuevo Causal
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="nombre">Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={form.nombre}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="causal">Causal</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="causal"
                                                    name="causal"
                                                    value={form.causal}
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
                {causalesABM && causalesABM.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Causal</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {causalesABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idCausal === elem.idCausal ? <>
                                    <td>{elem.idCausal}</td>
                                    <td><input type="text" className="form-control" name="nombre" id="nombre"
                                        value={formEdicion.nombre} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="causal" id="causal"
                                        value={formEdicion.causal} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idCausal}</td>
                                        <td>{elem.nombre}</td>
                                        <td>{elem.causal}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idCausal === elem.idCausal &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idCausal)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idCausal === elem.idCausal) &&
                                    <td></td>}
                                <td>
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idCausal); setShowModal(true) }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
                {paginacion && causalesABM?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination pages={paginacion.totalPaginas}
                        onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                </div>}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este causal?</Modal.Title>
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
                        Este causal ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default CausalesABM;