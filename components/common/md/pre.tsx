import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Highlight
  , themes // themes.vsDark, nightOwl, github, , duotoneDark, synthwave84, dracula, shadesOfPurple
} from 'prism-react-renderer'

type CodeSnippet = {
  value: string
  language: string
}
export type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | ((lineNumber: number) => string);
interface AaViewOptions {
  lineNumbers?: LineNumbersType
  wrapLines?: boolean
}
interface CodeBlockProps extends CodeSnippet {
  options?: AaViewOptions
  showLineNumbers?: boolean
  wrapLines?: boolean
}
export const CodeBlock = ({ value, language, options }: CodeBlockProps) => {
  const { lineNumbers = 'off', wrapLines = false } = options || {}
  return (
  <Highlight  theme={themes.vsDark} code={value} language={language}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <ScrollArea className={` rounded-md  w-screen`}>
      <pre
        className={` ${className}  px-4 py-2  bg-gradient-opacity-40 border-none bg-[rgb(30,30,30)]`}
        style={style}
      >
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })} className="table-row">
            {lineNumbers==='on' && (
              <span className="table-cell text-right pr-4 select-none opacity-50">
                {i + 1}
              </span>
            )}
            <span className={`table-cell ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </span>
          </div>
        ))}
      </pre> 
      <ScrollBar orientation="horizontal" />
  </ScrollArea>
    )}
  </Highlight>
  )
}