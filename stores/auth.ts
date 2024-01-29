import { defineStore } from "pinia"
import type Keycloak from "keycloak-js"
import { type KeycloakLoginOptions, type KeycloakLogoutOptions } from "keycloak-js"
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