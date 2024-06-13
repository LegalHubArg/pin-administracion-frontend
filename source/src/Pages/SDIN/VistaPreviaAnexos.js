import React, { useEffect, useState } from "react";
//Obelisco
import '@gcba/obelisco/dist/obelisco.css';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import b64toBlob from 'b64-to-blob';

const Anexos = props => {

  const [isLoading, setLoading] = useState(false)
  const [guardadoCorrectamente, setGuardadoCorrectamente] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [ramas, setRamas] = useState([]);
  const [opcionRadio, setOpcionRadio] = useState('firmar-generado');
  const [loadingPdf, setLoadingPdf] = useState(false)

  const traerAnexoPorTipo = async (ruta) => {
    setLoadingPdf(true)
    let token = localStorage.getItem("token");
    try {
      await ApiPinGet(`/api/v1/dj/${ruta}/previo`, token)
        .then(res => {
          let blob = b64toBlob(res.data.data, 'application/pdf');
          let fileURL = URL.createObjectURL(blob);
          window.open(fileURL);
          setLoadingPdf(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (error) {
      setLoadingPdf(false)
    }
  }

  const traerAnexoIPorRama = async (idRama) => {
    setLoadingPdf(true)
    let token = localStorage.getItem("token");
    try {
      await ApiPinPost(`/api/v1/dj/anexoI/previo`, { idRama }, token)
        .then(res => {
          let blob = b64toBlob(res.data.data, 'application/pdf');
          let fileURL = URL.createObjectURL(blob);
          window.open(fileURL);
          setLoadingPdf(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (error) {
      setLoadingPdf(false)
    }
  }

  useEffect(async () => {
    await ApiPinPost('/api/v1/sdin/ramas', { usuario: localStorage.getItem("user_cuit") }, localStorage.getItem("token"))
      .then((res) => {
        setRamas(res.data.ramas);
      })
  }, [])

  useEffect(() => {
    if (loadingPdf) document.body.style.cursor = 'progress'
    else document.body.style.cursor = 'default'
  }, [loadingPdf])

  if (isLoading)
    return <Spinner />
  else
    return (
      <>
        <div className="container responsive">
          <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
            Anexo I (Listado)
            <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoI/listado')}>Generar PDF</button>
          </div>
          <ul>
            {ramas && ramas.map((elem) => (
              <li style={{ marginBlock: "1em" }}>
                {elem.rama}
                <button type="button" disabled={loadingPdf} className="btn btn-link btn-sm ml-5" onClick={() => traerAnexoIPorRama(elem.idRama)}>Generar PDF</button>
              </li>
            ))}
          </ul>
          <hr />
          <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
            Anexo II
            <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoII')}>Generar PDF</button>
          </div>
          <hr />
          <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
            Anexo III
            <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoIII')}>Generar PDF</button>
          </div>
          <hr />
          <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
            Anexo IV
            <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoIV')}>Generar PDF</button>
          </div>
        </div>
      </>
    );
};

export default Anexos;
