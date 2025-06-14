const nodemailer = require('nodemailer');

module.exports = async function sendGmail(data = {}, callback = () => {}) {
    const { 
        username, password , 
        sender  , recipient, subject, 
        text    , html
    } = data;

    if (!username || !password || !recipient || !subject) {
        return callback(null, new Error(`Missing required email configuration fields.`));
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: username, pass: password },
    });

    try {
        let info = await transporter.sendMail({
            from    : sender || username,
            to      : recipient,
            subject : subject,
            text    : text ?? '',
            html    : html ?? ''
        });
        callback(info, null);
    } 
    catch (error) {
        callback(null, error);
    }
}