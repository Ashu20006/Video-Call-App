// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react' // or your framework plugin
// import basicSsl from '@vitejs/plugin-basic-ssl'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(), 
//     basicSsl() // Add this line
//   ],
//   server: {
//     host: true, // This allows the 192.168... access
//     https: true // This enables secure mode
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //for Ngrok server
    server: {
    allowedHosts: [
      "thornlike-gary-endothelioid.ngrok-free.dev"
    ]
  }

})
