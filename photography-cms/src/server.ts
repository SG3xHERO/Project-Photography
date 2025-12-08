import express from 'express'
import payload from 'payload'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.CMS_PORT || 3000

app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
    express: app,
    onInit: async (payload) => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
      
      // Create admin user if it doesn't exist
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
        const existingUsers = await payload.find({
          collection: 'users',
          where: { email: { equals: adminEmail } },
          limit: 1,
        })

        if (existingUsers.docs.length === 0) {
          await payload.create({
            collection: 'users',
            data: {
              email: adminEmail,
              password: process.env.ADMIN_PASSWORD || 'changeme',
              name: 'Admin User',
            },
          })
          payload.logger.info(`Admin user created: ${adminEmail}`)
        }
      } catch (error) {
        payload.logger.error('Error creating admin user:', error)
      }
    },
  })

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

start()
