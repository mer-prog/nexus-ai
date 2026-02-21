// Simple markdown-to-HTML renderer (no external dependencies)

export function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre class="rounded-md bg-muted p-3 overflow-x-auto my-2"><code class="text-sm" data-lang="${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-sm">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-3 border-border" />');

  // Tables
  html = renderTables(html);

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-1 space-y-0.5">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  // Wrap consecutive <li> items that are list-decimal
  html = html.replace(
    /(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g,
    (match) => `<ol class="my-1 space-y-0.5">${match}</ol>`
  );

  // Line breaks (double newline = paragraph, single = br)
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br />");

  // Wrap in paragraph
  html = `<p>${html}</p>`;
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-3])/g, "$1");
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ol)/g, "$1");
  html = html.replace(/(<\/ol>)<\/p>/g, "$1");
  html = html.replace(/<p>(<hr)/g, "$1");
  html = html.replace(/(\/> )<\/p>/g, "$1");
  html = html.replace(/<p>(<table)/g, "$1");
  html = html.replace(/(<\/table>)<\/p>/g, "$1");

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTables(html: string): string {
  const lines = html.split("\n");
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (const line of lines) {
    if (line.includes("|") && line.trim().startsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator rows
      if (/^\|[\s-|]+\|$/.test(line.trim())) continue;
      tableRows.push(line);
    } else {
      if (inTable) {
        result.push(buildTable(tableRows));
        inTable = false;
        tableRows = [];
      }
      result.push(line);
    }
  }

  if (inTable) {
    result.push(buildTable(tableRows));
  }

  return result.join("\n");
}

function buildTable(rows: string[]): string {
  if (rows.length === 0) return "";

  let html = '<table class="my-2 w-full text-sm border-collapse">';

  rows.forEach((row, i) => {
    const cells = row
      .split("|")
      .filter((c) => c.trim() !== "")
      .map((c) => c.trim());

    if (i === 0) {
      html += "<thead><tr>";
      cells.forEach((cell) => {
        html += `<th class="border border-border px-2 py-1 text-left font-medium bg-muted">${cell}</th>`;
      });
      html += "</tr></thead><tbody>";
    } else {
      html += "<tr>";
      cells.forEach((cell) => {
        html += `<td class="border border-border px-2 py-1">${cell}</td>`;
      });
      html += "</tr>";
    }
  });

  html += "</tbody></table>";
  return html;
}
