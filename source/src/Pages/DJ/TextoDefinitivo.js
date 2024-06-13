import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import moment from "moment";
import "./Formularios.css";
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import { getCausales, getNormaSubtipos } from '../../Helpers/consultas';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasDJ, rutasSDIN } from '../../routes';
import { Modal } from 'react-bootstrap';
import { decode } from 'html-entities';
const b64toBlob = require('b64-to-blob');

const TextoDefinitivo = props => {
  const navigate = useNavigate();

  const { idNormaSDIN } = useParams();

  const [isLoading, setLoading] = useState(false)
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })
  const [extensionesPermitidas, setExtensionesPermitidas] = useState()
  const [limiteArchivo,setLimiteArchivo] = useState()
  const initForm = {
    textoDefinitivo: null,
    textoDefinitivoAnexo: null,
    observacionesGenerales: null,
    archivo: null,
    archivoS3: null,
    documentoConsolidado: false,
    archivoBase64: null
  }

  const [norma, setNorma] = useState({})
  const [normaActiva, setNormaActiva] = useState({})

  const [form, setForm] = useState(initForm)

  const handleArchivo = (e) => {
    e.preventDefault()
    let docSize = e.target.files[0].size
    if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
      setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
      setForm({ ...form, ['archivoBase64']: null, ['archivo']: null })
      return;
    }
    if (Array.from(e.target.files).some(n => n.size > limiteArchivo)){
      setModalError({ show: true, mensaje: "Un archivo seleccionado supera el límite permitido en PIN." })
      setForm({ ...form, ['archivoBase64']: null, ['archivo']: null })
      document.getElementById('archivo').value = null
      return;
    }
    let fileReader = new FileReader();
    try {
      fileReader.readAsDataURL(e.target.files[0]);
      fileReader.onloadend = () => {
        setForm({ ...form, ['archivoBase64']: fileReader.result, ['archivo']: e.target.files[0].name })
      }
    }
    catch (e) {
      //console.log(e)
    }
  }

  const handleVerDocumento = async () => {
    try {
      let token = localStorage.getItem("token");
      setLoading(true)
      await ApiPinPost('/api/v1/dj/traerArchivoBucketS3', { nombre: form.archivoS3 }, token).then((res) => {
        let blob = b64toBlob(res.data, 'application/pdf')
        let blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl)
      })
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
      setModalError({ show: true, mensaje: error.data.mensaje ? error.data.mensaje : 'Ocurrió un error al buscar el documento.' })
    }
  }

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'observacionesGenerales':
        value = e.target.value;
        setForm({ ...form, ['observacionesGenerales']: value })
        break;
      case 'documentoConsolidado':
        value = e.target.checked;
        setForm({ ...form, ['documentoConsolidado']: value })
        break;
      case 'textoDefinitivo':
        value = e.target.value;
        setForm({ ...form, ['textoDefinitivo']: value })
        break;
      case 'textoDefinitivoAnexo':
        value = e.target.value;
        setForm({ ...form, ['textoDefinitivoAnexo']: value })
        break;
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let body = {
      ...form,
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario6/guardar', body, token)
        .then(_ => {
          navigate(`${rutasSDIN.home}/${rutasSDIN.ficha_norma.replace(':idNormaSDIN', idNormaSDIN)}`, { state: { tab: "Analisis Epistemologico" } })
        })
        .catch((err) => {
          throw err
        })
    }
    catch (error) {
      setLoading(false)
      setModalError({ show: true, mensaje: error.data.e.mensaje ? error.data.e.mensaje : 'Ocurrió un error al guardar el formulario.' })
    }
  }

  const getNorma = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost('/api/v1/sdin/norma', body, token)
        .then(res => {
          setNorma(res.data.norma[0]);
        })
        .catch((err) => {
          throw err
        })
    }
    catch (e) {
      //console.log(e)
    }
  }

  const getFormulario6 = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      const formulario = await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario6', body, token)
        .catch((err) => {
          throw err
        });
      if (formulario.data.data.length === 1) {
        const data = formulario.data.data[0];
        setForm({
          observacionesGenerales: data.observacionesGenerales,
          textoDefinitivo: data.textoDefinitivo,
          textoDefinitivoAnexo: data.textoDefinitivoAnexo,
          archivo: data.archivo,
          documentoConsolidado: !!data.documentoConsolidado,
          archivoS3: data.archivoS3,
          archivoBase64: null
        });
      }
    }
    catch (e) {
      //console.log(e)
    }
  }

  const traerExtensiones = async () => {
    const { data: { data } } = await ApiPinGet('/api/v1/auth/extensiones', localStorage.token);

    setExtensionesPermitidas(data)
  }
  const traerLimiteArchivo = async () =>{
    await ApiPinGet('/api/v1/auth/limiteArchivo', localStorage.token)
      .then(res=>{
        setLimiteArchivo(parseInt(res.data.data))
      })
      .catch(err=>{
        throw Error(String(err))
      })
  }

  //Hook inicial
  useEffect(async () => {
    setLoading(true)
    await getNorma()
    await getFormulario6()
    await traerExtensiones()
    await traerLimiteArchivo()
    setLoading(false)
  }, [])

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <div className="container responsive mb-5" id="abrogacion-expresa">
          <h3>Norma:</h3>
          <div className="card">
            <div className="card-body formulario-asiento">
              <div className="form-group">
                <label for="asiento">idNorma</label>
                <input className="form-control" id="idNorma" name="idNorma"
                  onChange={e => handleFormChange(e)} value={norma.idNormaSDIN} disabled />
              </div>
              <div className="form-group">
                <label for="tipo">Tipo</label>
                <input className="form-control" id="tipo" name="tipo" disabled value={decode(norma.normaTipo)} />
              </div>
              <div className="form-group">
                <label for="normaNumero">Número</label>
                <input className="form-control" id="normaNumero" name="normaNumero" disabled value={norma.normaNumero} />
              </div>
              <div className="form-group">
                <label for="normaAnio">Año</label>
                <input className="form-control" id="normaAnio" name="normaAnio" disabled value={norma.normaAnio} />
              </div>
              <div className="form-group">
                <label for="fechaSancion">Fecha Sanción</label>
                <input className="form-control" id="fechaSancion" name="fechaSancion" disabled value={norma.fechaSancion ? moment(norma.fechaSancion).format("DD/MM/YYYY") : ""} />
              </div>
              <div className="form-group rama">
                <label for="rama">Rama</label>
                <input className="form-control" id="rama" name="rama" disabled value={norma.rama} />
              </div>
              <div className="form-group organismo">
                <label for="rama">Organismo</label>
                <input className="form-control" id="organismo" name="organismo" disabled value={decode(norma.organismo)} />
              </div>
            </div>
          </div>
          <br />
          <form className="form" onSubmit={e => handleSubmit(e)}>
            <div className="form-group">
              <label for="textoDefinitivo">Texto definitivo</label>
              <textarea className="form-control" id="textoDefinitivo" name="textoDefinitivo" rows="10"
                onChange={e => handleFormChange(e)} value={form.textoDefinitivo}
              />
            </div>
            <div className="form-group">
              <label for="textoDefinitivoAnexo">Texto definitivo anexo</label>
              <textarea className="form-control" id="textoDefinitivoAnexo" name="textoDefinitivoAnexo" rows="10"
                onChange={e => handleFormChange(e)} value={form.textoDefinitivoAnexo}
              />
            </div>
            <br />
            <h3>Documento</h3>
            <div className="card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div className="form-group">
                  <label for="documento">Nombre</label>
                  <input disabled className="form-control" id="documentoNombre" name="documentoNombre" value={decode(norma.normaTipo + '-' + norma.normaNumero)} />
                </div>
                <div className="form-group">
                  <label for="archivo">Archivo</label>
                  <input type="file" className="form-control-file" id="archivo" name="archivo" accept={extensionesPermitidas}
                    onChange={(e) => handleArchivo(e)} />
                </div>
                <div className="custom-control custom-checkbox">
                  <input
                    className="custom-control-input"
                    type="checkbox"
                    id="documentoConsolidado"
                    name="documentoConsolidado"
                    checked={form.documentoConsolidado}
                    onChange={(e) => handleFormChange(e)}
                  />
                  <label className="custom-control-label" for="documentoConsolidado">
                    Consolidado
                  </label>
                </div>
                {(form.archivoS3 || form.archivo) && <button type="button" className="btn btn-link" onClick={() => handleVerDocumento()}>Ver Documento Actual</button>}
              </div>
              {form.archivo && <p className="ml-4 mr-4"><b>Nombre del documento actual: </b>{form.archivo}</p>}
            </div>
            <br />
            <div className="form-group">
              <label for="observaciones">Observaciones Generales</label>
              <textarea className="form-control" id="observaciones" name="observacionesGenerales" rows="4"
                onChange={e => handleFormChange(e)} value={form.observacionesGenerales}
              />
            </div>
            <br />
            <button type="button" className="btn btn-secondary mr-2"
              onClick={() => navigate('/sdin/ficha-norma/' + norma.idNormaSDIN, { state: { tab: 'Analisis Epistemologico' } })}>
              Volver a Análisis Epistemológico
            </button>
            <button className="btn btn-primary">Guardar</button>
          </form>
        </div >
        <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
          <Modal.Header>
            <Modal.Title>Error</Modal.Title>
            <i className='bx bx-x bx-sm' type="button" onClick={() => setModalError({ show: false, mensaje: '' })}></i>
          </Modal.Header>
          <Modal.Body>
            <div class="alert alert-danger" role="alert">
              <p>{modalError?.mensaje}</p>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    )
  }

}

export default TextoDefinitivo;