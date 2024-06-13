import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VVistaPreviaBoletin from '../../Pages/BO/VistaPreviaBoletin';

const VistaPreviaBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VVistaPreviaBoletin />
        </Layout>

    );
};

export default VistaPreviaBoletin;