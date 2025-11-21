const AuthController = require("../controllers/authController");
const { auth } = require("../middlware/auth");

const AuthRoute = (app) => {
    // Public routes
    app.post('/auth/register', AuthController.register);
    app.post('/auth/login', AuthController.login);
    
    // Protected routes
    app.get('/auth/profile', auth, AuthController.getProfile);
}

module.exports = AuthRoute;
