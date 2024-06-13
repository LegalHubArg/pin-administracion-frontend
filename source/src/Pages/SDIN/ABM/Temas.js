import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Pagination } from '@gcba/obelisco'
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
//HTML decode
import { decode } from 'html-entities';

const TemasABM = props => {
    const [temasABM, setTemasABM] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showHabilitar, setShowHabilitar] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [habilitar, setHabilitar] = useState(null)
    const [ramas, setRamas] = useState([])
    const [ramaNorma, setRamaNorma] = useState()
    
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'idNormaSDIN',
        orden: 'DESC',
        cambiarOrdenamiento: false
    })

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 25,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })
    
    /* const [idRama, setIdRama] = useState(''); */

    const [form, setForm] = useState({
        idTema: null,
        tema: "",
        descripcion: "",
        idRama: null
    })

    const [formEdicion, setFormEdicion] = useState({
        idTema: null,
        tema: "",
        descripcion: "",
        idRama: null,
        estado: null
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'tema':
                setForm({ ...form, tema: value })
                break;
            case 'descripcion':
                setForm({ ...form, descripcion: value })
                break;
            case 'ramas':
                setForm({ ...form, idRama: parseInt(value) })
                break;
                
            }
}

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'tema':
                setFormEdicion({ ...formEdicion, tema: value })
                break;
            case 'descripcion':
                setFormEdicion({ ...formEdicion, descripcion: value })
                break;
            case 'ramas':
                setFormEdicion({ ...formEdicion, idRama: parseInt(value)})
                break;
            case 'estado':
                setFormEdicion({ ...formEdicion, estado: parseInt(value)})
                break;
            }
        }
    

    const getTemasABM = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            ...paginacion, ...ordenamiento 
        }
        await ApiPinPost('/api/v1/sdin/abm/temas/traer', body, localStorage.getItem("token"))
            .then((res) => {
                setTemasABM(res.data.temas)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalTemas / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({ ...auxPaginacion });
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            tema: form.tema,
            descripcion: form.descripcion,
            idRama: form.idRama
        }
        await ApiPinPost('/api/v1/sdin/abm/temas/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    tema: "",
                    descripcion: "",
                    idRama: null
                })
                getTemasABM()
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
            idTema: id
        }
        await ApiPinPost('/api/v1/sdin/abm/temas/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getTemasABM();
            })
            .catch()

        setLoading(false)
    }

    async function habilitarTema(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idTema: id
        }
        await ApiPinPost('/api/v1/sdin/abm/temas/habilitar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowHabilitar(false);
                getTemasABM();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idTema: id,
            tema: formEdicion.tema,
            descripcion: formEdicion.descripcion,
            idRama: formEdicion.idRama,
            estado: formEdicion.estado
        }
        await ApiPinPost('/api/v1/sdin/abm/temas/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getTemasABM();
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
            idTema: elem.idTema,
            tema: elem.tema,
            descripcion: elem.descripcion,
            idRama: elem.idRama,
            estado: elem.estado
        })
        if (habilitarEdicion) {
            setFormEdicion({ idTema: null, tema: "", descripcion: "", idRama: null, estado: null })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

      const getRamas = async () => {
        let body = {
          usuario: localStorage.getItem('user_cuit')
        }
        try {
          let token = localStorage.getItem("token");
          await ApiPinPost('/api/v1/sdin/ramas', body, token).then((res) => {
            setRamas(Array.from(res.data.ramas))
            setRamaNorma(res.data.ramas.find(n => n.idRama === props.idRama))
          }).catch(function (error) {
            throw error
          });
        }
        catch (error) {
        }
      }

      useEffect(async () => {
          if (paginacion.cambiarPagina === true) {
              let auxPaginacion = paginacion;
              auxPaginacion.cambiarPagina = false;
              setPaginacion({ ...auxPaginacion })
              await getTemasABM()
          }
      }, [paginacion])

    useEffect(async () => {
        setLoading(true)
        await getTemasABM().catch()
        await getRamas();
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
                                    Nuevo Tema
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group ml-4" style={{ width: "40%" }}>
                                                <label for="tema">Tema</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="tema"
                                                    name="tema"
                                                    value={form.tema}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-4" style={{ width: "40%" }}>
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
                                            <div>
                                                    <div className="form-group ml-2">
                                                        <label for="ramas">Lista de Ramas</label>
                                                        <select className="custom-select" id="ramas" name="ramas"
                                                            onChange={e => handleForm(e)} 
                                                            value={form.idRama}
                                                        >
                                                            <option selected hidden value={-1} />
                                                            {ramas && (ramas.length > 0) ? (
                                                                ramas.map((p, index) => (
                                                                <option value={p.idRama} key={'opt-sec-' + index}>{p.rama}</option>
                                                                ))

                                                            ) : (<option disabled>No hay ramas para mostrar</option>)
                                                            }
                                                        </select>
                                                    </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {temasABM && temasABM.length > 0 &&
                <div>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tema</th>
                                <th>Descripción</th>
                                <th>Rama Asociada</th>
                                <th>Estado</th>
                                <th></th>
                                {habilitarEdicion && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {temasABM.map((elem) => (<tr>
                                {habilitarEdicion && formEdicion.idTema === elem.idTema ? (<>
                                    <td>{elem.idTema}</td>
                                    <td><input type="text" className="form-control form-control-sm" name="tema" id="tema"
                                        value={formEdicion.tema} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td><input type="text" className="form-control form-control-sm" name="descripcion" id="descripcion"
                                        value={formEdicion.descripcion} onChange={(e) => handleFormEdicion(e)} />
                                    </td>
                                    <td>
                                        <select 
                                            className="custom-select"
                                            name="ramas" 
                                            id="ramas"
                                            value={formEdicion.idRama} 
                                            onChange={(e) => handleFormEdicion(e)}
                                        >
                                            <option value="" ></option>
                                            {ramas && (ramas.length > 0) ? (
                                                ramas.map((p, index) => (
                                                <option value={p.idRama} key={'opt-sec-' + index}>{p.rama}</option>
                                                ))

                                            ) : (<option disabled>No hay ramas para mostrar</option>)
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        {elem?.estado == 1 ? 'Habilitado' : 'Deshabilitado'}
                                    </td>
                                </>)
                                    : <>
                                        <td>{elem.idTema}</td>
                                        <td>{decode(elem.tema)}</td>
                                        <td>{decode(elem.descripcion)}</td>
                                        <td>{elem.rama}</td>
                                        <td>{elem?.estado == 1 ? 'Habilitado' : 'Deshabilitado'}</td>
                                    </>}
                                {habilitarEdicion && formEdicion.idTema === elem.idTema &&
                                    <td>
                                        <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idTema)}>
                                            <FaCheck />
                                        </button>
                                    </td>}
                                {habilitarEdicion && !(formEdicion.idTema === elem.idTema) &&
                                    <td></td>}
                                <td className="d-flex">
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)} >
                                        <FaEdit />
                                    </button>
                                    {(elem?.estado == 1) ? (
                                        <div>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idTema); setShowModal(true) }} >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <button type="button" className="btn btn-success btn-sm" onClick={() => { setHabilitar(elem.idTema); setShowHabilitar(true) }} >
                                                <FaCheck />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    <br />
                    {paginacion && temasABM?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                    </div>}
                </div>
                }
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este tema?</Modal.Title>
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
            <Modal show={showHabilitar} onHide={() => setShowHabilitar(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea habilitar este tema?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowHabilitar(false)}>
                        Volver
                    </button>
                    <button className="btn btn-success" onClick={(e) => habilitarTema(e, habilitar)}>
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