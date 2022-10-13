const UserModal = require('../modals/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModal = require('../modals/user')
const { read } = require('fs')
const transporter=require('../config/emailconfig')
class UserController {

    static UserRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body
        const user = await UserModal.findOne({ email: email })
        if (user) {
            res.send({ "status": "Failed", "message": "Email already Exist" })
        } else {
            if (name && email && password && password && password_confirmation && tc) {

                if (password == password_confirmation) {
                    try {
                        const hashPassword = await bcrypt.hash(password, 10);
                        const doc = new UserModal({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        })
                        await doc.save()
                        const saved_user = UserModal.findOne({ email: email })
                        const token = jwt.sign({ userid: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                        res.status(201).send({ "status": "success", "message": "Registered Successfully", "token": token })
                    } catch (error) {
                        res.send({ "status": "failed", "message": "unable to Register" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "password dosn't match" })
                }
            } else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        }
    }

    static UserLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                const user = await UserModal.findOne({ email: email })
                if (user != null) {
                    const passwordmatch = await bcrypt.compare(password, user.password);
                    if (email == user.email && passwordmatch) {
                        const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                        res.send({ "status": "success", "message": "Login Success", "token": token })
                    } else {
                        res.send({ "status": "failed", "message": "email or password not correct" })
                    }
                } else {
                    res.send({ "status": "failed", "message": "you are not a registered User" })
                }
            } else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        } catch (error) {     
            res.send({ "status": "failed", "message": "unexpected error" })
        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {

            if (password !== password_confirmation) {
                res.send({ "status": "failed", "message": "Password dos'nt match" })
            } else {
                const newHashPassword = await bcrypt.hash(password, 10);
                await userModal.findByIdAndUpdate(req.user._id, {
                    $set: {
                        password: newHashPassword
                    }
                })
                res.send({ "status": "success", "message": "Password Changed Succesfully" })
            }
        } else {
            res.send({ "status": "failed", "message": "All fields are required" })
        }
    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await userModal.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userid: user._id }, secret, { expiresIn: "10m" })

                const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`
                

                const info= transporter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to:user.email,
                    subject:"hy ali password reset link",
                    html:`<a href=${link}>Click here to reset your password
                    </a>`
                })
                res.send({ "status": "success", "message": "Email sent successfully","info":info })

            } else {
                res.send({ "status": "failed", "message": "Email not found" })
            }
        } else {
            res.send({ "status": "failed", "message": "Email field is required" })
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await userModal.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.send({ "status": "success", "message": "password dosent match" })
                } else {
                    const newHashPassword = await bcrypt.hash(password, 10)
                    await userModal.findByIdAndUpdate(user._id, {
                        $set: {
                            password: newHashPassword
                        }
                    })
                    res.send({ "status": "failed", "message": "Password reset successfully" })
                }
            } else {
                res.send({ "status": "failed", "message": "all Fields required" })
            }

        } catch (error) {
            res.send({ "status": "failed", "message": "invalid token" })
        }


    }


}

module.exports = UserController