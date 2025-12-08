import dotenv from 'dotenv'
import express from 'express'
import payload from 'payload'
import config from './payload.config'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const start = async (): Promise<void> => {
  // Initialize Payload with Express app
  await payload.init({
    config,
    onInit: async (cms) => {
      cms.logger.info(`Payload initialized`)
      cms.logger.info(`Admin URL: ${cms.getAdminURL()}`)
      
      // Create admin user if it doesn't exist
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
        const existingUsers = await cms.find({
          collection: 'users',
          where: { email: { equals: adminEmail } },
          limit: 1,
        })

        if (existingUsers.docs.length === 0) {
          await cms.create({
            collection: 'users',
            data: {
              email: adminEmail,
              password: process.env.ADMIN_PASSWORD || 'changeme',
              name: 'Admin User',
            },
          })
          cms.logger.info(`Admin user created: ${adminEmail}`)
        }
      } catch (error) {
        const err = error as Error
        cms.logger.error(`Error creating admin user: ${err.message}`)
      }
    },
  })

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`Admin panel: http://localhost:${PORT}/admin`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
