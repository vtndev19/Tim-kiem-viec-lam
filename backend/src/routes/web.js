import express from 'express';

const router = express.Router();

/**
 * 
 * @param {*} app - Express app 
 */
const initWebRoutes = (app) => {
    router.get('/', (req, res) => {
        return res.send('Hello World!');
    });

    // Đưa return vào trong hàm
    return app.use('/', router);
};

export default initWebRoutes;
