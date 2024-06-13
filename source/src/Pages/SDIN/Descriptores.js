import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BiLastPage, BiFirstPage } from "react-icons/bi";
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { decode } from 'html-entities';
import { Pagination } from '@gcba/obelisco'

const Descriptores = props => {
    const [descriptores, setDescriptores] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [isLoadingDescriptores, setLoadingDescriptores] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [descriptorBorrar, setDescriptorBorrar] = useState(null)
    const [descriptor, setDescriptor] = useState('')
    const [textoBusqueda, setTextoBusqueda] = useState()
    const [totalDescriptores, setTotalDescriptores] = useState(null)
    const [formEdicion,setFormEdicion] = useState({
        idDescriptor : null,
        descriptor : ""
    })
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        cambiarPagina: false
    })
    
    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
        let auxPaginacion = paginacion;
        auxPaginacion.cambiarPagina = false;
        setPaginacion({ ...auxPaginacion })
        await getDescriptores("")
        }
    }, [paginacion])

    function cambiarPagina(e, page) {
        e.preventDefault();
        if (page < 1 || page > paginacion.totalPaginas) return;
        let auxPaginacion = paginacion;
        auxPaginacion.paginaActual = page;
        auxPaginacion.cambiarPagina = true;
        setPaginacion({ ...auxPaginacion })
    }

    const getDescriptores = async (p) => {
        let body = {
            ...paginacion,
            usuario: localStorage.getItem("user_cuit"),
            textInput: p ? p : (textoBusqueda && textoBusqueda?.length > 0 ? textoBusqueda : '')
        }
        await ApiPinPost('/api/v1/sdin/descriptores', body, localStorage.getItem("token"))
            .then(res => {
                setDescriptores(res.data.descriptores)
                setTotalDescriptores(res.data.totalDescriptores)
                let auxPaginacion = { ...paginacion };
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalDescriptores / auxPaginacion.limite);
                setPaginacion({ ...auxPaginacion });
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            descriptor
        }
        await ApiPinPost('/api/v1/sdin/descriptores/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setDescriptor(null)
            })
            .catch()
        setLoading(false)
        getDescriptores(e.target[0]['value'])
    }
    const handleFormEdicion = async (e)=>{
        e.preventDefault()
        let value = e.target.value
        switch (e.target.name) {
            case 'descriptor':
                setFormEdicion({...formEdicion,descriptor:value})
                break;
        
            default:
                break;
        }

    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idDescriptor:id,
            descriptor: formEdicion?.descriptor    
        }
        await ApiPinPost('/api/v1/sdin/descriptores/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getDescriptores("")
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    }
    async function borrarDescriptor(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            id
        }
        await ApiPinPost('/api/v1/sdin/descriptores/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setDescriptores(descriptores.filter(n => n.id !== id))
                setShowModal(false);
            })
            .catch()

        setLoading(false)
    }
    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idDescriptor: elem.id,
            descriptor:elem.descriptor
        })
        if (habilitarEdicion){
            setFormEdicion({idDescriptor:null,descriptor:""})}
        setHabilitarEdicion(!habilitarEdicion)
        
    }

    useEffect(async () => {
        setLoading(true)
        await getDescriptores().catch()
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
                                    Nuevo Descriptor
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "80%" }}>
                                                <label for="descriptor">Descriptor</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="descriptor"
                                                    name="descriptor"
                                                    value={descriptor}
                                                    onChange={e => setDescriptor(e.target.value)}
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
                <form className="form-wrapper d-flex align-items-center justify-content-between mt-2 mb-2"
                    onSubmit={(e) => { e.preventDefault(); getDescriptores(e.target[0]['value']); setTextoBusqueda(e.target[0]['value']) }}>
                    <div class="form-group" style={{ width: "90%" }}>
                        <label for="descriptor">Buscar por Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            id="descriptor"
                            name="descriptor"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary ml-5"><FaSearch /> </button>
                </form>
                <p>Resultados ({totalDescriptores || 0}):</p>
                {isLoadingDescriptores && <Spinner />}
                {descriptores && descriptores.length > 0 && !isLoadingDescriptores &&
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID Descriptor</th>
                                <th>Descriptor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {descriptores.sort((a, b) => b.id - a.id).map((elem) => (
                                <tr>
                                    {/* <td>{elem.descriptor}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setDescriptorBorrar(elem.id); setShowModal(true) }}>
                                            <FaTrash />
                                        </button>
                                        <button type="button" className="btn btn-success btn-sm">
                                            <FaEdit />
                                        </button>
                                    </td> */}
                                    {habilitarEdicion && formEdicion.idDescriptor === elem.id ?(
                                        <>
                                            <td>{elem.id}</td>
                                            <td>
                                                <input type="text" className="form-control form-control-sm" name="descriptor" id={`desc-${elem.id}`}
                                                value={formEdicion.descriptor} onChange={(e) => handleFormEdicion(e,elem)} />
                                            </td>
                                            <td className='d-flex'>
                                                <button type="button" className="btn btn-primary btn-sm mx-2" title="Guardar"
                                                onClick={(e)=>{guardarEdicion(e,elem.id)}}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button type="button" className="btn btn-success btn-sm mx-2" onClick={(e)=>edicion(e,elem)}>
                                                    <FaEdit />
                                                </button>
                                            </td>
                                        </>
                                    ):(<>
                                            <td>{elem.id}</td>
                                            <td>{decode(elem.descriptor)}</td>
                                            <td className='d-flex'>
                                                <button type="button" className="btn btn-danger btn-sm mx-2" onClick={() => { setDescriptorBorrar(elem.id); setShowModal(true) }}>
                                                    <FaTrash />
                                                </button>
                                                <button type="button" className="btn btn-success btn-sm mx-2" onClick={(e)=>edicion(e,elem)}>
                                                    <FaEdit />
                                                </button>
                                            </td>
                                    </>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
            {paginacion && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                    </div>}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este descriptor?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarDescriptor(e, descriptorBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Descriptores;