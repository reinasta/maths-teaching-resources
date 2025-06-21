"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorksheetPageContent = generateWorksheetPageContent;
function generateWorksheetPageContent(entry) {
    const { title, description, worksheetPdf, answersPdf, additionalLinks, additionalResources, tags, slug } = entry;
    const currentDate = new Date().toISOString().split('T')[0];
    const additionalLinksSection = additionalLinks.length > 0
        ? `

## Additional Resources

${additionalLinks.map(link => `- [${link.title}](${link.url})`).join('\n')}`
        : '';
    const additionalResourcesSection = (additionalResources && additionalResources.length > 0)
        ? `${additionalLinks.length > 0 ? '\n' : '\n\n## Additional Resources\n\n'}${additionalResources.map(link => `- [${link.title}](${link.url})`).join('\n')}`
        : '';
    return `---
title: "${title}"
description: "${description}"
worksheetPdf: "${worksheetPdf}"
answersPdf: "${answersPdf}"
date: "${currentDate}"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
slug: "${slug}"
---

## Worksheet Overview

${description}

## Learning Objectives

This worksheet will help students develop skills in:

${tags.slice(0, 4).map(tag => `- ${tag.charAt(0).toUpperCase() + tag.slice(1)}`).join('\n')}

## Prerequisites

Students should have a basic understanding of fundamental mathematical concepts before attempting this worksheet.

## Instructions

1. Download the worksheet PDF below
2. Complete all problems showing your work
3. Check your answers using the answer key
4. Review any concepts you found challenging${additionalLinksSection}${additionalResourcesSection}

## Downloads

- [Download Worksheet PDF](${worksheetPdf})
- [Download Answer Key PDF](${answersPdf})
`;
}
