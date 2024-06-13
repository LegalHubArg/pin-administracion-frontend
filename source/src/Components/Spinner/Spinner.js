import { css } from "@emotion/react";
import ClipLoader from "react-spinners/SyncLoader";
import './Spinner.css'


const Spinner = ({ loading }) => {
  return (
    <div className="container fill">
      {/* <div className="row mb-5 justify-content-center mb-2 align-middle">
        <div className="col-12 col-lg-12">
            <ClipLoader color={"#fdd306"} loading={loading} size={20} />
        </div>
    </div> */}
      <div class="spinner-wrapper">
        <div class="spinner-border text-info" role="status">
          <span class="sr-only">Cargando...</span>
        </div>
      </div>
    </div>
  );
}

export default Spinner;