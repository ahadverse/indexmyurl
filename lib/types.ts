export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  credits: number
  availableCredits?: number
  apiKey?: string
  authProvider?: string
}

export interface GoogleAccount {
  id: string
  googleEmail: string
  googleAccountId: string
  gscProperties: string[]
  isActive: boolean
  propertiesCount: number
}

/** One row of the "All URLs" list: a URL and what has been tried with it. */
export interface UrlRow {
  url: string
  domain: string
  /** status of the most recent submission */
  status: string
  jobId: string
  /** how many times the URL was submitted */
  submissions: number
  /** successful requests to Google, including re-sends */
  googleSubmissions: number
  /** Indexing API calls that failed */
  failedCalls: number
  /** Search Console status checks made */
  checks: number
  firstSubmittedAt: string
  lastSubmittedAt: string
  lastCheckedAt: string | null
  indexedAt: string | null
}

export interface Job {
  _id: string
  originalUrl: string
  domain: string
  status: string
  retryCount: number
  credentialSource: string
  createdAt: string
  indexedAt?: string | null
}
