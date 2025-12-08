import express, { Request, Response } from 'express'
import { getPayload } from 'payload'
import dotenv from 'dotenv'
import config from './payload.config'

dotenv.config()

const PORT = process.env.PORT || 3000

const start = async (): Promise<void> => {
  const app = express()
  
  const payload = await getPayload({ config })
  
  app.get('/', (_req: Request, res: Response) => {
    res.redirect('/admin')
  })
  
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
    const err = error as Error
    payload.logger.error(`Error creating admin user: ${err.message}`)
  }

  app.listen(PORT, () => {
    payload.logger.info(`Server listening on port ${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
