const cors = require('cors');

const whitelist=['https://localhost:3443','http://localhost:3000'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};
exports.cors = cors();//when we use cors in an end-point it means we accepts requests from all origins
exports.corsWithOptions = cors(corsOptionsDelegate);//whereas if we use corsWithOptions in an endpoint we explicitly configured to accepts requests from origins mentioned in 'whitelist' array