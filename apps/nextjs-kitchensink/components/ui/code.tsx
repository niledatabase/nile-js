import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';

import { snippets } from '@/components/snippets';
import 'highlight.js/styles/gradient-dark.css';

type SnippetID = keyof typeof snippets;

hljs.registerLanguage('typescript', ts);
const { error } = console;

export default async function Code({
  file,
  code,
  noTitle,
  id,
}: {
  file: string;
  code?: string;
  noTitle?: boolean;
  id?: SnippetID;
}) {
  let text = code ?? '';
  let header = file ?? '';
  if (id) {
    text = snippets[id].code;
    header = snippets[id].file;
  } else if (process.env.NODE_ENV === 'production') {
    const id: SnippetID = camel(file) as SnippetID;

    if (snippets[id]) {
      if (!text) {
        text = snippets[id].code;
      }
      if (!header) {
        header = snippets[id].file;
      }
    } else {
      error('missing template', id, Object.keys(snippets), snippets[id]);
    }
  } else {
    const filePath = path.resolve(process.cwd(), file);
    text = await readFile(filePath, 'utf-8');
  }

  const highlightedCode = hljs.highlight(text, {
    language: 'typescript',
  }).value;
  return (
    <div>
      {noTitle ? null : <pre className="text-xs">{header}</pre>}
      <pre className="text-sm rounded-xl border p-2">
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
}

// keep in sync with generate-snippets, its just regular js
function camel(input: string) {
  return input
    .replace(/\.(ts|tsx)$/, '') // remove .ts extension
    .replace(/\[\.{3}(.*?)\]/g, 'Ellipsis$1') // turn `[...name]` into `EllipsisName`
    .replace(/[^a-zA-Z0-9]/g, '-') // normalize other symbols to dash
    .replace(/[-_]+(.)/g, (_, chr) => chr.toUpperCase()) // camelCase from dash
    .replace(/^[^a-zA-Z]+/, '') // remove invalid starting chars
    .replace(/^[A-Z]/, (m) => m.toLowerCase()); // lowercase first char
}
