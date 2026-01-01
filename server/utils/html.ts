import { parse } from 'node-html-parser'

export const parseHtml = (html: string) => parse(html)
