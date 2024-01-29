export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const { isAuthenticated } = authStore

  if (isAuthenticated === false) {
    await authStore.login()
  }
})