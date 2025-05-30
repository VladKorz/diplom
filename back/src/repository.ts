import { Sequelize  } from 'sequelize'

const instance = new Sequelize({
    dialect: "sqlite",
    storage: "./repository.db"
})

export default instance
