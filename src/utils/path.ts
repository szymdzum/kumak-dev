interface FormatUrlOptions {
  trailingSlash?: boolean;
  leadingSlash?: boolean;
}

const DEFAULT_FORMAT_OPTIONS: FormatUrlOptions = {
  trailingSlash: true,
  leadingSlash: true,
};

function stripSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

export function formatUrl(path: string, options: FormatUrlOptions = {}): string {
  const { trailingSlash, leadingSlash } = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const cleanPath = stripSlashes(path);

  if (!cleanPath) {
    return "/";
  }

  let url = cleanPath;
  if (leadingSlash) url = `/${url}`;
  if (trailingSlash) url = `${url}/`;

  return url;
}
