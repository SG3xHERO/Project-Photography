import express from 'express'
import payload from 'payload'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
    express: app,
    onInit: async (payload) => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
      
      // Create default admin user if none exists
      try {
        const users = await payload.find({
          collection: 'users',
          limit: 1,
        })

        if (users.docs.length === 0) {
          await payload.create({
            collection: 'users',
            data: {
              email: process.env.ADMIN_EMAIL || 'admin@example.com',
              password: process.env.ADMIN_PASSWORD || 'changeme123',
              name: 'Admin User',
              role: 'admin',
            },
          })
          payload.logger.info('Default admin user created')
        }
      } catch (error) {
        payload.logger.error('Error creating admin user:', error)
      }
    },
  })

  app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Admin panel: http://localhost:${PORT}/admin`)
    console.log(`API: http://localhost:${PORT}/api`)
  })
}

start()
