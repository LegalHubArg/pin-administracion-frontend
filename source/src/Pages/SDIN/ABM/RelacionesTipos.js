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


const RelacionesTiposABM = props => {
    const [relacionesTiposABM, setRelacionesTiposABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [totalResultados, setTotalResultados] = useState(null)

    const [form, setForm] = useState({
        idRelacion: null,
        relacion: "",
        descripcion: "",
        tipo: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idRelacion: null,
        relacion: "",
        descripcion: "",
        tipo: ""
    })

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

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getRelacionesTiposABM()
        }
    }, [paginacion])

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'relacion':
                setForm({ ...form, relacion: value })
                break;
            case 'descripcion':
                setForm({ ...form, descripcion: value })
                break;
            case 'tipo':
                setForm({ ...form, tipo: value })
                break;
                
            } 
        console.log("valores=== ", e.target.value )
}

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        // console.log(value)
        switch (e.target.name) {
            case 'relacion':
                setFormEdicion({ ...formEdicion, relacion: value })
                break;
            case 'descripcion':
                setFormEdicion({ ...formEdicion, descripcion: value })
                break;
            case 'tipo':
                setFormEdicion({ ...formEdicion, tipo: value })
                break;
            }
        }
    

    const getRelacionesTiposABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            ...paginacion
        }
        await ApiPinPost('/api/v1/sdin/abm/relaciones-tipos/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setRelacionesTiposABM(res.data.data)
                setTotalResultados(res.data.totalRelacionesTipos)
                let auxPaginacion = paginacion;            
            auxPaginacion.totalPaginas = Math.ceil(res.data.totalRelacionesTipos / auxPaginacion.limite);
            auxPaginacion.botones = [];
            for (let i = 1; i <= paginacion.totalPaginas; i++) {
                auxPaginacion.botones.push(i)
            }
            setPaginacion({ ...auxPaginacion })
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            relacion: form.relacion,
            descripcion: form.descripcion,
            tipo: form.tipo
        }
        await ApiPinPost('/api/v1/sdin/abm/relaciones-tipos/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    relacion: "",
                    descripcion: "",
                    tipo: ""
                })
                getRelacionesTiposABM()
            })
            .catch(error => 
                setShowExiste(true));
        setLoading(false)
    }

    async function borrarUsuario(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idRelacion: id
        }
        await ApiPinPost('/api/v1/sdin/abm/relaciones-tipos/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getRelacionesTiposABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idRelacion: id,
            relacion: formEdicion.relacion,
            descripcion: formEdicion.descripcion,
            tipo: formEdicion.tipo
        }
        await ApiPinPost('/api/v1/sdin/abm/relaciones-tipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getRelacionesTiposABM();
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
            idRelacion: elem.idRelacion,
            relacion: elem.relacion,
            descripcion: elem.descripcion,
            tipo: elem.tipo
        })
        if (habilitarEdicion) {
            setFormEdicion({ idRelacion: null, relacion: "", descripcion: "", tipo: ""  })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getRelacionesTiposABM().catch()
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
                                    Nueva Relación
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group">
                                                <label for="relacion">Relación</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="relacion"
                                                    name="relacion"
                                                    value={form.relacion}
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
                                            <div class="form-group ml-5">
                                                <label for="tipo">Tipo</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="tipo"
                                                    name="tipo"
                                                    value={form.tipo}
                                                    onChange={e => handleForm(e)}
                                                    maxLength={2}
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
                {relacionesTiposABM && relacionesTiposABM.length > 0 &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Relacion</th>
                                <th>Descripción</th>
                                <th>Tipo</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {relacionesTiposABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idRelacion === elem.idRelacion ? <>
                                    <td>{elem.idRelacion}</td>
                                    <td><input type="text" className="form-control" name="relacion" id="relacion"
                                        value={formEdicion.relacion} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="descripcion" id="descripcion"
                                        value={formEdicion.descripcion} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control" name="tipo" id="tipo"
                                        value={formEdicion.tipo} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                </>
                                    : <>
                                        <td>{elem.idRelacion}</td>
                                        <td>{elem.relacion}</td>
                                        <td>{elem.descripcion}</td>
                                        <td>{elem.tipo}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idRelacion === elem.idRelacion &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idRelacion)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idRelacion === elem.idRelacion) &&
                                    <td></td>}
                                <td className="d-flex">
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idRelacion); setShowModal(true) }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
                {paginacion && relacionesTiposABM?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination pages={paginacion.totalPaginas}
                        onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                </div>}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar esta relación?</Modal.Title>
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
                        Esta relación ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default RelacionesTiposABM;