import React from "react";
import { Link, useNavigate } from "react-router-dom";

const HomeBO = props => {
  const navigate = useNavigate(); 

  const onLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true })
}
    return (
        <>
          <article>
      <header className="pt-4 pb-3 mb-4">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
            </ol>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="row mb-5">
          <div className="col-12 col-lg-12">
            <header>
              <h1 className="mb-3">Ups!</h1>
            </header>
            <hr />
            <section>
              <br/>
              <br/>
              <br/>
              <div class="alert-wrapper">
                  <div class="alert alert-danger" role="alert">
                    <p>
                      { props.mensaje }. <a href="#" onClick={ onLogout }>Por favor ingrese nuevamente.</a>
                    </p>
                  </div>
                </div>

            </section>
          </div>
        </div>
      </div>
    </article>

        </>
    );
};

export default HomeBO;
