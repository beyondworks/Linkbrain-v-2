/**
 * Simple test script for content processor
 * Run with: node --loader ts-node/esm api/lib/content-processor.test.ts
 * Or with tsx: npx tsx api/lib/content-processor.test.ts
 */

import {
    extractImages,
    cleanContentMarkdown,
    markdownToHtml,
    isProfilePicture,
    processMarkdownContent
} from './content-processor.js';

// Test data simulating Jina AI scraped Threads content
const sampleMarkdown = `
Title: Example Post on Threads
URL Source: https://www.threads.net/@example/post/123
Markdown Content:
===============

# Main Post Title

![Profile Picture](https://example.com/profile_s150x150.jpg)
![Main Image](https://example.com/images/main-photo.jpg)

This is the main content of the post. It contains some useful information.

Related threads mentioned here.

[Check this link](https://example.com/related)

Reply to this post!

161
42
View on Threads

![Another Image](https://example.com/photo2.jpg)

Some more content here.

===============
Log in to see more
`;

console.log('🧪 Testing Content Processor\n');

// Test 1: Extract Images
console.log('1️⃣ Testing extractImages()');
const images = extractImages(sampleMarkdown);
console.log('Extracted images:', images);
console.log('✅ Should have 2 images (excluding profile pic):', images.length === 2 ? 'PASS' : 'FAIL');
console.log('');

// Test 2: Profile Picture Detection
console.log('2️⃣ Testing isProfilePicture()');
const profilePicUrl = 'https://example.com/profile_s150x150.jpg';
const normalImageUrl = 'https://example.com/photo.jpg';
console.log('Profile pic detected:', isProfilePicture(profilePicUrl) ? 'PASS ✅' : 'FAIL ❌');
console.log('Normal image not flagged:', !isProfilePicture(normalImageUrl) ? 'PASS ✅' : 'FAIL ❌');
console.log('');

// Test 3: Clean Content Markdown
console.log('3️⃣ Testing cleanContentMarkdown()');
const cleaned = cleanContentMarkdown(sampleMarkdown);
console.log('Cleaned content:');
console.log('---');
console.log(cleaned);
console.log('---');
console.log('✅ Should NOT contain:');
console.log('  - "Title:" metadata:', !cleaned.includes('Title:') ? 'PASS' : 'FAIL');
console.log('  - "Related threads":', !cleaned.toLowerCase().includes('related threads') ? 'PASS' : 'FAIL');
console.log('  - "Reply" text:', !cleaned.includes('Reply') ? 'PASS' : 'FAIL');
console.log('  - "View on Threads":', !cleaned.includes('View on Threads') ? 'PASS' : 'FAIL');
console.log('  - Raw URLs:', !cleaned.includes('https://') ? 'PASS' : 'FAIL');
console.log('  - Numbers "161":', !cleaned.includes('161') ? 'PASS' : 'FAIL');
console.log('✅ SHOULD contain actual content:', cleaned.includes('main content') ? 'PASS' : 'FAIL');
console.log('');

// Test 4: Markdown to HTML
console.log('4️⃣ Testing markdownToHtml()');
const html = markdownToHtml('Line 1\nLine 2\nLine 3');
console.log('Generated HTML:', html);
console.log('Contains <br/> tags:', html.includes('<br/>') ? 'PASS ✅' : 'FAIL ❌');
console.log('Contains div wrapper:', html.includes('<div') ? 'PASS ✅' : 'FAIL ❌');
console.log('');

// Test 5: Full Processing Pipeline
console.log('5️⃣ Testing processMarkdownContent() - Full Pipeline');
const processed = processMarkdownContent(sampleMarkdown);
console.log('Processed output:');
console.log('  - rawMarkdown length:', processed.rawMarkdown.length, 'chars');
console.log('  - contentMarkdown length:', processed.contentMarkdown.length, 'chars');
console.log('  - contentHtml length:', processed.contentHtml.length, 'chars');
console.log('  - images count:', processed.images.length);
console.log('');
console.log('✅ All fields populated:',
    processed.rawMarkdown && processed.contentMarkdown && processed.contentHtml && processed.images.length > 0
        ? 'PASS' : 'FAIL'
);

console.log('\n✨ Content Processor Tests Complete!\n');
