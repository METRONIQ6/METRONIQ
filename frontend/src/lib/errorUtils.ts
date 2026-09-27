export type ManufacturerErrorKey =
    | 'notFound'
    | 'unauthorized'
    | 'forbidden'
    | 'badRequest'
    | 'validationError'
    | 'serverError'
    | 'networkError'
    | 'generic'
    | 'uploadFailed'
    | 'ocrFailed'
    | 'resultUnavailable'
    | 'invalidImage'

export const mapManufacturerError = (status?: number, message?: string | null): ManufacturerErrorKey => {
    if (status === 404) return 'notFound'
    if (status === 401) return 'unauthorized'
    if (status === 403) return 'forbidden'
    if (status === 400) return 'badRequest'
    if (status === 422) return 'validationError'
    if (status === 500) return 'serverError'
    if (!status && (message === 'Failed to fetch' || message === 'Network Error' || message?.toLowerCase().includes('network'))) return 'networkError'

    // Some specific textual AI Scanner/API overrides
    if (message === 'Upload failed' || message === 'UPLOAD_FAILED') return 'uploadFailed'
    if (message === 'Processing failed' || message === 'OCR_FAILED') return 'ocrFailed'
    if (message === 'Scan not completed yet' || message === 'RESULT_UNAVAILABLE') return 'resultUnavailable'
    if (message === 'INVALID_IMAGE' || message === 'Invalid image') return 'invalidImage'

    return 'generic'
}
