import app from './server'
import db from './repository'
import dotenv from 'dotenv'

dotenv.config()

const port = Number(process.env.APP_PORT) || 3000

const start = async () => {
    try {
        // Init database //
        await db.authenticate()
        await db.sync()
        app.log.info(`Database synchronized successfully`)

        // Init server //
        await app.listen({port: port})
        app.log.info(`Server listening on http://localhost:` + port)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()