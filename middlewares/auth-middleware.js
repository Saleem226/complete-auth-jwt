const jwt = require('jsonwebtoken')

const UserModal = require('../modals/user')

const checkUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1]
            const { userid } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = await UserModal.findById(userid).select("-password")
            next()
        } catch (error) {
            res.send({ "status": "failed", "message": "Unauthorized User" })
        }
    } else {
        res.send({ "status": "failed", "message": "Unauthorized User no token" })
    }
}
module.exports = checkUserAuth