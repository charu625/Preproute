export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return 'Draft'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const API_HOST = 'admin-moderator-backend-staging.up.railway.app'

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const axiosError = error as {
      code?: string
      message?: string
      response?: { status?: number; data?: { message?: string } }
    }

    const status = axiosError.response?.status
    if (status === 502 || status === 503) {
      return `Cannot reach the API server (${API_HOST}). Restart the dev server (npm run dev), check your internet/VPN, and verify DNS with: nslookup ${API_HOST}`
    }

    if (
      axiosError.code === 'ERR_NETWORK' ||
      axiosError.code === 'ECONNABORTED' ||
      !axiosError.response
    ) {
      const msg = axiosError.message ?? ''
      if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
        return `DNS could not resolve ${API_HOST}. Try another network, disable VPN, or ask IT if *.railway.app is blocked.`
      }
      return `Network error — cannot reach the API. Ensure npm run dev is running and try: nslookup ${API_HOST}`
    }

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
    if (axiosError.message) return axiosError.message
  }
  if (error instanceof Error) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      return `DNS could not resolve ${API_HOST}. Check your connection and VPN settings.`
    }
    return error.message
  }
  return 'Something went wrong'
}
