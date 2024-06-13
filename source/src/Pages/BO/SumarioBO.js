import React, { useState, useEffect } from 'react';
import {
  FiEye as IconVer,
  FiChevronDown as IconMenu,
  FiEdit3 as IconEditar,
  FiX as IconX,
  FiPlusCircle
} from "react-icons/fi";
import Spinner from '../../Components/Spinner/Spinner';
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator';
import { getNormaSubtipos, getNormaTipos, getOrganismos } from '../../Helpers/consultas';
import Modal from "react-bootstrap/Modal";
import { FaGripHorizontal, FaGripVertical } from 'react-icons/fa';
import { GoListOrdered } from 'react-icons/go';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./SumarioBO.css";

const SumarioBO = props => {
  const [isLoading, setLoading] = useState(true)
  const [sumario, setSumario] = useState()
  const [showModalTiposNorma, setShowModalTiposNorma] = useState(false)
  const [showModalSubtiposNorma, setShowModalSubtiposNorma] = useState(false)
  const [showModalRepas, setShowModalRepas] = useState(false)
  const [seccionesSumario, setSeccionesSumario] = useState()
  const [reparticiones, setReparticiones] = useState()
  const [secciones, setSecciones] = useState([])
  const [tiposNorma, setTiposNorma] = useState()
  const [subtiposNorma, setSubtiposNorma] = useState()
  const [tipoNormaSeleccionado, setTipoNormaSeleccionado] = useState()
  const [subtipoNormaSeleccionado, setSubtipoNormaSeleccionado] = useState()
  const [repaSeleccionada, setRepaSeleccionada] = useState()
  const [idSeccion, setIdSeccion] = useState()
  const [seccionAfectada, setSeccionAfectada] = useState()
  const [idSumarioNormasTipo, setIdSumarioNormasTipo] = useState()
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false)
  const [ordenarSubtipos, setOrdenarSubtipos] = useState({ show: false, idSumarioNormasTipo: null, subtiposNorma: [] })
  const [ordenarRepas, setOrdenarRepas] = useState({ show: false, idSumarioNormasTipo: null, idSeccion: null, reparticiones: [] })
  const [modalOrdenarTipos, setModalOrdenarTipos] = useState({
    show: false,
    tiposNorma: [],
    idSeccion: null
  })
  const [habilitarOrdenar, setHabilitarOrdenar] = useState(false)

  const handleDragEnd = (e) => {
    const { source, destination } = e;
    if (!destination) return;
    if (source.index === destination.index &&
      source.droppableID === destination.droppableId) {
      return;
    }
    const reorder = (list, startIndex, endIndex) => {
      const result = [...list];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result.map((elem, index) => ({ ...elem, normaTipoOrden: index + 1 }));
    }
    setModalOrdenarTipos({ ...modalOrdenarTipos, tiposNorma: reorder(modalOrdenarTipos.tiposNorma, source.index, destination.index) })
  };
  const handleDragEndSubtipos = (e) => {
    const { source, destination } = e;
    if (!destination) return;
    if (source.index === destination.index &&
      source.droppableID === destination.droppableId) {
      return;
    }
    const reorder = (list, startIndex, endIndex) => {
      const result = [...list];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result.map((elem, index) => ({ ...elem, normaSubtipoOrden: index + 1 }));
    }
    setOrdenarSubtipos({ ...ordenarSubtipos, subtiposNorma: reorder(ordenarSubtipos.subtiposNorma, source.index, destination.index) })
  };
  const handleDragEndRepas = (e) => {
    const { source, destination } = e;
    if (!destination) return;
    if (source.index === destination.index &&
      source.droppableID === destination.droppableId) {
      return;
    }
    const reorder = (list, startIndex, endIndex) => {
      const result = [...list];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result.map((elem, index) => ({ ...elem, reparticionOrden: index + 1 }));
    }
    setOrdenarRepas({ ...ordenarRepas, reparticiones: reorder(ordenarRepas.reparticiones, source.index, destination.index) })
  };
  const handleDragEndSecciones = (e) => {
    const { source, destination } = e;
    if (!destination) return;
    if (source.index === destination.index &&
      source.droppableID === destination.droppableId) {
      return;
    }
    const reorder = (list, startIndex, endIndex) => {
      const result = [...list];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result.map((elem, index) => ({ ...elem, seccionOrden: index + 1 }));
    }
    setSecciones(reorder(secciones, source.index, destination.index))
  };

  const handleTipoNorma = async (e) => {
    e.preventDefault();
    let normaTipoOrden = 1;
    let ordenes = sumario.filter(n => n.idSeccion === seccionAfectada).map(n => n.normaTipoOrden);
    if (ordenes.length > 0) {
      normaTipoOrden = Math.max(...ordenes) + 1;
    }

    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idNormaTipo: tipoNormaSeleccionado,
        normaTipoOrden,
        idSeccion: seccionAfectada
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/item/crear', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const handleSubtipoNorma = async (e) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        idNormaSubtipo: subtipoNormaSeleccionado,
        idSumarioNormasTipo: idSumarioNormasTipo
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/subtipos/crear', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const handleRepa = async (e) => {
    e.preventDefault();

    try {
      let token = localStorage.getItem("token");
      let body = { //Si le mando el idSeccion es porque es_poder=1
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        idReparticion: repaSeleccionada,
        idSumarioNormasTipo: idSumarioNormasTipo,
        idSeccion: idSeccion
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/reparticiones/crear', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const borrarTipoNorma = async (e, idSumarioNormasTipo) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTipo
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/item/borrar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const reactivarTipoNorma = async (e, idSumarioNormasTipo) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTipo
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/item/reactivar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const borrarSubtipo = async (e, idSumarioNormasTiposSubtipo) => {
    e.preventDefault(); console.log(idSumarioNormasTiposSubtipo)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTiposSubtipo,
        idUsuario: localStorage.idUsuarioBO
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/subtipos/borrar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const reactivarSubtipo = async (e, idSumarioNormasTiposSubtipo) => {
    e.preventDefault(); console.log(idSumarioNormasTiposSubtipo)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTiposSubtipo,
        idUsuario: localStorage.idUsuarioBO
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/subtipos/reactivar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  const borrarRepa = async (e, idSumarioNormasTiposReparticion, idSumarioSeccionReparticiones) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSumarioNormasTiposReparticion: idSumarioNormasTiposReparticion,
        idSumarioSeccionReparticiones: idSumarioSeccionReparticiones
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/reparticiones/borrar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          throw error
        });
    }
    catch (e) {

    }
  }

  //Ordenar tipos de norma en una determinada sección
  const ordenarTiposNorma = async (e, idSeccion, arrayTipos) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        normaTipos: arrayTipos,
        idSeccion
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/tipos/ordenar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          setLoading(false)
          throw error
        });
    }
    catch (e) {

    }
  }

  //Ordenar subtipos de norma para sección --> tipo de norma
  const handleOrdenarSubtipos = async (e, idSumarioNormasTipo, array) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        subtiposNorma: array,
        idSumarioNormasTipo
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/subtipos/ordenar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          setLoading(false)
          throw error
        });
    }
    catch (e) {

    }
  }

  const handleOrdenarRepas = async (e, idSumarioNormasTipo, idSeccion, array) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        reparticiones: array,
        idSumarioNormasTipo,
        idSeccion
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/reparticiones/ordenar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          setLoading(false)
          throw error
        });
    }
    catch (e) {

    }
  }

  //Ordenar secciones
  const ordenarSecciones = async (e, secciones) => {
    e.preventDefault();
    setLoading(true)
    try {
      let token = localStorage.getItem("token");
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.idUsuarioBO),
        secciones
      };
      await ApiPinPost('/api/v1/boletin-oficial/sumario/secciones/ordenar', body, token)
        .then(_ => {
          window.location.reload()
        })
        .catch(function (error) {
          setLoading(false)
          throw error
        });
    }
    catch (e) {

    }
  }

  useEffect(async () => {
    await getOrganismos().then(res => setReparticiones(res)).catch(e => { })
    await getNormaSubtipos().then(res => setSubtiposNorma(res)).catch(e => { })
    await getNormaTipos().then(res => setTiposNorma(res)).catch(e => { })
    await getSumario().then(res => setSumario(res)).catch()
  }, [])

  useEffect(() => {
    if (sumario) {
      let auxId = null;
      let auxArray = [];
      for (const n of (sumario.es_poder.concat(sumario.no_es_poder)).sort((a, b) => a.seccionOrden - b.seccionOrden)) {
        if (n.idSeccion !== auxId) {
          auxId = n.idSeccion;
          auxArray.push({ seccion: n.seccion, idSeccion: n.idSeccion, seccionOrden: n.seccionOrden })
        }
      }
      setSecciones(auxArray)
      setSeccionesSumario(getSeccionesSumario())
    }
  }, [sumario])

  useEffect(() => {
    if (seccionesSumario) {
      setLoading(false)
    }
  }, [seccionesSumario])

  const getSumario = async () => {
    let data = [];
    try {
      let token = localStorage.getItem("token");
      await ApiPinGet('/api/v1/boletin-oficial/sumario', token)
        .then(res => {
          data = res.data.data;
        })
    }
    catch (error) {
      console.log(error)
    }
    return data;
  }

  const Subtipos = ({ items }) => {
    let tableData = [];
    let subtipoNormaControl = null;
    for (const item of items) {
      if (item.idNormaSubtipo !== subtipoNormaControl) {
        subtipoNormaControl = item.idNormaSubtipo;
        /* ACA TENGO QUE CONDICIONAR SI ESTA ELIMINADO EL ITEM O NO Y TACHAR EL SPAN*/
        if (item.estadoSubtipo === 1) {
          tableData.push(<>
            <span className="badge badge-info active sumario-badge">{item.normaSubtipo}
              <div style={{ minWidth: "20px" }}>
                <IconX type="button" onClick={(e) => borrarSubtipo(e, item.idSumarioNormasTiposSubtipo)} />
              </div>
            </span></>
          )
        } else {
          tableData.push(<>
            <span className="badge badge-danger sumario-badge"><del>{item.normaSubtipo}</del>
              <div style={{ minWidth: "20px" }}>
                <i className="bx bx-revision icono-reactivar" type="button" title="Reactivar este subtipo"
                  onClick={(e) => reactivarSubtipo(e, item.idSumarioNormasTiposSubtipo)} />
              </div>
            </span>
          </>)
        }
      }
    }
    tableData.push(<><br />
      <button type="button" className="btn btn-link btn-sm mt-3" style={{ whiteSpace: "nowrap" }}
        onClick={() => { setShowModalSubtiposNorma(true); setIdSumarioNormasTipo(items[0].idSumarioNormasTipo) }}>
        <FiPlusCircle /> Agregar Subtipo
      </button>
      {tableData.length > 1 && <button type="button" className="btn btn-link btn-sm mt-3 ml-2" style={{ whiteSpace: "nowrap" }}
        onClick={() => {
          let aux = items.map(({ idNormaSubtipo, normaSubtipo, normaSubtipoOrden }) => (
            { idNormaSubtipo, normaSubtipo, normaSubtipoOrden }));
          setOrdenarSubtipos({
            show: true,
            subtiposNorma: aux.filter((n, index) => index > 0 ? n.idNormaSubtipo !== aux[(index - 1)].idNormaSubtipo : n),
            idSumarioNormasTipo: items[0].idSumarioNormasTipo
          })
        }}>
        <GoListOrdered /> Ordenar
      </button>}</>)
    return tableData;
  }

  const Organismos = ({ items }) => {
    let tableData = [];
    let orgControl = null;
    for (const item of items.sort((a, b) => a.reparticionOrden - b.reparticionOrden)) {
      if (item.idReparticion !== orgControl) {
        orgControl = item.idReparticion;
        if (item.estadoReparticion === 1) {
          tableData.push(<>
            <span className="badge badge-info active sumario-badge">{item.reparticion}
              <div style={{ minWidth: "20px" }}>
                <IconX type="button" onClick={(e) => borrarRepa(e, item.idSumarioNormasTiposReparticion)} />
              </div>
            </span>
          </>)
        } /* else {
          tableData.push(<>
            <span className="badge badge-danger sumario-badge"><del>{item.reparticion}</del></span>
          </>)
        } */
      }
    }
    tableData.push(<><br /><button type="button" className="btn btn-link btn-sm mt-3" style={{ whiteSpace: "nowrap" }}
      onClick={() => { setShowModalRepas(true); setIdSumarioNormasTipo(items[0].idSumarioNormasTipo) }}>
      <FiPlusCircle /> Agregar Reparticion
    </button>
      {tableData.length > 1 && <button type="button" className="btn btn-link btn-sm mt-3 ml-2" style={{ whiteSpace: "nowrap" }}
        onClick={() => {
          let aux = items.map(({ idReparticion, reparticion, reparticionOrden }) => (
            { idReparticion, reparticion, reparticionOrden }));
          setOrdenarRepas({
            show: true,
            reparticiones: aux.filter((n, index) => index > 0 ? n.idReparticion !== aux[(index - 1)].idReparticion : n),
            idSumarioNormasTipo: items[0].idSumarioNormasTipo
          })
        }}>
        <GoListOrdered /> Ordenar
      </button>}
    </>)
    return tableData;
  }
  /* Componente de reparticiones para sumario.no_es_poder */
  const ReparticionesDesdeHasta = ({ idSeccion }) => {
    let tableData = [];
    let array = sumario.no_es_poder_repas.filter(n => n.idSeccion === idSeccion).sort((a, b) => a.reparticionOrden - b.reparticionOrden);
    for (const item of array) {
      if (item.estadoReparticion === 1) {
        tableData.push(<>
          <span className="badge badge-info active sumario-badge">{item.reparticion}
            <div style={{ minWidth: "20px" }}>
              <IconX type="button" onClick={(e) => borrarRepa(e, null, item.idSumarioSeccionReparticiones)} />
            </div>
          </span>
        </>)
      } /* else {
        tableData.push(<>
          <span className="badge badge-danger sumario-badge"><del>{item.reparticion}</del></span>
        </>)
      } */
    }
    tableData.push(<><br /><button type="button" className="btn btn-link btn-sm mt-3" style={{ whiteSpace: "nowrap" }}
      onClick={() => { setShowModalRepas(true); setIdSeccion(idSeccion) }}>
      <FiPlusCircle /> Agregar Reparticion
    </button>
      {tableData.length > 1 && <button type="button" className="btn btn-link btn-sm mt-3 ml-2" style={{ whiteSpace: "nowrap" }}
        onClick={() => {
          let aux = array.map(({ idReparticion, reparticion, reparticionOrden }) => (
            { idReparticion, reparticion, reparticionOrden }));
          setOrdenarRepas({
            show: true,
            reparticiones: aux.filter((n, index) => index > 0 ? n.idReparticion !== aux[(index - 1)].idReparticion : n),
            idSeccion: array[0].idSeccion
          })
        }}>
        <GoListOrdered /> Ordenar
      </button>}
    </>)
    return tableData;
  }

  const TiposDeNormaPorSeccion = ({ items }) => {
    let ordenControl = null;
    let tableRows = [];
    for (const item of items) {
      if (item.normaTipoOrden !== ordenControl) {
        ordenControl = item.normaTipoOrden;
        tableRows.push(
          <tr>
            <td>
              {item.estadoSumarioNormasTipo === 1 ?
                <>
                  {item.normaTipo}
                  <button type="button" className="btn btn-danger btn-sm ml-2"
                    onClick={(e) => borrarTipoNorma(e, item.idSumarioNormasTipo)}>x</button>
                </>
                :
                <>
                  <del style={{color: "#C93B3B"}}>{item.normaTipo}</del>
                  <button type="button" className="btn btn-sm ml-2"
                    onClick={(e) => reactivarTipoNorma(e, item.idSumarioNormasTipo)}>
                    <i className="bx bx-revision icono-reactivar" title="Reactivar este ítem" />
                  </button>
                </>
              }
            </td>
            <td><Subtipos items={items.filter(n => n.idSumarioNormasTipo === item.idSumarioNormasTipo)} /></td>
            {item.es_poder ? <td><Organismos items={items.filter(n => n.idSumarioNormasTipo === item.idSumarioNormasTipo)} /></td> : null}
          </tr>
        )
      }
    }
    return tableRows;
  }

  //Conformacion del sumario
  const getSeccionesSumario = () => {
    let seccionControl = null;
    let accordions = [];
    let sumarioConcatenado = (sumario.es_poder.concat(sumario.no_es_poder)).sort((a, b) => a.seccionOrden - b.seccionOrden);
    for (const item of sumarioConcatenado) {
      if (item.idSeccion !== seccionControl) {
        seccionControl = item.idSeccion;
        accordions.push(
          <div class="card">
            <button class="card-header collapsed card-link" data-toggle="collapse" data-target={"#collapse" + item.idSeccion.toString()}>
              {item.seccion}
            </button>
            <div id={"collapse" + item.idSeccion.toString()} class="collapse" data-parent="#accordion">
              <div class="card-body">
                <div class="table-responsive-sm">
                  <table className="table table-bordered" id="tabla-seccion">
                    <thead>
                      <tr>
                        {!item.es_poder && <th scope="col">Reparticiones</th>}
                        <th scope="col">Tipos de Normas</th>
                        <th scope="col">Subtipos de Normas</th>
                        {item.es_poder ? <th scope="col">Reparticiones</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {!item.es_poder && <tr id="tr-repas"><td rowSpan={999}><ReparticionesDesdeHasta idSeccion={item.idSeccion} /></td></tr>}
                      <TiposDeNormaPorSeccion items={sumarioConcatenado.filter(n => n.idSeccion === item.idSeccion)} />
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-link btn-sm mt-1"
                  onClick={() => { setShowModalTiposNorma(true); setSeccionAfectada(item.idSeccion) }}>
                  <FiPlusCircle /> Agregar tipo
                </button>
                <button className="btn btn-link btn-sm mt-1 ml-2"
                  onClick={() => {
                    let aux = sumarioConcatenado.filter(n => n.idSeccion === item.idSeccion).map(({ idNormaTipo, normaTipo, normaTipoOrden }) => (
                      { idNormaTipo, normaTipo, normaTipoOrden }))/* .sort((a, b) => b.normaTipoOrden - a.normaTipoorden) */;
                    setModalOrdenarTipos({
                      show: true,
                      tiposNorma: aux.filter((n, index) => index > 0 ? n.idNormaTipo !== aux[(index - 1)].idNormaTipo : n),
                      idSeccion: item.idSeccion
                    })
                  }}>
                  <GoListOrdered /> Ordenar
                </button>
              </div>
            </div>
          </div>
        )
      }
    }
    return accordions;
  }

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div id="accordion">
          <DragDropContext onDragEnd={(e) => handleDragEndSecciones(e)}>
            <Droppable droppableId="secciones">
              {(droppableProvided) => (
                <div class="accordion-wrapper" {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                  <div class="accordion" id="accordionExample">
                    {sumario && !habilitarOrdenar && seccionesSumario}
                    {habilitarOrdenar && sumario && secciones.map((item, index) => (<>
                      <Draggable key={item.idSeccion} draggableId={String(item.idSeccion)} index={index}>
                        {(draggableProvided) => (
                          <div class="card" {...draggableProvided.draggableProps} ref={draggableProvided.innerRef} {...draggableProvided.dragHandleProps}>
                            <div class="card-header collapsed no-hover">
                              {item.seccion}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    </>))}
                    {droppableProvided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <button className="btn btn-link mb-3 mr-3" onClick={() => setHabilitarOrdenar(!habilitarOrdenar)}>
          <GoListOrdered />{habilitarOrdenar ? "Cancelar" : "Ordenar Secciones"}
        </button>
        <button className="btn btn-primary mb-3" onClick={(e) => ordenarSecciones(e, secciones)} hidden={!habilitarOrdenar}>
          Confirmar orden
        </button>
        {/* TIPO NORMA */}
        <Modal show={showModalTiposNorma} onHide={() => setShowModalTiposNorma(false)}>
          <Modal.Header>
            <Modal.Title>Agregar Tipo de Norma</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <select className="custom-select" value={tipoNormaSeleccionado ? tipoNormaSeleccionado : -1}
              onChange={(e) => setTipoNormaSeleccionado(e.target.value)}>
              <option value={-1}></option>
              {tiposNorma?.length > 0 && tiposNorma.map((elem) => (
                <option key={"tipoNorma" + elem.idNormaTipo} value={elem.idNormaTipo}>{elem.normaTipo}</option>
              ))}
            </select>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => { setShowModalTiposNorma(false); setTipoNormaSeleccionado() }}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => handleTipoNorma(e)}>
              Agregar
            </button>
          </Modal.Footer>
        </Modal>

        {/* SUBTIPO NORMA */}
        <Modal show={showModalSubtiposNorma} onHide={() => setShowModalSubtiposNorma(false)}>
          <Modal.Header>
            <Modal.Title>Agregar Subtipo de Norma</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <select className="custom-select" value={subtipoNormaSeleccionado ? subtipoNormaSeleccionado : -1}
              onChange={(e) => setSubtipoNormaSeleccionado(e.target.value)}>
              <option value={-1}></option>
              {subtiposNorma?.length > 0 && subtiposNorma.map((elem) => (
                <option key={"subtipoNorma" + elem.idNormaSubtipo} value={elem.idNormaSubtipo}>{elem.normaSubtipo}</option>
              ))}
            </select>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => { setShowModalSubtiposNorma(false); setSubtipoNormaSeleccionado() }}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => handleSubtipoNorma(e)}>
              Agregar
            </button>
          </Modal.Footer>
        </Modal>

        {/* REPARTICION */}
        <Modal show={showModalRepas} onHide={() => setShowModalRepas(false)}>
          <Modal.Header>
            <Modal.Title>Agregar Reparticion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <select className="custom-select" value={repaSeleccionada ? repaSeleccionada : -1}
              onChange={(e) => setRepaSeleccionada(e.target.value)}>
              <option value={-1}></option>
              {reparticiones?.length > 0 && reparticiones.map((elem) => (
                <option key={"repa" + elem.idReparticion} value={elem.idReparticion}>{elem.reparticion}</option>
              ))}
            </select>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => { setShowModalRepas(false); setRepaSeleccionada(); setIdSeccion() }}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => handleRepa(e)}>
              Agregar
            </button>
          </Modal.Footer>
        </Modal>

        {/* ORDENAR TIPOS DE NORMA */}
        <Modal show={modalOrdenarTipos.show} onHide={() => setModalOrdenarTipos({ ...modalOrdenarTipos, show: false })}>
          <Modal.Header>
            <Modal.Title>Ordenar Tipos de Norma</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DragDropContext onDragEnd={(e) => handleDragEnd(e)}>
              <Droppable droppableId="tiposNorma">
                {(droppableProvided) => (
                  <ol className="custom-ol" {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                    {modalOrdenarTipos.tiposNorma.map((tipoNorma, index) => (
                      <Draggable key={tipoNorma.idNormaTipo} draggableId={String(tipoNorma.idNormaTipo)} index={index}>
                        {(draggableProvided) => (
                          <li className="ordenable" {...draggableProvided.draggableProps} ref={draggableProvided.innerRef} {...draggableProvided.dragHandleProps}>
                            {tipoNorma.normaTipo}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </ol>
                )}
              </Droppable>
            </DragDropContext>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setModalOrdenarTipos({ ...modalOrdenarTipos, show: false })}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => ordenarTiposNorma(e, modalOrdenarTipos.idSeccion, modalOrdenarTipos.tiposNorma)}>
              Aceptar
            </button>
          </Modal.Footer>
        </Modal>

        {/* ORDENAR SUBTIPOS DE NORMA */}
        <Modal show={ordenarSubtipos.show} onHide={() => setOrdenarSubtipos({ ...ordenarSubtipos, show: false })}>
          <Modal.Header>
            <Modal.Title>Ordenar Subtipos de Norma</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DragDropContext onDragEnd={(e) => handleDragEndSubtipos(e)}>
              <Droppable droppableId="subtiposNorma">
                {(droppableProvided) => (
                  <ol className="custom-ol" {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                    {ordenarSubtipos.subtiposNorma.map((subtipoNorma, index) => (
                      <Draggable key={subtipoNorma.idNormaSubtipo} draggableId={String(subtipoNorma.idNormaSubtipo)} index={index}>
                        {(draggableProvided) => (
                          <li className="ordenable" {...draggableProvided.draggableProps} ref={draggableProvided.innerRef} {...draggableProvided.dragHandleProps}>
                            {subtipoNorma.normaSubtipo}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </ol>
                )}
              </Droppable>
            </DragDropContext>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setOrdenarSubtipos({ ...ordenarSubtipos, show: false })}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => handleOrdenarSubtipos(e, ordenarSubtipos.idSumarioNormasTipo, ordenarSubtipos.subtiposNorma)}>
              Aceptar
            </button>
          </Modal.Footer>
        </Modal>

        {/* ORDENAR REPAS */}
        <Modal show={ordenarRepas.show} onHide={() => setOrdenarRepas({ ...ordenarRepas, show: false })}>
          <Modal.Header>
            <Modal.Title>Ordenar Reparticiones de Norma</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DragDropContext onDragEnd={(e) => handleDragEndRepas(e)}>
              <Droppable droppableId="reparticiones">
                {(droppableProvided) => (
                  <ol className="custom-ol" {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                    {ordenarRepas.reparticiones.map((reparticion, index) => (
                      <Draggable key={reparticion.idReparticion} draggableId={String(reparticion.idReparticion)} index={index}>
                        {(draggableProvided) => (
                          <li className="ordenable" {...draggableProvided.draggableProps} ref={draggableProvided.innerRef} {...draggableProvided.dragHandleProps}>
                            {reparticion.reparticion}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </ol>
                )}
              </Droppable>
            </DragDropContext>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setOrdenarRepas({ ...ordenarRepas, show: false })}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={(e) => handleOrdenarRepas(e, ordenarRepas.idSumarioNormasTipo, ordenarRepas.idSeccion, ordenarRepas.reparticiones)}>
              Aceptar
            </button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default SumarioBO;
