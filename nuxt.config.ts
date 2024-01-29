export default defineNuxtConfig({
  devtools: { enabled: true },
  modules:["@pinia/nuxt"],
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
    public: {
      keycloak : {
        url : process.env.NUXT_PUBLIC_KEYCLOAK_URL,
        realm : process.env.NUXT_PUBLIC_KEYCLOAK_REALM,
        clientId : process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
        redirectUrl : process.env.NUXT_PUBLIC_KEYCLOAK_REDIRECT_URL
      },
      
    }
  }
})
