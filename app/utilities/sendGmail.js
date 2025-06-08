const nodemailer = require('nodemailer');

module.exports = async function sendGmail(data = {}, callback = () => {}) {
    let { 
        username, password , 
        sender  , recipient, 
        subject , text,      html
    } = data;

    if (!username || !password || !recipient || !subject) {
        const msg = "Missing required email configuration fields.";
        console.error(`[${new Date().toISOString()}] ${msg}`);
        return callback(new Error(msg), null);
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: username,
            pass: password,
        },
    });

    let mailOptions = {
        from    : sender || username,
        to      : recipient,
        subject : subject,
        text    : text ?? '',
        html    : html ?? ''
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        callback(info, null);
    } 
    catch (error) {
        callback(null, error);
    }
}