import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders bold text", () => {
    const html = renderMarkdown("Hello **world**");
    expect(html).toContain("<strong>world</strong>");
  });

  it("renders italic text", () => {
    const html = renderMarkdown("Hello *world*");
    expect(html).toContain("<em>world</em>");
  });

  it("renders h1 headers", () => {
    const html = renderMarkdown("# Title");
    expect(html).toContain("<h1");
    expect(html).toContain("Title");
  });

  it("renders h2 headers", () => {
    const html = renderMarkdown("## Subtitle");
    expect(html).toContain("<h2");
    expect(html).toContain("Subtitle");
  });

  it("renders h3 headers", () => {
    const html = renderMarkdown("### Section");
    expect(html).toContain("<h3");
    expect(html).toContain("Section");
  });

  it("renders inline code", () => {
    const html = renderMarkdown("Use `console.log`");
    expect(html).toContain("<code");
    expect(html).toContain("console.log");
  });

  it("renders code blocks", () => {
    const html = renderMarkdown("```js\nconst x = 1;\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 1;");
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- Item 1\n- Item 2");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("Item 1");
    expect(html).toContain("Item 2");
  });

  it("renders ordered lists", () => {
    const html = renderMarkdown("1. First\n2. Second");
    expect(html).toContain("<ol");
    expect(html).toContain("First");
    expect(html).toContain("Second");
  });

  it("renders horizontal rules", () => {
    const html = renderMarkdown("---");
    expect(html).toContain("<hr");
  });

  it("renders tables", () => {
    const md = "| Name | Value |\n|------|-------|\n| A | 1 |";
    const html = renderMarkdown(md);
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("Name");
    expect(html).toContain("<td");
  });

  it("escapes HTML entities", () => {
    const html = renderMarkdown("Hello <script>alert('xss')</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("handles empty input", () => {
    const html = renderMarkdown("");
    expect(html).toBeDefined();
  });
});
