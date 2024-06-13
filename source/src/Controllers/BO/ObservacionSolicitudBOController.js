import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaObservacionSolicitudBO from '../../Pages/BO/ObservacionSolicitudBO';

const ObservacionSolicitudBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaObservacionSolicitudBO />
        </Layout>

    );
};

export default ObservacionSolicitudBO;