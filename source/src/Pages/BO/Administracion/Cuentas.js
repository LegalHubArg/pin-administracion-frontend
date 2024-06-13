import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaEye, FaMinus, FaTrash, FaUserCog, FaUndo } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { Pagination } from '@gcba/obelisco'
import moment from 'moment'


const Cuentas = props => {
    const [cuentas, setCuentas] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [usuarioBorrar, setUsuarioBorrar] = useState(null)
    const [usuarioDeshacer, setUsuarioDeshacer] = useState(null)
    const [aux, setAux] = useState(false)
    const [error, setError] = useState(false) //Flag de error de la página
    if (error) throw error //Lo catchea el ErrorBoundary
    const [buscador, setBuscador] = useState('')

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        emailAlternativo: "",
        cuenta: "",
        idReparticion: "",
        telefono: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idUsuario: null,
        usuario: "",
        email: "",
        apellidoNombre: "",
        existeEnSADE: true,
        numeroCOAlta: ""
    })

    const [reparticiones, setReparticiones] = useState([])

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setForm({ ...form, nombre: value })
                break;
            case 'email':
                setForm({ ...form, email: value })
                break;
            case 'emailAlternativo':
                setForm({ ...form, emailAlternativo: value })
                break;
            case 'cuenta':
                setForm({ ...form, cuenta: value })
                break;
            case 'telefono':
                setForm({ ...form, telefono: value })
                break;
            case 'reparticion':
                setForm({ ...form, idReparticion: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'usuario':
                setFormEdicion({ ...formEdicion, usuario: value })
                break;
            case 'email':
                setFormEdicion({ ...formEdicion, email: value })
                break;
            case 'apellidoNombre':
                setFormEdicion({ ...formEdicion, apellidoNombre: value })
                break;
            case 'existeEnSADE':
                setFormEdicion({ ...formEdicion, existeEnSADE: e.target.checked })
                break;
            case 'numeroCOAlta':
                setFormEdicion({ ...formEdicion, numeroCOAlta: value })
                break;
        }
    }

    const busqueda = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'busqueda':
                setBuscador(value)
                break;
        }
    }


    const getCuentas = async (vacio) => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                ...paginacion,
                buscador: vacio === '' ? vacio : buscador
            }
            await ApiPinPost(`/api/v1/boletin-oficial/cuentas`, body, localStorage.getItem("token"))
                .then((res) => {
                    setCuentas(res.data.cuentas)
                    setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
                })
        }
        catch (e) { /* throw e */ }
    }

    const getReparticiones = async () => {
        await ApiPinGet('/api/v1/organismos/reparticiones', localStorage.getItem("token"))
            .then((res) => {
                setReparticiones(res.data.data)
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            /* usuario: localStorage.getItem("user_cuit"), */
            nombre: form.nombre,
            email: form.email,
            emailAlternativo: form.emailAlternativo,
            cuenta: form.cuenta,
            telefono: form.telefono,
            idReparticion: form.idReparticion
        }
        await ApiPinPost('/api/v1/boletin-oficial/cuentas/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    nombre: "",
                    email: "",
                    emailAlternativo: "",
                    cuenta: "",
                    telefono: "",
                    idReparticion: ""
                })
                getCuentas()
            })
            .catch(e => setError(e.data.mensaje))
        setLoading(false)
    }

    async function borrarCuenta(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            idCuenta: id,
            usuario: JSON.parse(localStorage.getItem("idUsuarioBO"))
        }
        await ApiPinPost('/api/v1/boletin-oficial/cuentas/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getCuentas();
            })
            .catch()

        setLoading(false)
    }

    async function deshacerEliminarCuenta(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            idCuenta: id,
            usuario: JSON.parse(localStorage.getItem("idUsuarioBO"))
        }
        await ApiPinPost('/api/v1/boletin-oficial/cuentas/deshacerEliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getCuentas();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: id,
            usuario: formEdicion.usuario,
            email: formEdicion.email,
            apellidoNombre: formEdicion.apellidoNombre,
            existeEnSADE: formEdicion.existeEnSADE,
            numeroCOAlta: formEdicion.numeroCOAlta
        }
        await ApiPinPost('/api/v1/usuarios/usuario/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getCuentas();
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
            idUsuario: elem.idUsuario,
            usuario: elem.usuario,
            email: elem.email,
            apellidoNombre: elem.apellidoNombre,
            existeEnSADE: elem.existeEnSADE,
            numeroCOAlta: elem.numeroCOAlta
        })
        if (habilitarEdicion) {
            setFormEdicion({ idUsuario: null, usuario: "", email: "", apellidoNombre: "", existeEnSADE: "", numeroCOAlta: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getCuentas().catch(e => setError(e.data.mensaje))
        await getReparticiones().catch(e => setError(e.data.mensaje))
        setLoading(false)
    }, [])

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getCuentas()
        }
    }, [paginacion])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5" style={{ overflow: "auto" }}>
                <div id="accordion" className="mt-1">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapseOne"
                                >
                                    Nueva Cuenta
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center flex-wrap" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "25%" }}>
                                                <label for="nombre">Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={form.nombre}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "35%" }}>
                                                <label for="email">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm"
                                                    id="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "35%" }}>
                                                <label for="emailAlternativo">Email alternativo</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm"
                                                    id="emailAlternativo"
                                                    name="emailAlternativo"
                                                    value={form.emailAlternativo}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "20%" }}>
                                                <label for="cuenta">Cuenta</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="cuenta"
                                                    name="cuenta"
                                                    value={form.cuenta}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "30%" }}>
                                                <label for="telefono">Telefono</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="telefono"
                                                    name="telefono"
                                                    value={form.telefono}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "30%" }}>
                                                <label for="reparticion">Repartición</label>
                                                <select
                                                    className="form-control form-control-sm"
                                                    id="reparticion"
                                                    name="reparticion"
                                                    value={form.idReparticion}
                                                    onChange={(e) => handleForm(e)}
                                                >
                                                    <option value="">Selecciona una opción</option>
                                                    {reparticiones.map(repa =>
                                                        <option value={repa.idReparticion}>{repa.reparticion}</option>
                                                    )}
                                                </select>
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <br></br>
                <div>
                    <h2>Buscador</h2>

                    <div className="card-body">
                        <div className="form-group ml-1" /* style={{ width: "35%" }} */>
                            <div className="row">
                                <div className="col-md-9">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        id="busqueda"
                                        name="busqueda"
                                        placeholder="Filtrar por cuenta, nombre o repartición"
                                        onKeyDown={e => e.code === "Enter" ? getCuentas() : null}
                                        onChange={busqueda}
                                        value={buscador}
                                    />
                                </div>
                                <div className="col-md-3" style={{display:"flex", justifyContent:"center"}}>
                                <button
                                        type="submit"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {setBuscador(''); getCuentas('')}}
                                        style={{marginRight:"14px", width:"100%"}}
                                    >
                                        Borrar Filtros
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={()=>getCuentas()}
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <br></br>


                {cuentas && cuentas.length > 0 &&
                    <div className="d-flex flex-column align-items-center">
                        <table className="table table-bordered table-striped" style={{ fontSize: 14 }}>
                            <thead>
                                <tr>
                                    <th>Cuenta</th>
                                    <th>Nombre</th>
                                    <th>Repartición</th>
                                    <th>Última modificación</th>
                                    <th></th>
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {cuentas.map((elem) => (<tr style={elem.estado === 4 ? { backgroundColor: "#C93B3B", color: "white" } : {}}>
                                    {/* {habilitarEdicion && formEdicion.idUsuario === elem.idUsuario ? <>
                                        <td><input disabled type="text" className="form-control form-control-sm" name="usuario" id="usuario"
                                            value={formEdicion.usuario} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="email" id="email"
                                            value={formEdicion.email} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="apellidoNombre" id="apellidoNombre"
                                            value={formEdicion.apellidoNombre} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="checkbox" name="existeEnSADE" id="existeEnSADE"
                                            checked={!!formEdicion.existeEnSADE} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                    </>
                                        : <> */}
                                    <td>{elem.sigla}</td>
                                    <td>{elem.nombre}</td>
                                    <td>{elem.reparticion}</td>
                                    <td>{elem.fechaModificacion !== null ? moment(elem.fechaModificacion).format("DD/MM/YYYY h:mm:ss") : ''}</td>
                                    {/* </> */}
                                    {habilitarEdicion && formEdicion.idUsuario === elem.idUsuario &&
                                        <td>
                                            <button type="button" className="btn btn-primary btn-sm mr-2"
                                                onClick={(e) => guardarEdicion(e, elem.idUsuario)}>
                                                <FaCheck />
                                            </button>
                                        </td>}
                                    {habilitarEdicion && !(formEdicion.idUsuario === elem.idUsuario) &&
                                        <td></td>}
                                    <td className="d-flex">
                                        <Link title="Ver" className="btn btn-link btn-sm mr-2" to={String(elem.idCuenta)}>
                                            <FaEye />
                                        </Link>
                                        
                                        {elem.estado === 4 ? <button type="button" title="Deshacer eliminado" className="btn btn-primary btn-sm"
                                            onClick={() => { 
                                                setAux(true); 
                                                setUsuarioDeshacer(elem.idCuenta)
                                                setShowModal(true) 
                                                }}>
                                            <FaUndo />
                                        </button> : <button type="button" title="Borrar" className="btn btn-danger btn-sm"
                                            onClick={() => { 
                                                setAux(false); 
                                                setUsuarioBorrar(elem.idCuenta)
                                                setShowModal(true) 
                                                }}>
                                            <FaTrash />
                                        </button>}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                    </div>
                }
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    {aux ? 
                    <Modal.Title>{`Está seguro que desea dar de alta este usuario? ${usuarioDeshacer}`}</Modal.Title> 
                    :
                    <Modal.Title>{`Está seguro que desea eliminar este usuario? ${usuarioBorrar}`}</Modal.Title>}
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => {
                        aux ? deshacerEliminarCuenta(e, usuarioDeshacer) : borrarCuenta(e, usuarioBorrar)
                        }
                        }>Confirmar</button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Cuentas;