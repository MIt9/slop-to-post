export const HELP = `slop-to-post — detect and eliminate AI slop, fluff, and sycophancy from posts and text

Usage:
  slop-to-post <text_or_file_path> [options]       De-slop & modify text into clean post
  slop-to-post detect <text_or_file_path> [options] Scan text & report AI slop patterns
  slop-to-post <command> [options]

Commands:
  detect                  Detect and score AI slop patterns in text/file without modifying
  setup                   Interactive wizard to configure AI CLI provider
  init                    Scaffold slop-to-post.config.json + prompts/deslop.txt
  update                  Check and download the latest release from GitHub

Options:
  --max-words, -w <n>     Maximum word count limit for output clean text
  --out, -o <path>        Save output clean text or report to specified file
  --json                  Output result as formatted JSON
  --config <path>         Path to config file (default: ./slop-to-post.config.json)
  --version, -v           Show version
  --help, -h              Show this help

Environment:
  SLOP2POST_CONFIG       Override config file path
  SLOP2POST_AI_DEFAULT   Override ai.default provider key
`;
