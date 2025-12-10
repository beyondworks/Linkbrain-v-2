/**
 * Web Content Extractor
 * 
 * Uses Mozilla Readability to extract main article content from HTML
 * This provides clean, readable text from web pages
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface WebExtractResult {
    rawText: string;
    rawHtml: string;
}

export function extractWeb(html: string, url: string): WebExtractResult {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return {
        rawText: article?.textContent || '',
        rawHtml: article?.content || '',
    };
}

export default extractWeb;
