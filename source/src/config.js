const envConfig = window;

// API Link
export default { 
    endpoint: envConfig.REACT_APP_ENDPOINT, 
    captchaLogin: envConfig.REACT_APP_CLAVE_CAPTCHA,
    version: "1.0.11" 
}