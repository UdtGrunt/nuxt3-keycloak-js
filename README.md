# nuxt3-keycloak-js
Implémentation de keycloak-js dans une application Nuxt 3 avec Pinia.

# Prérequis
Un environnement avec Keycloak de déployé avec un realm et un client.
Voir la documentation suivante pour la configuration de Keycloak : `https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter`
Pinia configuré.
Voir la documentation suivante pour la configuration de Pinia :
`https://pinia.vuejs.org/ssr/nuxt.html`

# Etape 1 : Installer keycloak-js et jwt-decode
```bash
npm install keycloak-js
```
```bash
npm install jwt-decode
```

# Etape 2 : Mise en place des variables d'environnements
Mettre les variables suivantes dans le fichier `.env`
```
NUXT_PUBLIC_KEYCLOAK_URL = <<KeycloakURL>>
NUXT_PUBLIC_KEYCLOAK_REALM = <<RealmName>>
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID = <<RealmClient>>
NUXT_PUBLIC_KEYCLOAK_REDIRECT_URL = <<ApplicationURL>>
```

Modifier le fichier `nuxt.config.ts` pour ajouter les variables d'environnments.
```ts
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
```

# Etape 3 : Création du store
Créer une interface `JwtDecoded.ts` dans le dossier `interfaces` de l'application.
```ts
interface JwtDecoded {
  email: string
  email_verified: boolean
  auth_time: number
  exp: number
  iat: number
  jti: string
  realm_access: RealmAccess
  scope: string
  session_state: string
  sid: string
  sub: string
  typ: string
}

interface RealmAccess {
  roles: string[]
}
```
Créer un fichier `auth.ts` dans le dossier `stores` de l'application.
```ts
import { defineStore } from "pinia"
import type Keycloak from "keycloak-js"
import { type KeycloakLogoutOptions } from "keycloak-js"
import { jwtDecode } from "jwt-decode"

interface AuthState {
  authProvider: Keycloak | undefined
  isAuthenticated: boolean | undefined
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      authProvider: undefined,
      isAuthenticated: false,
    } as AuthState
  },
  actions: {
    async login() {
      await this.authProvider?.login()
    },

    async logout() {
      const runtimeConfig = useRuntimeConfig()
      const options: KeycloakLogoutOptions = {
        redirectUri: runtimeConfig.public.keycloak.redirectUrl,
      }
      const accessToken = useCookie("ACCESS_TOKEN")
      accessToken.value = null
      await this.authProvider?.logout(options)
    },
    storeToken() {
      const decoded: JwtDecoded = jwtDecode(this.authProvider?.token!)

      const accessToken = useCookie("ACCESS_TOKEN", {
        secure: true,
        expires: new Date(decoded.exp * 1000),
        httpOnly: false,
      })
      accessToken.value = this.authProvider?.token
    },
  },
})
```

# Etape 4: Création du plugin
Créer un fichier `keycloak.client.ts`  dans le dossier `plugins` de l'application.
```ts
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
```

# Etape 5 : Création du middleware
Créer un fichier `auth.global.ts`  dans le dossier `middleware` de l'application.
```ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const { isAuthenticated } = authStore

  if (isAuthenticated === false) {
    await authStore.login()
  }
})
```

Le token est stocké dans les cookies du navigateur et peut maintenant être utilisé pour sécuriser notre application.
