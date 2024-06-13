import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaEllipsisV, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { Tree, TreeNode } from 'react-organizational-chart';
import './JerarquiaTemas.css';
import { Pagination } from '@gcba/obelisco'


const Jerarquia = props => {
    const [jerarquia, setJerarquia] = useState([])
    const [temas, setTemas] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalAgregarHijo, setModalAgregarHijo] = useState({ show: false, data: null })
    const [modalBorrar, setModalBorrar] = useState({ show: false, data: null })
    const [formAgregarTema, setFormAgregarTema] = useState({ idTema: null })
    const [formVistaTabla, setFormVistaTabla] = useState({
        idTema: null, idTemaHijo: null
    })
    const [errorTemaHijo, setErrorTemaHijo] = useState("")
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

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getJerarquia()
        }
    }, [paginacion])

    const getJerarquia = async () => {
        try {
            const { data: { jerarquia, totalJerarquia } } = await ApiPinGet(`/api/v1/sdin/temas/jerarquia?paginaActual=${paginacion.paginaActual}&limite=${paginacion.limite}`, localStorage.getItem('token'))
            setJerarquia(jerarquia)
            let auxPaginacion = paginacion;
            // console.log(totalJerarquia)
            auxPaginacion.totalPaginas = Math.ceil(totalJerarquia / auxPaginacion.limite);
            auxPaginacion.botones = [];
            for (let i = 1; i <= paginacion.totalPaginas; i++) {
                auxPaginacion.botones.push(i)
            }
            setPaginacion({ ...auxPaginacion })
        }
        catch (err) { }
    }
    const getTemas = async () => {
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        try {
            const { data: { temas, totalTemas } } = await ApiPinPost('/api/v1/sdin/temas', body, localStorage.getItem('token'))
            setTemas(temas)
            setTotalResultados(totalTemas)
        }
        catch (err) { }
    }


    const handleAgregarTema = async (e) => {
        e.preventDefault();
        if (!formAgregarTema.idTema) return;
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                idTemaHijo: formAgregarTema.idTema,
                idTema: modalAgregarHijo.data.idTema
            }
            await ApiPinPost('/api/v1/sdin/temas/jerarquia/crear', body, localStorage.getItem('token'))
                .then(_ => window.location.reload())
                .catch(error => { throw error })
        }
        catch (error) {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                ...formVistaTabla
            }
            await ApiPinPost('/api/v1/sdin/temas/jerarquia/crear', body, localStorage.getItem('token'))
                .then(async _ => {
                    await getJerarquia();
                    setFormVistaTabla({
                        idTema: "",
                        idTemaHijo: ""
                    })
                    setLoading(false)
                })
                .catch(error => { throw error })
        }
        catch (error) { setLoading(false) }
    }

    const handleBorrar = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                idTemasJerarquia: modalBorrar.data.idTemasJerarquia
            }

            await ApiPinPost('/api/v1/sdin/temas/jerarquia/borrar', body, localStorage.getItem('token'))
                .then(async _ => {
                    await getJerarquia();
                    setModalBorrar({ show: false, data: null });
                    setLoading(false)
                })
                .catch(error => { throw error })
        }
        catch (error) { setLoading(false) }
    }

    const handleFormAgregar = async (e) => {
        switch (e.target.id) {
            case 'idTema':
                setFormAgregarTema({ ...formAgregarTema, idTema: e.target.value })
                break;
        }
    }

    const handleFormVistaTabla = async (e) => {
        switch (e.target.id) {
            case 'idTema':
                setFormVistaTabla({ ...formVistaTabla, idTema: e.target.value })
                break;
            case 'idTemaHijo':
                setFormVistaTabla({ ...formVistaTabla, idTemaHijo: e.target.value })
                break;
        }
    }

    const TarjetaNodo = ({ data, sePuedeEliminar }) => {
        return (
            <div className="nodo" tabIndex="0">
                <div className="nombre">{data.tema}</div>
                <div className="opciones hidden-data" data-toggle="dropdown"><FaEllipsisV /></div>
                <ul class="dropdown-menu">
                    <li>
                        <button type="button" className="dropdown-item" onClick={() => setModalAgregarHijo({ show: true, data })} >
                            <FaPlus />&nbsp;&nbsp;Agregar un Tema
                        </button>
                        {/* Solo se da la opcion de eliminar el nodo si no tiene hijos */}
                        {sePuedeEliminar ?
                            <button type="button" className="dropdown-item" onClick={() => setModalBorrar({ show: true, data })} >
                                <FaTrash />&nbsp;&nbsp;Borrar ítem
                            </button>
                            :
                            <button type="button" className="dropdown-item opcion-deshabilitada"
                                title="No puede eliminar este ítem porque otros dependen de él.">
                                <FaTrash />&nbsp;&nbsp;Borrar ítem
                            </button>
                        }
                    </li>
                </ul>
            </div>
        )
    }

    //Construyo el árbol jerárquico con recursividad.
    //Pasa por parámetro el array con los hijos del tema.
    const ArbolJerarquico = (children) => {
        let jerarquiaAux = [...jerarquia];

        if (!children) {

            //Busco los nodos raíz, no tienen padre
            let raices = jerarquiaAux.filter(elem => jerarquiaAux.findIndex(n => n.idTemaHijo === elem.idTema) === -1);
            //Elimino repetidos
            raices = [...new Set(raices.map(n => n.idTema))].map(item => jerarquiaAux.find(n => n.idTema === item))

            let arboles = [];

            for (const raiz of raices) {

                let temasHijos = jerarquiaAux.filter(elem => elem.idTema === raiz.idTema).map(n => ({ idTema: n.idTemaHijo, tema: n.temaHijo, idTemasJerarquia: n.idTemasJerarquia }));

                arboles.push(
                    <div className="tree-wrapper">
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#FFA82E'}
                            lineBorderRadius={'10px'}
                            label={<TarjetaNodo data={raiz} />}
                        >
                            {temasHijos.length > 0 ? ArbolJerarquico(temasHijos) : null}
                        </Tree>
                    </div>)
            }

            return (arboles)
        }

        let nodos = [];
        for (const child of children) {

            let temasHijos = jerarquiaAux.filter(elem => elem.idTema === child.idTema)
                .map(n => ({ idTemasJerarquia: n.idTemasJerarquia, idTema: n.idTemaHijo, tema: n.temaHijo }));

            nodos.push(
                <TreeNode label={<TarjetaNodo data={child} sePuedeEliminar={temasHijos.length == 0} />}>
                    {temasHijos.length > 0 ? ArbolJerarquico(temasHijos) : null}
                </TreeNode>)
        }
        return nodos;
    }

    useEffect(async () => {
        setLoading(true)
        await getJerarquia();
        await getTemas();
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5" id="pagina-jerarquia-temas">
                {!props.verTabla && (jerarquia?.length > 0 ? ArbolJerarquico() :
                    <div style={{ textAlign: "center" }}>
                        <p>No existe ninguna estructura. Agregue al menos un ítem para visualizar el diagrama.</p>
                        {/* <button className="btn btn-primary btn-lg" onClick={()=>console.log(props)}>Agregar un ítem</button> */}
                    </div>
                )}
                {props.verTabla && (
                    <div className="w-100">
                        <div id="accordion">
                            <div className="accordion-wrapper">
                                <div className="accordion">
                                    <div className="card">
                                        <button
                                            type="button"
                                            className="card-header collapsed card-link"
                                            data-toggle="collapse"
                                            data-target="#collapseOne"
                                        >
                                            Nuevo ítem
                                        </button>
                                        <div id="collapseOne" className="collapse" data-parent="#accordion">
                                            <div className="card-body">
                                                <form className="form-wrapper" onSubmit={e => handleSubmit(e)}>
                                                    <div className="form-group">
                                                        <label for="idTema">Tema</label>
                                                        <select className="custom-select" id="idTema" name="idTema" required
                                                            value={formVistaTabla.idTema !== null ? formVistaTabla.idTema : ""}
                                                            onChange={(e) => handleFormVistaTabla(e)}>
                                                            <option value={""} hidden></option>
                                                            {temas && temas.map(n =>
                                                                <option key={'org-' + n.idTema} value={n.idTema}>{n.idTema + " - " + n.tema}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label for="idtemaPadre">Tema Hijo</label>
                                                        <select className="custom-select" id="idTemaHijo" name="idTemaHijo"
                                                            value={formVistaTabla.idTemaHijo !== null ? formVistaTabla.idTemaHijo : -1}
                                                            onChange={(e) => handleFormVistaTabla(e)}>
                                                            <option value={-1} hidden></option>
                                                            {temas && temas.map(n =>
                                                                <option key={'repa-' + n.idTema} value={n.idTema}>{n.idTema + " - " + n.tema}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">
                                                        Guardar
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p>Resultados ({totalResultados}): </p>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Tema</th>
                                    <th>Tema Hijo</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {jerarquia.map((elem) => (
                                    <tr>
                                        <td>{elem.idTema + " - " + elem.tema}</td>
                                        <td>{elem.idTemaHijo + " - " + elem.temaHijo}</td>
                                        <td><button type="button" className="btn btn-danger btn-sm"
                                            onClick={() => { setModalBorrar({ show: true, data: elem }) }}>
                                            <FaTrash />
                                        </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
                {paginacion && jerarquia?.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination pages={paginacion.totalPaginas}
                onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
        </div>}
            <Modal show={modalBorrar?.show} onHide={() => setModalBorrar({ show: false, data: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este ítem?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalBorrar({ show: false, data: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => handleBorrar(e)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalAgregarHijo?.show} onHide={() => setModalAgregarHijo({ show: false, data: null })}>
                <Modal.Header>
                    <Modal.Title>
                        Agregar Tema a: &nbsp;{modalAgregarHijo?.data?.tema}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="form-agregar-repa">
                    <div className="form-group">
                        <label for="temas">Tema</label>
                        <select className="custom-select" id="idTema" name="idTema"
                            value={formAgregarTema.idTema !== null ? formAgregarTema.idTema : -1} onChange={(e) => {
                                handleFormAgregar(e)
                                setErrorTemaHijo(e.target.value)
                            }}>
                            <option value={-1} hidden></option>
                            {temas && temas.map(n =>
                                <option key={'repa-' + n.idTema} value={n.idTema}>{n.tema}</option>
                            )}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-link"
                        onClick={() => {
                            setModalAgregarHijo({ show: false, data: null });
                            setFormAgregarTema({ idTema: null })
                        }}>
                        Volver
                    </button>
                    <button className="btn btn-primary" onClick={e => handleAgregarTema(e)}
                        disabled={!formAgregarTema.idTema | modalAgregarHijo?.data?.idTema == errorTemaHijo}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Jerarquia;