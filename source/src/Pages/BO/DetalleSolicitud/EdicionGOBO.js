import React, { useState, useEffect } from 'react';

//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import moment from "moment";
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
// Navigation
import { linkToParams } from "../../../Helpers/Navigation";
import { useNavigate } from 'react-router-dom';
//DateTime
import { timestampToDateFormat } from '../../../Helpers/DateTime';

const EdicionGOBO = props => {

  const [isLoading, setLoading] = useState(true) //API Check
  const [form, setForm] = useState(props.form);
  const [organismos, setOrganismos] = useState(null);
  const [jerarquias, setJerarquias] = useState(null);
  const [permisos, setPermisos] = useState(null)
  const [reparticiones, setReparticiones] = useState(null);

  const navigate = useNavigate();

  //Inicial Hook
  useEffect(async () => {
    if (props.form) {
      let unForm = form;
      if (unForm.fechaSugerida !== null && unForm.fechaLimite !== null) {
        unForm.fechaSugerida = timestampToDateFormat(form.fechaSugerida, 'YYYY-MM-DD')
        unForm.fechaLimite = timestampToDateFormat(form.fechaLimite, 'YYYY-MM-DD')
      }
      if (unForm.fechaDesde !== null && unForm.fechaHasta !== null) {
        unForm.fechaDesde = timestampToDateFormat(form.fechaDesde, 'YYYY-MM-DD')
        unForm.fechaHasta = timestampToDateFormat(form.fechaHasta, 'YYYY-MM-DD')
      }

      const orgs = await traerOrganismos()
      let orgSeleccionado = orgs?.find(o => o.sigla === form?.organismoEmisor)
      unForm.idOrgEmisor = orgSeleccionado?.idOrgEmisor
      unForm.organismoEmisor = orgSeleccionado?.sigla

      setForm(unForm)
      await Promise.all([
        getPermisos(),
      ]);
      let normaTipos = await traerTiposDeNormasPorSeccion(permisos, form.idSeccion)
      let repas = form.seccionEsPoder ?
        await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', { idSumarioNormasTipo: normaTipos && normaTipos.filter(n => n.idNormaTipo === form.idNormaTipo)[0].idSumarioNormasTipo }, localStorage.getItem("token"))
        :
        await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/reparticiones', { idSeccion: form.idSeccion }, localStorage.getItem("token"))
      setReparticiones(repas.data.data)
      setLoading(false);
    }
  }, [])

  // useEffect(() => {
  //   let siglasNuevas = organismos?.find(o => o.sigla === organismoSeleccionado?.sigla).sigla
  //   setSigla(siglasNuevas)
  // }, [organismoSeleccionado])


  const getPermisos = async () => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idCuenta: JSON.parse(localStorage.getItem("perfiles"))[0].idCuenta
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/cuenta/permisos', body, token).then((res) => {
        setPermisos(res.data.data)
      }).catch(function (error) {
        throw error
      });
      setLoading(false)
    }
    catch (error) {
      setLoading(false)
      throw error
    }
  }

  const traerTiposDeNormasPorSeccion = async (perm, idSeccion) => {
    try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idSeccion: idSeccion
      }
      let token = localStorage.getItem("token");
      const { data: { data: data } } = await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipos', body, token)
      if (JSON.parse(localStorage.getItem("perfil")).idPerfil === 5) {
        return data
      }
      else {
        if (perm && perm != {}) {
          let permisos_con_item_del_sumario = perm.map(n => ({ ...n, idSumarioNormasTipo: data.find(item => item.idNormaTipo === n.idNormaTipo)?.idSumarioNormasTipo }));
          permisos_con_item_del_sumario = permisos_con_item_del_sumario.filter(item => item.idSumarioNormasTipo !== undefined && item.idSeccion === idSeccion)
          permisos_con_item_del_sumario = permisos_con_item_del_sumario.map(({ idNormaTipo, idSumarioNormasTipo, normaTipo }) => ({ idNormaTipo, idSumarioNormasTipo, normaTipo }))
          const removeDuplicates = (arr, prop) => {
            const unique = new Map();
            return arr.filter(obj => !unique.has(obj[prop]) && unique.set(obj[prop], obj));
          };
          const uniqueArray = removeDuplicates(permisos_con_item_del_sumario, 'idNormaTipo');
          return uniqueArray
        }
      }
    }
    catch (error) {
    }
  }


  // //Check Form
  // useEffect(() => {
  //   console.log(form)
  // }, [form])


  //Traer Organismos
  const traerOrganismos = async () => {
    try {
      let body = {};
      body.usuario = localStorage.getItem("user_cuit");
      let token = localStorage.getItem("token");
      const res = await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores', body, token)
      // setJerarquias(res.data.data)
      // let filtrados = filtrarOrganismos(res.data.data);
      setOrganismos(res.data.data)
      setLoading(false)
      return res.data.data

    }
    catch (error) {
      setLoading(true)
      linkToParams('/', {}, navigate)
    }
  }

  const handleFormChange = (e) => {
    let value;
    switch (e.target.name) {
      case 'idOrgEmisor':
        value = parseInt(e.target.value);
        // let org = organismos.filter(e => e.idOrgEmisor === value)

        let org = organismos?.find((org) => org.idOrgEmisor === parseInt(value))
        // if (org.length !== 0){
        //   let siglas = org[0].sigla
        //   setOrganismoNombreArchivo(siglas)
        // }
        setForm({
          ...form,
          ['idOrgEmisor']: value,
          organismoEmisor: org.sigla
        })
        //filtrarReparticiones(value)
        //traerReparticionPorOrganismo(permisos, value)
        break;
      case 'idReparticion':
        value = parseInt(e.target.value);
        setForm({
          ...form,
          ['idReparticion']: value
        })
        break;
      case 'fechaSugerida':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaSugerida']: value
        })
        break;
      case 'fechaLimite':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaLimite']: value
        })
        break;
      case 'fechaDesde':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaDesde']: value
        })
        break;
      case 'fechaHasta':
        value = e.target.value;
        setForm({
          ...form,
          ['fechaHasta']: value
        })
        break;
      case 'tags':
        if (e.target.validity.valid) {
          value = e.target.value;
          setForm({
            ...form,
            ['tags']: value
          })
        }
        break;
      default:
        value = e.target.value;
        setForm({
          ...form,
          [e.target.name]: value
        })
        break;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let body = form;
    body.usuario = localStorage.getItem("user_cuit");
    let token = localStorage.getItem("token");
    await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar-meta', body, token).then(res => {
      window.location.reload()
    }).catch(function (error) {
    });
  }

  if (isLoading) {
    return (<Spinner />)
  }
  else {
    return (
      <>
        <form className="form" onSubmit={e => handleSubmit(e)}>
          <div class="row g-2 align-items-center">
            <div class="col-auto">
              <div className="form-group">
                <label for="idOrgEmisor">Organismo</label>
                <select className="custom-select" id="idOrgEmisor" name="idOrgEmisor" value={form?.idOrgEmisor} required onChange={(e) => handleFormChange(e)}>
                  <option value={""} disabled>Seleccione un organismo</option>
                  {organismos && organismos.length > 0 ? (
                    organismos.map((p, index) => (
                      <option value={p.idOrgEmisor} key={'opt-organismo-' + index}>({p.sigla}) {p.nombre}</option>
                    ))
                  ) : (
                    <option disabled>No hay organismos para mostrar</option>
                  )}
                </select>

              </div>
            </div>
            <div class="col-auto">
              <div className="form-group">
                <label for="idReparticion">Repartición</label>
                <select className="custom-select" id="idReparticion" name="idReparticion" onChange={(e) => handleFormChange(e)}>
                  {reparticiones && (reparticiones != {}) ? (
                    <>
                      <option value={""} disabled>Seleccione una repartición</option>
                      {reparticiones.map((p, index) =>
                        <option value={p.idReparticion} selected={p.idReparticion === form.idReparticion} key={'opt-reparticiones-' + index}>{p.reparticion}</option>
                      )
                      }
                    </>
                  ) : (<option selected disabled>No hay reparticiones para mostrar</option>)
                  }
                </select>
              </div>
            </div>
          </div>
          {([4, 5, 6, 10].includes(form.idSeccion)) ? (
            <div class="row g-2 align-items-center">
              <div class="col-auto">
                <div className="form-group sinmargeninferior">
                  <label for="fechaDesde">Fecha Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaDesde"
                    name="fechaDesde"
                    aria-describedby="date-help"
                    onChange={e => handleFormChange(e)}
                    value={form.fechaDesde}
                    min={
                      JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 ?
                        moment().day() === 5
                          ? moment().add(3, 'day').format('YYYY-MM-DD')
                          : moment().day() === 6
                            ? moment().add(2, 'day').format('YYYY-MM-DD')
                            : moment().format('YYYY-MM-DD')
                        : moment().hours() < 15 // simples mortales
                          ? moment().day() === 5
                            ? moment().add(3, 'day').format('YYYY-MM-DD')
                            : moment().add(1, 'day').format('YYYY-MM-DD')
                          : moment().day() === 5
                            ? moment().add(4, 'day').format('YYYY-MM-DD')
                            : moment().add(2, 'day').format('YYYY-MM-DD')
                    }
                  />
                  <span id="date-help" className="form-text" style={{ fontSize: 10 }}>
                    Ingrese una fecha posterior a hoy (48 hs).
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <div className="form-group sinmargeninferior">
                  <label for="fechaHasta">Fecha Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaHasta"
                    name="fechaHasta"
                    aria-describedby="date-help"
                    onChange={e => handleFormChange(e)}
                    value={form.fechaHasta}
                    min={{}}
                  /* disabled={!habilitar} */
                  />
                  <span id="date-help" className="form-text" style={{ fontSize: 10 }}>
                    Ingrese una fecha posterior a hoy (48 hs).
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div class="row g-2 align-items-center">
              <div class="col-auto">
                <div className="form-group sinmargeninferior">
                  <label for="fechaSugerida">Fecha Sugerida</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaSugerida"
                    name="fechaSugerida"
                    aria-describedby="date-help"
                    onChange={e => handleFormChange(e)}
                    value={form.fechaSugerida}
                    min={
                      JSON.parse(localStorage.getItem("perfil")).idPerfil === 5 ?
                        moment().day() === 5
                          ? moment().add(3, 'day').format('YYYY-MM-DD')
                          : moment().day() === 6
                            ? moment().add(2, 'day').format('YYYY-MM-DD')
                            : moment().format('YYYY-MM-DD')
                        : moment().hours() < 15 // simples mortales
                          ? moment().day() === 5
                            ? moment().add(3, 'day').format('YYYY-MM-DD')
                            : moment().add(1, 'day').format('YYYY-MM-DD')
                          : moment().day() === 5
                            ? moment().add(4, 'day').format('YYYY-MM-DD')
                            : moment().add(2, 'day').format('YYYY-MM-DD')
                    }
                  />
                  <span id="date-help" className="form-text" style={{ fontSize: 10 }}>
                    Ingrese una fecha posterior a hoy (48 hs).
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <div className="form-group sinmargeninferior">
                  <label for="fechaLimite">Fecha Límite</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaLimite"
                    name="fechaLimite"
                    aria-describedby="date-help"
                    onChange={e => handleFormChange(e)}
                    value={form.fechaLimite}
                    min={{}}
                  /* disabled={!habilitar} */
                  />
                  <span id="date-help" className="form-text" style={{ fontSize: 10 }}>
                    Ingrese una fecha posterior a hoy (48 hs).
                  </span>
                </div>
              </div>
            </div>
          )}


          <div className="form-group tags sinmargeninferior">
            <label for="tags">Tags</label>
            <input type="text" className="form-control" placeholder="Ingrese tags y presione enter" id="tags" name="tags" pattern="^[a-zA-Z,]*$" onChange={e => handleFormChange(e)} value={form.tags} />
          </div>
          <div className="form-group sumario">
            <label for="normaSumario">Sumario</label>
            <textarea className="form-control" id="normaSumario" name="normaSumario" rows="4" onChange={e => handleFormChange(e)} value={form.normaSumario}></textarea>
          </div>

          <div style={{ display: "flex", alignItems: "center", gridRowStart: "13" }}>
            <button type="submit" className="btn btn-primary" disabled={false} id="ingresar-solicitud">Actualizar Solicitud</button>
          </div>

        </form>
      </>
    )
  }
}


export default EdicionGOBO;