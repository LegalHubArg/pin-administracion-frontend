import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaLogin from '../../Pages/Auth/login';

const Login = props => {
    return (
        <Layout className="app-login" isHeader={true} isFooter={true}>
            <VistaLogin />
        </Layout>

    );
};

export default Login;