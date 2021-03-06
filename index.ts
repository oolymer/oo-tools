import fs from "fs"
import chalk from "chalk"
import meow from "meow"
import { Analyzer, generateAnalysis } from "polymer-analyzer"
import { FsUrlLoader, PackageUrlResolver } from "polymer-analyzer"

if (require.main === module) {
  main()
}

export function main() {
  cli().catch(error => {
    console.error(error.stack || error.message || error)
    process.exit(1)
  })
}

export async function cli() {
  const help = `
    Usage
      $ oo [directory]

    Examples
      $ oo .
  `

  const cli = meow(help, {})

  if (cli.input.length === 0) {
    cli.showHelp(0)
  }
  else {
    console.log(chalk.green("*** " + (cli.pkg as any).description + " ***"))
    console.log("")

    const path = cli.input[0]
    const result = await analyze(path)
    console.log(result)
    fs.writeFileSync("analysis.md", result)
  }
}

export async function analyze(path: string): Promise<string> {
  const analyzer = createForDirectory(path)
  const input = await analyzer.analyzePackage()
  const result = generateAnalysis(input, analyzer.urlResolver)

  // console.log(process.cwd())
  // console.log(JSON.stringify(result, null, 2))

  const lines: string[] = []

  if (result.elements) {
    result.elements.forEach(it => {
      lines.push(`## ${it.name}`)
      lines.push("")
      lines.push(`> element defined in ${it.path})`)
      lines.push("")
      if (it.description) {
        lines.push(it.description)
        lines.push("")
      }
    })
  }

  if (result.mixins) {
    result.mixins.forEach(it => {
      lines.push(`## ${it.name}`)
      lines.push("")
      lines.push(`> mixin defined in ${it.path})`)
      lines.push("")
      if (it.description) {
        lines.push(it.description)
        lines.push("")
      }
    })
  }

  return lines.join("\n")
}

export function createForDirectory(dirname: string): Analyzer {
  return new Analyzer({
    urlLoader: new FsUrlLoader(dirname),
    urlResolver: new PackageUrlResolver({ packageDir: dirname })
  })
}
