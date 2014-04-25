module.exports = {
    development: {
        db: {
            client: 'mysql',
            connection: {
                host: 'host',
                user: 'user',
                password: 'password',
                database: 'database',
                charset: 'utf8'
            }
        }
    },
    smtp: {
        user: 'email',
        password: 'password',
        host: 'smtp.gmail.com',
        ssl: true
    }

}