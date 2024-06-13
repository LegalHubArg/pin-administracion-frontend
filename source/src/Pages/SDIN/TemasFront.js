import React, { useEffect, useState } from "react";
//Obelisco
import '@gcba/obelisco/dist/obelisco.css';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import CodeMirror from 'codemirror';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/lib/codemirror.css';

const Temas = props => {

  const [isLoading, setLoading] = useState(false)
  const [html, setHtml] = useState("");
  const [guardadoCorrectamente, setGuardadoCorrectamente] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let token = localStorage.getItem("token");
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      html,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    }
    try {
      await ApiPinPost('/api/v1/dj/arbol-tematico/guardar', body, token)
        .then(_ => {
          setGuardadoCorrectamente(true)
          setErrorGuardado(false)
          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (error) {
      setLoading(false)
      setErrorGuardado(true)
      setGuardadoCorrectamente(false)
    }
  }
  const traerArbolTematico = async () => {
    let token = localStorage.getItem("token");
    try {
      await ApiPinGet('/api/v1/dj/arbol-tematico', token)
        .then(res => {
          setHtml(res.data.data[0].html)
        })
        .catch((err) => {
          throw err
        })
    }
    catch (error) {
    }
  }

  useEffect(async () => {
    await traerArbolTematico();
    const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      mode: "htmlmixed",
      smartIndent: true,
      lineNumbers: true
    });
    editor.setSize("100%", 500);
    editor.on("change", () => setHtml(editor.getValue()))

  }, [])

  return (
    <>
      <div className="container responsive">
        <form onSubmit={handleSubmit}>
          <textarea id="editor" value={html} onChange={(e) => setHtml(e.target.value)} />
          <br />
          <button class="btn btn-primary mb-5" disabled={isLoading}>Guardar</button>
          {guardadoCorrectamente && <div className="alert alert-success">Guardado correctamente!</div>}
          {errorGuardado && <div className="alert alert-danger">Error al guardar.</div>}
        </form>
      </div>
    </>
  );
};

export default Temas;
