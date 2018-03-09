import { Analyzer, generateAnalysis } from "polymer-analyzer"
import { writeFileSync } from "fs"

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message || error)
    process.exit(1)
  })
}

export async function main() {
  const path = process.argv[2] || "test/"
  const analyzer = Analyzer.createForDirectory(path)
  const input = await analyzer.analyzePackage()
  const result = generateAnalysis(input, analyzer.urlResolver)

  // console.log(process.cwd())
  // console.log(JSON.stringify(result, null, 2))

  const lines: string[] = []

  if (result.elements) {
    result.elements.forEach(it => {
      lines.push(`## ${it.name}`)
      lines.push("")
      lines.push(`*(element defined in ${it.path})*`)
      lines.push("")
      lines.push(it.description)
      lines.push("")
    })
  }

  if (result.mixins) {
    result.mixins.forEach(it => {
      lines.push(`## ${it.name}`)
      lines.push("")
      lines.push(`*(mixin defined in ${it.path})*`)
      lines.push("")
      lines.push(it.description)
      lines.push("")
    })
  }

  console.log(lines.join("\n"))
  writeFileSync("test/output.md", lines.join("\n"))
}
