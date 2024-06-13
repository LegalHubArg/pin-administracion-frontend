import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import moment from "moment";
import "./Formularios.css";
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import { ModalBuscador } from '../../Components/Modales/ModalBuscadorDigesto';
import { getCausales, getNormaSubtipos } from '../../Helpers/consultas';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasDJ, rutasSDIN } from '../../routes';
import { Modal } from 'react-bootstrap';
import { decode } from 'html-entities';
var b64toBlob = require('b64-to-blob');

const AntecedentesEquivalencias = props => {
  const navigate = useNavigate();

  const { idNormaSDIN } = useParams();

  const [isLoading, setLoading] = useState(false)
  const [modalError, setModalError] = useState({ show: false, mensaje: '' })
  const [extensionesPermitidas, setExtensionesPermitidas] = useState()
  const [limiteArchivo,setLimiteArchivo] = useState()

  const initForm = {
    anexoAntecedentes: null,
    anexoEquivalencias: null,
    leyesDigesto: []
  }

  const [form, setForm] = useState(initForm)
  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'anexoAntecedentes':
        value = e.target.value;
        setForm({ ...form, ['anexoAntecedentes']: value })
        break;
      case 'anexoEquivalencias':
        value = e.target.value;
        setForm({ ...form, ['anexoEquivalencias']: value })
        break;
    }
  }

  const [norma, setNorma] = useState({})
  const [leyesDigesto, setLeyesDigesto] = useState([])

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
      await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario7/guardar', body, token)
        .then(_ => {
          navigate(`${rutasSDIN.home}/${rutasSDIN.ficha_norma.replace(':idNormaSDIN', idNormaSDIN)}`, { state: { tab: "Analisis Epistemologico" } })
        })
    }
    catch (error) {
      setLoading(false)
      setModalError({ show: true, mensaje: error.data.e.mensaje ? error.data.e.mensaje : 'Ocurrió un error al guardar el formulario.' })

    }
  }

  const getFormulario7 = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      const formulario = await ApiPinPost('/api/v1/dj/analisis-epistemologico/formulario7', body, token)
        .catch((err) => {
          throw err
        });
      if (formulario.data.data.length === 1) {
        const data = formulario.data.data[0];
        setForm({
          anexoAntecedentes: data.anexoAntecedentes,
          anexoEquivalencias: data.anexoEquivalencias,
          leyesDigesto: data.leyesDigesto
        });
      }
    }
    catch (e) {
      //console.log(e)
    }
  }

  const getLeyesDigesto = async () => {
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    let token = localStorage.getItem("token");
    try {
      await ApiPinGet('/api/v1/dj/leyes-digesto', body, token)
        .then((res) => {
          setLeyesDigesto(res.data.data.filter(n => !n.esUltima))
        })
        .catch((err) => {
          throw err
        });
    }
    catch (e) {
      //console.log(e)
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

  const handleVerDocumento = (e) => {
    let token = localStorage.getItem("token");
    ApiPinPost('/api/v1/dj/traerArchivoBucketS3', { nombre: e }, token).then((res) => {
      let blob = b64toBlob(res.data, 'application/pdf')
      let blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl)
    }).catch(e => { /* console.log(e) */ })
    return;
  }

  const leerArchivo = (archivo) => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      try {
        fileReader.readAsDataURL(archivo);
        fileReader.onloadend = () => {
          resolve(fileReader.result)
        }
      }
      catch (e) {
        reject(e)
      }
    })
  }

  const handleDocChange = async (e) => {
    let aux = form.leyesDigesto;
    if (e.target.type === "file") {
      let docSize = e.target.files[0].size;
      if (!extensionesPermitidas.includes(e.target.files[0].type)) {
        setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
        setForm({ ...form, ['leyesDigesto']: aux })
        return;
      }
      if (docSize > limiteArchivo){
        setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
        setForm({ ...form, ['leyesDigesto']: aux })
        return;
      }
      const idLeyDigesto = parseInt(e.target.name.replace('archivo', ''));
      let indice = aux.findIndex(n => n.idLeyDigesto === idLeyDigesto);
      if (indice === -1) {
        aux.push({ idLeyDigesto, archivo: null, archivoBase64: null, documentoConsolidado: false });
        indice = aux.findIndex(n => n.idLeyDigesto === idLeyDigesto);
      }
      await leerArchivo(e.target.files[0])
        .then((res) => {
          aux[indice].archivoBase64 = res;
          aux[indice].archivo = e.target.files[0].name;
        })
        .catch((e) => {
          //console.log(e)
        })
    }
    if (e.target.type === "checkbox") {
      const idLeyDigesto = parseInt(e.target.name.replace('documentoConsolidado', ''))
      let indice = aux.findIndex(n => n.idLeyDigesto === idLeyDigesto);
      aux[indice].documentoConsolidado = e.target.checked;
    }
    setForm({ ...form, ['leyesDigesto']: aux })
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
    await getLeyesDigesto();
    await getFormulario7();
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
                <input className="form-control" id="idNormaSDIN" name="idNorma"
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
              <label for="anexoAntecedentes">Anexo antecedentes</label>
              <textarea className="form-control" id="anexoAntecedentes" name="anexoAntecedentes" rows="4"
                onChange={e => handleFormChange(e)} value={form.anexoAntecedentes}
              />
            </div>
            <div className="form-group">
              <label for="anexoEquivalencias">Anexo equivalencias</label>
              <textarea className="form-control" id="anexoEquivalencias" name="anexoEquivalencias" rows="4"
                onChange={e => handleFormChange(e)} value={form.anexoEquivalencias}
              />
            </div>
            <br /><h3>Documentos</h3>
            {leyesDigesto && leyesDigesto.length > 0 && leyesDigesto.sort((a, b) => b.anio - a.anio).map(
              (elem) => <>
                <div className="card">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="form-group">
                      <label for={"leyDigesto" + elem.idLeyDigesto}>Ley Digesto</label>
                      <input disabled className="form-control" id={"leyDigesto" + elem.idLeyDigesto}
                        name={"leyDigesto" + elem.idLeyDigesto} value={'Ley Digesto ' + elem.anio} />
                    </div>
                    <div className="form-group">
                      <label for={"documentoNombre" + elem.idLeyDigesto}>Nombre</label>
                      <input disabled className="form-control" id={"documentoNombre" + elem.idLeyDigesto}
                        name={"documentoNombre" + elem.idLeyDigesto} value={decode(norma.normaTipo + '-' + norma.normaNumero)} />
                    </div>
                    <div className="form-group">
                      <label for={"archivo" + elem.idLeyDigesto}>Archivo</label>
                      <input type="file" className="form-control-file" id={"archivo" + elem.idLeyDigesto} name={"archivo" + elem.idLeyDigesto}
                        onChange={(e) => handleDocChange(e)} accept={extensionesPermitidas} />
                    </div>
                    <div className="custom-control custom-checkbox">
                      <input
                        className="custom-control-input"
                        type="checkbox"
                        id={"documentoConsolidado" + elem.idLeyDigesto}
                        name={"documentoConsolidado" + elem.idLeyDigesto}
                        // disabled={!form.leyesDigesto.find((n) => n.idLeyDigesto === elem.idLeyDigesto)}
                        checked={form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.documentoConsolidado}
                        onChange={(e) => handleDocChange(e)}
                      />
                      <label className="custom-control-label" for={"documentoConsolidado" + elem.idLeyDigesto}>
                        Consolidado
                      </label>
                    </div>
                    {(form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.archivoS3 ||
                      form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.archivo) &&
                      <button type="button" className="btn btn-link"
                        onClick={() =>
                          handleVerDocumento(form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.archivoS3)
                        }>
                        Ver Documento Actual
                      </button>}
                  </div>
                  {form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.archivo &&
                    <p className="ml-4 mr-4">
                      <b>Nombre del documento actual: </b>
                      {form.leyesDigesto.find(n => n.idLeyDigesto === elem.idLeyDigesto)?.archivo}
                    </p>}
                </div>
                <br />
              </>
            )}
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

export default AntecedentesEquivalencias;