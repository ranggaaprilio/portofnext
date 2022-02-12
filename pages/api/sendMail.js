export default function (req, res) {
    require('dotenv').config();
    let nodemailer = require('nodemailer')

    console.log("checkonThis",process.env.EMAIL,process.env.PASSWORD,process.env.EMAIL_RECIEVE)

    const request=req.body
    const transporter = nodemailer.createTransport({
        port: process.env.EMAIL_PORT,
        host: process.env.EMAIL_HOST,
        auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
        },
    secure: true,
    });
    const mailData = {
        from: request.email,
        to: process.env.EMAIL_RECIEVE,
        subject: `Message From ${request.firstName} ${request.lastName} | PORTOFOLIO`,
        text: `from ${request.email} message: ${request.message}`,
       }
       transporter.sendMail(mailData, function (err, info) {
        if(err){
            console.log(err)
          res.status(500).json({success: false, message: 'Error sending email'})
        } 
        else{
            console.log(info)
          res.status(200).json({success: true, message: 'Email sent'})
        }
          
      })
      
  }