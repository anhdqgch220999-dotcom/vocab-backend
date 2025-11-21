const UserController = require("../controllers/userController");
const { auth } = require("../middlware/auth");

const UserRoute = (app) => {
    // Admin only routes
    app.get('/admin/users', auth, UserController.getAllUsers);
    app.get('/admin/stats', auth, UserController.getUserStats);
    app.put('/admin/users/:id', auth, UserController.updateUser);
    app.delete('/admin/users/:id', auth, UserController.deleteUser);
}

module.exports = UserRoute;
