import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Define MDX components interface
type MDXComponents = {
  [key: string]: React.ComponentType<Record<string, unknown>>;
  h1?: React.ComponentType<ComponentProps<"h1">>;
  h2?: React.ComponentType<ComponentProps<"h2">>;
  h3?: React.ComponentType<ComponentProps<"h3">>;
  h4?: React.ComponentType<ComponentProps<"h4">>;
  p?: React.ComponentType<ComponentProps<"p">>;
  ul?: React.ComponentType<ComponentProps<"ul">>;
  ol?: React.ComponentType<ComponentProps<"ol">>;
  li?: React.ComponentType<ComponentProps<"li">>;
  blockquote?: React.ComponentType<ComponentProps<"blockquote">>;
  img?: React.ComponentType<ComponentProps<"img">>;
  hr?: React.ComponentType<ComponentProps<"hr">>;
  table?: React.ComponentType<ComponentProps<"table">>;
  tr?: React.ComponentType<ComponentProps<"tr">>;
  th?: React.ComponentType<ComponentProps<"th">>;
  td?: React.ComponentType<ComponentProps<"td">>;
  pre?: React.ComponentType<ComponentProps<"pre">>;
  code?: React.ComponentType<ComponentProps<"code">>;
};

export function useMDXComponents(
  components: MDXComponents = {}
): MDXComponents {
  return {
    h1: ({ className, ...props }: ComponentProps<"h1">) => (
      <h1
        className={cn(
          "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }: ComponentProps<"h2">) => (
      <h2
        className={cn(
          "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mb-4",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }: ComponentProps<"h3">) => (
      <h3
        className={cn(
          "scroll-m-20 text-2xl font-semibold tracking-tight mb-3",
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }: ComponentProps<"h4">) => (
      <h4
        className={cn(
          "scroll-m-20 text-xl font-semibold tracking-tight mb-2",
          className
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }: ComponentProps<"p">) => (
      <p
        className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }: ComponentProps<"ul">) => (
      <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
    ),
    ol: ({ className, ...props }: ComponentProps<"ol">) => (
      <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
    ),
    li: ({ className, ...props }: ComponentProps<"li">) => (
      <li className={cn("mt-2", className)} {...props} />
    ),
    blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
      <blockquote
        className={cn(
          "mt-6 border-l-2 pl-6 italic [&>*]:text-muted-foreground",
          className
        )}
        {...props}
      />
    ),
    img: ({ className, alt, ...props }: ComponentProps<"img">) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={cn("rounded-md border", className)}
        alt={alt}
        {...props}
      />
    ),
    hr: ({ ...props }: ComponentProps<"hr">) => (
      <hr className="my-4 md:my-8" {...props} />
    ),
    table: ({ className, ...props }: ComponentProps<"table">) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className={cn("w-full", className)} {...props} />
      </div>
    ),
    tr: ({ className, ...props }: ComponentProps<"tr">) => (
      <tr
        className={cn("m-0 border-t p-0 even:bg-muted", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }: ComponentProps<"th">) => (
      <th
        className={cn(
          "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }: ComponentProps<"td">) => (
      <td
        className={cn(
          "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }: ComponentProps<"pre">) => (
      <pre
        className={cn(
          "mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted px-4 py-4",
          className
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }: ComponentProps<"code">) => (
      <code
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
          className
        )}
        {...props}
      />
    ),
    ...components,
  };
}
