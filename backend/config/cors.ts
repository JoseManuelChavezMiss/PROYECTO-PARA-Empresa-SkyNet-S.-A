import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy.
 * Docs: https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: true, // permite todos los dominios (refleja el origen)
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: true,
  exposeHeaders: [], // ✅ debe ser array, no boolean
  credentials: true,
  maxAge: 90,
})

export default corsConfig


// import { defineConfig } from '@adonisjs/cors'

// /**
//  * Configuration options to tweak the CORS policy. The following
//  * options are documented on the official documentation website.
//  *
//  * https://docs.adonisjs.com/guides/security/cors
//  */
// const corsConfig = defineConfig({
//   enabled: true,
//   origin: true,
//   methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
//   headers: true,
//   exposeHeaders: [],
//   credentials: true,
//   maxAge: 90,
// })

// export default corsConfig
