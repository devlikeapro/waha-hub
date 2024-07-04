
export class WahaGlobalVersionAPI {
    private versionFile = "https://raw.githubusercontent.com/devlikeapro/waha/core/src/version.ts"

    /**
     * Fetch version file, find "version: '2024.4.3'" and return it
     */
    async getLatestVersion(): Promise<string> {
        const response = await fetch(this.versionFile, {cache: "no-store"})
        const text = await response.text()
        const version = text.match(/version: '(\d+\.\d+\.\d+)'/)
        if (!version) {
            return undefined
        }
        return version[1]
    }
}
