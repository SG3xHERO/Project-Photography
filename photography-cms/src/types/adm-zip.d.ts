declare module 'adm-zip' {
  class AdmZip {
    constructor(input?: string | Buffer)
    getEntries(): AdmZip.IZipEntry[]
    readFile(entry: string | AdmZip.IZipEntry): Buffer | null
  }

  namespace AdmZip {
    interface IZipEntry {
      name: string
      entryName: string
      isDirectory: boolean
      getData(): Buffer
    }
  }

  export = AdmZip
}
