import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Autocomplete } from '../../../Components/Autocomplete/Autocomplete'
import { decode } from 'html-entities';
var b64toBlob = require('b64-to-blob');

const AnalisisDocumental = ({ norma }) => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false)
  const [temas, setTemas] = useState([])
  const [ramas, setRamas] = useState([])
  const [temasNorma, setTemasNorma] = useState([])
  const [ramaNorma, setRamaNorma] = useState()
  const [descriptores, setDescriptores] = useState(null)
  const [descriptoresNorma, setDescriptoresNorma] = useState([])
  const [errorAgregarDescriptor, setErrorAgregarDescriptor] = useState(false);
  const [idTema, setIdTema] = useState('');
  const [descriptor, setDescriptor] = useState({ id: null, descriptor: '' });
  const [idRama, setIdRama] = useState('');

  const [aprobadoDocumentalmente, setAprobadoDocumentalmente] = useState(norma.aprobadoDocumentalmente);

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'listaTemas':
      case 'idTema':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setIdTema(value)
        break;
      case 'listaDescriptores':
      case 'idDescriptor':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setDescriptor({ ...descriptor, id: value })
        break;
      case 'listaRamas':
      case 'idRama':
        value = parseInt(e.target.value);
        if (isNaN(value)) {
          value = ''
        }
        setIdRama(value)
        break;

    }
  }

  const getTemas = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit')
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/temas', body, token).then((res) => {
        setTemas(Array.from(res.data.temas))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
    }
  }

  const getRamas = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit')
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/ramas', body, token).then((res) => {
        setRamas(Array.from(res.data.ramas))
        setRamaNorma(res.data.ramas.find(n => n.idRama === norma.idRama))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
    }
  }

  const getDescriptores = async (textInput) => {
    if (textInput.length < 3 && descriptor.descriptor.length > 2) {
      setDescriptores([])
    }
    setDescriptor({ ...descriptor, descriptor: textInput })
    if (textInput && textInput.length > 2) {
      let body = {
        textInput,
        usuario: localStorage.getItem('user_cuit')
      }
      try {
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/sdin/descriptores', body, token).then((res) => {
          setDescriptores(res.data.descriptores);
          //return (res.data.descriptores.map(n => ({ label: n.descriptor, value: n.id })))
        }).catch(function (error) {
          throw error
        });
      }
      catch (error) {
        //console.log(error);
      }
    }
  }

  const getDescriptoresNorma = async () => {
    setErrorAgregarDescriptor(false)
    let body = {
      idNormaSDIN: norma.idNormaSDIN,
      usuario: localStorage.getItem('user_cuit')
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/norma/descriptores', body, token).then((res) => {
        setDescriptoresNorma(Array.from(res.data.descriptores))
      }).catch(function (error) {
        throw error
      });

    }
    catch (error) {
    }
  }

  const getTemasNorma = async (idTema) => {
    let body = {
      idNormaSDIN: norma.idNormaSDIN,
      usuario: localStorage.getItem('user_cuit')
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/norma/temas', body, token).then((res) => {
        setTemasNorma(Array.from(res.data.temas))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
    }
  }

  useEffect(() => {

  }, [temasNorma])
  const getJerarquiaNorma = async () => {
    let body = {
      idNormaSDIN: norma.idNormaSDIN,
      usuario: localStorage.getItem('user_cuit'),
      idTemas: (temasNorma.length > 0) ? [temasNorma.map(t => t.idTema)] : (null)
    }
    console.log(body)
    /* try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/norma/temas', body, token).then((res) => {
        console.log(res.data)
        //setTemasNorma(Array.from(res.data.temas.temas))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
    } */
  }

  const getRamaNorma = async () => {
    /* let body = {
      idNormaSDIN: norma.idNormaSDIN,
      usuario: localStorage.getItem('user_cuit')
    }
    try {
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/sdin/norma/rama', body, token).then((res) => {
        setRamasNorma(Array.from(res.data.ramas))
      }).catch(function (error) {
        throw error
      });
    }
    catch (error) {
    } */
  }

  const handleSubmitTemas = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      idTema,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/temas/crear', body, token)
        .then(_ => {
          getTemasNorma(idTema)
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const eliminarTema = async (id) => {
    setLoading(true)
    let body = {
      idTema: id,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/temas/eliminar', body, token)
        .then(async _ => {
          await getTemasNorma()
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const eliminarRama = async (id) => {
    setLoading(true)
    let body = {
      idRama: id,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/rama/eliminar', body, token)
        .then(async _ => {
          setRamaNorma()
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const handleSubmitRamas = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      idRama,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/rama/crear', body, token)
        .then(async _ => {
          let aux = [...ramas];
          setRamaNorma(aux.find(n => n.idRama === idRama))
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const handleSubmitDescriptores = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      descriptor: descriptor.id,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");

    // me fijo si el descriptor ya se encuentra dentro de los descriptores de la norma
    let indice = descriptoresNorma.findIndex(d => d.id === descriptor.id);


    // si no se encuentra, lo agrego
    if (indice === -1) {
      setErrorAgregarDescriptor(false)
      try {
        await ApiPinPost('/api/v1/sdin/norma/descriptores/crear', body, token)
          .then(_ => {
            setLoading(false)
            setDescriptor({ ...descriptor, id: '', descriptor: '' })
            getDescriptoresNorma()
          })
          .catch((err) => {
            throw err
          })
      }
      catch (e) {
        setLoading(false)
        //console.log(e)
      }
    } else {
      setErrorAgregarDescriptor(true)
      setLoading(false)
    }

  }

  const eliminarDescriptor = async (id) => {
    setLoading(true)
    let body = {
      descriptor: id,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma/descriptores/eliminar', body, token)
        .then(_ => {
          getDescriptoresNorma()
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    let body = {
      aprobadoDocumentalmente,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: norma.idNormaSDIN
      //idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/aprobado/documentalmente', body, token)
        .then(_ => {
          window.location.reload();
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      setLoading(false)
      //console.log(e)
    }
  }

  const TablaDescriptores = ({ descriptores }) => {
    return (
      <table class="table table-bordered" >
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Descriptor</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {
            descriptores.length > 0 ? (
              descriptores.map(n => (
                <tr>
                  <td>{n.id}</td>
                  <td>{decode(n.descriptor)}</td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarDescriptor(n.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )
              : (<tr><td>Sin descriptores...</td></tr>)
          }
        </tbody>
      </table>
    )
  }

  //Hook inicial
  useEffect(async () => {
    setLoading(true)
    await getTemas();
    await getTemasNorma();
    await getRamas();
    await getJerarquiaNorma()
    /* await getRamaNorma(); */
    await getDescriptoresNorma();
    setLoading(false)
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="card" id="analisis-documental">
          <div className="card-body">
            <h4 className="card-title mb-4">
              RAMAS
            </h4>

            <form className="form tab" onSubmit={e => handleSubmitRamas(e)}>
              <div className="form-group">
                <label for="alcance">Lista de Ramas</label>
                <select className="custom-select" id="listaRamas" name="listaRamas"
                  onChange={e => handleFormChange(e)} value={idRama}
                ><option selected hidden value={-1} />
                  {ramas && (ramas.length > 0) ? (
                    ramas.map((p, index) => (
                      <option value={p.idRama} key={'opt-sec-' + index}>{p.rama}</option>
                    ))

                  ) : (<option disabled>No hay ramas para mostrar</option>)
                  }
                </select>
              </div>
              <div className="form-group dos-columnas">
                <label for="palabras">idRama</label>
                <input type="text" className="form-control" id="palabras" name="palabras" pattern="[0-9]*"
                  onChange={e => handleFormChange(e)} value={idRama} required />
              </div>
              <button class="btn btn-primary" type="submit" id="boton-buscar" >Agregar Rama</button>
            </form>
            <h4>Rama de la Norma</h4>
            <table class="table table-bordered" >
              <thead>
                <tr>
                  <th scope="col">Id</th>
                  <th scope="col">Rama</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ramaNorma ? (
                  <tr>
                    <td>{ramaNorma.idRama}</td>
                    <td>{ramaNorma.rama}</td>
                    <td>{ramaNorma.descripcion}</td>
                    <td>
                      <div class="dropdown-container">
                        <div class="drowdown">
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarRama(ramaNorma.idRama)}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
                  : (<tr><td>Sin ramas...</td></tr>)
                }
              </tbody>
            </table>
            <hr />
            <h4 className="card-title mb-4">
              TEMAS
            </h4>
            <form className="form tab" onSubmit={e => handleSubmitTemas(e)}>
              <div className="form-group">
                <label for="idTema">Lista de Temas</label>
                <Autocomplete valores={temas.map(n => ({ id: n.idTema, nombre: decode(n.tema) }))} setValue={e => setIdTema(e.id)} />
                {/* <select className="custom-select" id="listaTemas" name="listaTemas"
                  onChange={e => handleFormChange(e)} value={(idTema != null) ? idTema : -1}
                ><option selected hidden value={-1}></option>
                  {temas && (temas.length > 0) ? (
                    temas.map((p, index) => (
                      <option value={p.idTema} key={'opt-sec-' + index}>{p.tema}</option>
                    ))

                  ) : (<option disabled>No hay temas para mostrar</option>)
                  }
                </select> */}
              </div>
              <div className="form-group dos-columnas">
                <label for="">idTema</label>
                <input type="text" className="form-control" id="idTema" name="idTema" pattern="[0-9]*"
                  onChange={e => handleFormChange(e)} value={idTema} required />
              </div>
              <button class="btn btn-primary" type="submit" id="boton-buscar" >Agregar Tema</button>
            </form>
            <h4>
              Temas de la Norma
            </h4>
            <table class="table table-bordered" >
              <thead>
                <tr>
                  <th scope="col">Id</th>
                  <th scope="col">Tema</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Jerarquia</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {
                  temasNorma.length > 0 ? (
                    temasNorma.map(n => (
                      <tr>
                        <td>{n.tema.idTema}</td>
                        <td>{decode(n.tema.tema)}</td>
                        <td>{decode(n.tema.descripcion)}</td>
                        <td class="small font-weight-light text-center">{n.jerarquia ? decode(n.jerarquia) : "Sin jerarquia"}</td>
                        <td>
                          <div class="dropdown-container">
                            <div class="drowdown">
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarTema(n.tema.idTema)} >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                    : (<tr><td>Sin temas...</td></tr>)
                }
              </tbody>
            </table>
            <hr />
            <h4 className="card-title mb-4">
              DESCRIPTORES
            </h4>
            <form className="form tab" onSubmit={e => handleSubmitDescriptores(e)}>
              <div className="form-group">
                <label for="alcance">Lista de Descriptores</label>
                <div className="dropdown-container" >
                  <div className={descriptores && descriptores.length > 0 ? "dropdown show" : "dropdown"}>
                    <input className="form-control buscador" value={decode(descriptor.descriptor)} onChange={async (e) => await getDescriptores(e.target.value)} data-toggle="dropdown" />
                    <div className={descriptores && descriptores.length > 0 ? "dropdown-menu show" : "dropdown-menu"} id="autocomplete-options">
                      {descriptores && descriptores.length > 0 &&
                        descriptores.map(elem =>
                          <button className="dropdown-item btn btn-sm" type="button" onClick={() => { setDescriptor(elem) }}>{decode(elem.descriptor)}</button>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label for="descriptores">idDescriptor</label>
                <input type="text" className="form-control" id="idDescriptor" name="idDescriptor" pattern="[0-9]*"
                  onChange={e => handleFormChange(e)} value={descriptor.id} required />
              </div>
              <button class="btn btn-primary" type="submit" id="boton-buscar">Agregar Descriptor</button>
            </form>
            <h4>Descriptores de la Norma</h4>
            <TablaDescriptores descriptores={descriptoresNorma} />
            {ramaNorma && 
              <form className="form" onSubmit={e => handleSubmit(e)}>
                <div className="form-group">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="aprobadoDocumentalmente"
                      id="aprobadoDocumentalmente" checked={aprobadoDocumentalmente} onChange={e => setAprobadoDocumentalmente(e.target.checked)} />
                    <label for="aprobadoDocumentalmente" class="custom-control-label">Aprobado Documentalmente</label>
                  </div>
                </div>
                <button hidden={norma.aprobadoDocumentalmente == aprobadoDocumentalmente} className="btn btn-success boton-guardar" type="submit" id="boton-buscar">Guardar</button>
              </form>
            }
          </div>
        </div>
        <div class="alert-wrapper mt-3" hidden={!errorAgregarDescriptor}>
          <div class="alert alert-danger" role="alert">
            <p>Error: El descriptor seleccionado ya pertenece a la norma.</p>
          </div>
        </div>

      </>
    )
  }

}

export default AnalisisDocumental;