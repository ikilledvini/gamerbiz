import type { ReactNode } from "react";

function renderInline(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function BlogArticleContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  function flushList(key: number) {
    if (!list.length) return;
    blocks.push(
      <ul
        key={`list-${key}`}
        className="my-7 list-disc space-y-3 pl-6 text-lg leading-8 text-muted-foreground marker:text-primary"
      >
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      list.push(trimmed.slice(2));
      return;
    }
    flushList(index);
    if (!trimmed) return;
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3
          key={index}
          className="mb-4 mt-10 font-display text-2xl font-bold tracking-[-0.03em] text-foreground"
        >
          {trimmed.slice(4)}
        </h3>,
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2
          key={index}
          className="mb-5 mt-14 font-display text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl"
        >
          {trimmed.slice(3)}
        </h2>,
      );
      return;
    }
    blocks.push(
      <p key={index} className="my-6 text-lg leading-8 text-muted-foreground">
        {renderInline(trimmed)}
      </p>,
    );
  });
  flushList(lines.length);

  return <div>{blocks}</div>;
}
