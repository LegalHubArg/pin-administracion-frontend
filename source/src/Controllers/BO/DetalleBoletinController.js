import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaDetalleBoletin from '../../Pages/BO/DetalleBoletin';

const DetalleBoletinController = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaDetalleBoletin />
        </Layout>

    );
};

export default DetalleBoletinController;