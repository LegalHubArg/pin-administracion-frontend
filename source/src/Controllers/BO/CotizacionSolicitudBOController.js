import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaCotizacionSolicitudBO from '../../Pages/BO/CotizacionSolicitudBO';

const CotizacionSolicitudBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaCotizacionSolicitudBO />
        </Layout>

    );
};

export default CotizacionSolicitudBO;