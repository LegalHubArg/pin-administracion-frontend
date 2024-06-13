import React, { useState, useEffect } from 'react';
import './login.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Config from '../../config';
import { rutasBO } from '../../routes';
import { ApiPinGet } from '../../Helpers/ApiComunicator';

const Login = props/* ({ setVistasUsuario }) */ => {

  const [usuario, setUsuario] = useState({
    usuario: '',
    password: '',
    captchaToken: ''
  })
  const [deshabilitarBoton, setDeshabilitarBoton] = useState(true);
  const [error, setError] = useState({
    status: 'ok',
    mensaje: ''
  });

  const [captchaFlag, setCaptchaFlag] = useState(true)

  async function chequeoCaptcha() {
    const { data: chequeo } = await ApiPinGet('/api/v1/auth/checkCaptcha', localStorage.token)
    setCaptchaFlag(chequeo);
    return chequeo;
  }

  const handleInputChange = (event) => {
    if (event.target.name === 'usuario') {
      const valorActualizable = (event.target.validity.valid) ? event.target.value : usuario.usuario;
      setUsuario({
        ...usuario,
        [event.target.name]: valorActualizable
      })
    }
    else {
      setUsuario({
        ...usuario,
        [event.target.name]: event.target.value
      })

    }
  }

  useEffect(() => {
    //Validacion de los datos ingresados Y reCAPTCHA
    let validaDatosUsuario = true;
    validaDatosUsuario = validaDatosUsuario && usuario.usuario !== null;
    validaDatosUsuario = validaDatosUsuario && usuario.usuario.length > 0;
    validaDatosUsuario = validaDatosUsuario && usuario.password !== null;
    validaDatosUsuario = validaDatosUsuario && usuario.password.length > 0;

    setDeshabilitarBoton(!validaDatosUsuario)

    if (usuario && error && error?.status !== 'ok') {
      setError({
        status: 'ok',
        mensaje: ''
      })
    }

  }, [usuario]); // actualización del formulario

  let navigate = useNavigate();

  function getCaptchaToken() {
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(_ => {
        window.grecaptcha
          .execute(Config.captchaLogin, { action: "LOGIN" })
          .then(token => resolve(token))
          .catch(error => reject(error))
      })
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDeshabilitarBoton(true)
    document.body.style.cursor = 'progress';
    let captchaToken = "";
    if (captchaFlag) {
      captchaToken = await getCaptchaToken().catch(error => { } /* console.log(error) */);
      setError({ status: 'ok', mensaje: '' })
    }
    try {
      let body = {
        captchaToken: captchaToken,
        usuario: usuario.usuario,
        password: usuario.password
      }
      //console.log(body)
      const login = await axios.post(Config.endpoint + '/api/v1/auth/login', body).catch((e) => { throw e });
      if (login.data.perfiles.length === 0) throw { response: { data: { mensaje: `El usuario ${login.data.cuit} no posee un perfil para ingresar a la plataforma.` } } }
      let bodyVistas = {
        idPerfil: login.data.perfiles[0]?.idPerfil,
        ...body
      }
      const vistas = await axios.post(Config.endpoint + '/api/v1/usuarios/usuario/vistas', bodyVistas, captchaToken)
        .catch((e) => {
          throw e
        });
      //console.log(login)
      document.body.style.cursor = 'default';
      if (login.data.status === 'ok') {
        //console.log('NAVENGANDO')
        localStorage.clear();
        localStorage.setItem("vistas", JSON.stringify(vistas.data))
        localStorage.setItem("user_cuit", login.data.cuit);
        localStorage.setItem("idUsuarioBO", login.data.idUsuarioBO);
        localStorage.setItem("user", login.data.nombre);
        localStorage.setItem("token", login.data.tokenSession);
        localStorage.setItem("perfiles", JSON.stringify(login.data.perfiles));
        const badges = document.getElementsByClassName('grecaptcha-badge')
        for (const badge of badges) { badge.style.visibility = 'hidden' }
        navigate("/", { replace: true });
      }
      else {
        let unerror = {}
        unerror.status = login.data.status
        unerror.mensaje = login.data.mensaje

        setError(unerror)

        localStorage.clear();
        setDeshabilitarBoton(false)
        //navigate("/login", { replace: true }); 
      }
    }
    catch (error) {
      let unerror = {}
      unerror.status = 'Error de Conexión'
      unerror.mensaje = error?.response?.data?.mensaje ? error.response.data.mensaje : 'No es posible la conexión al servicio.'
      setError(unerror)
      localStorage.clear();
      setDeshabilitarBoton(false)
      document.body.style.cursor = 'default';

    }
  }

  useEffect(() => {
    if (!chequeoCaptcha()) { return }
    // El reCaptcha v3 crea el token cuando se carga el script.
    // Verifico que no haya un script de captcha ya cargado:
    let scripts = document.getElementsByTagName('script');
    scripts = [...scripts].filter(script => script.src === `https://www.google.com/recaptcha/api.js?render=${Config.captchaLogin}`)

    if (scripts.length === 0) {
      // Creo el script:
      const script = document.createElement('script');
      script.src = "https://www.google.com/recaptcha/api.js?render=" + Config.captchaLogin;
      script.id = "g-recaptcha"

      // Agrego el script del reCaptcha al body:
      document.body.appendChild(script)
    }
    else {
      const badges = document.getElementsByClassName('grecaptcha-badge')
      for (const badge of badges) { badge.style.visibility = 'visible' }
    }

  }, [])

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form onSubmit={handleSubmit}>
            <h3>Ingreso a PIN</h3>
            <hr className="clearfix" style={{ margin: "0 0 1.5rem", borderTop: "2px solid #e6ebf0" }} />
            <div className="form-group">
              <label>CUIT/CUIL</label>
              <input type="text" pattern="[0-9]*" className={`form-control ${error.status !== 'ok' ? "is-invalid" : ""}`} placeholder="Ingrese un CUIT/CUIL" onChange={handleInputChange} name="usuario" value={usuario.usuario} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" className={`form-control ${error.status !== 'ok' ? "is-invalid" : ""}`} placeholder="" onChange={handleInputChange} name="password" value={usuario.password} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={deshabilitarBoton}>Ingresar</button>
            <p className="forgot-password text-right">
              <a href="https://identidad.buenosaires.gob.ar/" target="_blank">Olvidó su contraseña?</a>
            </p>
          </form>
          {
            error.status !== 'ok' && (<div class="alert alert-danger mt-2" role="alert" style={{ fontSize: 13 }}>
              <p>{error.mensaje}</p>
            </div>)
          }
        </div>
      </div>
    </>
  );
};

export default Login;