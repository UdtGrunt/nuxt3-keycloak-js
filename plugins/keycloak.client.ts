import Keycloak from "keycloak-js"
import { useAuthStore } from "~/stores/auth"

export default defineNuxtPlugin(async () => {
  const app = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const useAuth = useAuthStore(app.$pinia)
  const { authProvider } = useAuth

  if (authProvider === undefined) {
    const keycloak = new Keycloak({
      url: runtimeConfig.public.keycloak.url,
      realm: runtimeConfig.public.keycloak.realm,
      clientId: runtimeConfig.public.keycloak.clientId,
    })
    
    keycloak.onAuthSuccess = () => useAuth.storeToken()
    
    useAuth.authProvider = keycloak

    useAuth.isAuthenticated = await keycloak.init({
      pkceMethod: "S256",
      redirectUri: runtimeConfig.public.keycloak.redirectUrl,
    })
  }
})