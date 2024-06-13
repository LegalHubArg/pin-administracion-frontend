import React, { Component } from 'react';
import logoCiudadBA from '../../../Assets/footer/ciudad-ba.svg';
import logoVamosBA from '../../../Assets/footer/vamos-ba.svg';
class Footer extends Component {
  render() {
    return (
      <>
        <footer className="main-footer" style={{ flex: 1 }}>
          <div className="container">
            <section className="footer-legal-section">
              <div className="row justify-content-between">
                <div className="col-12 col-md-6 col-lg-5 col-xl-4 mb-4 mb-md-0">
                  <img className="mr-3 d-lg-none" src={logoCiudadBA} alt="Logo de la Ciudad de Buenos Aires" /><img
                    className="mr-3 d-none d-lg-inline" src={logoCiudadBA} alt="Logo de la Ciudad de Buenos Aires" /><img
                    src={logoVamosBA} alt="Logo de Vamos Buenos Aires" />
                </div>
                <div className="col-12 col-md-6 col-lg-7 col-xl-8">
                  <ul className="list-inline">
                    <li className="list-inline-item">
                      <a href="https://boletinoficial.buenosaires.gob.ar">Boletín oficial</a>
                    </li>
                    <li className="list-inline-item">
                      <a href="https://www.buenosaires.gob.ar/innovacion/ciudadinteligente/terminos-y-condiciones">Términos y
                        condiciones</a>
                    </li>
                    <li className="list-inline-item">
                      <a href="https://www.buenosaires.gob.ar/privacidad">Política de privacidad</a>
                    </li>
                    <li className="list-inline-item">
                      <a href="https://www.buenosaires.gob.ar/oficiosjudiciales">Oficios judiciales</a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <div className="footer-license-text">
                Los contenidos de buenosaires.gob.ar están licenciados bajo
                <br className="d-none d-sm-inline" />
                Creative Commons Reconocimiento 2.5 Argentina License.
              </div>
            </section>
          </div>
        </footer>
      </>
    );
  }
}

export default Footer;