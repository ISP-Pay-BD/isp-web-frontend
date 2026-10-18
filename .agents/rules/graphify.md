---
trigger: always_on
description: STRICT MANDATE - Always consult graphify-out/ before answering codebase/architecture questions and automatically run graphify update . after code changes.
---

## graphify (STRICT MANDATE)

This project has a graphify knowledge graph at `graphify-out/` indexing all symbols, dependencies, and architecture.

### Mandatory Rules:
1. **MANDATORY CONSULTATION BEFORE EXPLORATION & CODING**:
   - ALWAYS read `graphify-out/GRAPH_REPORT.md` before reading source files, running grep/glob searches, answering codebase/architecture questions, or designing features. The graph is your primary map of the codebase.
   - If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
   - For cross-module "how does X relate to Y" questions, ALWAYS prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files.
   - If the graphify MCP server is active, utilize tools like `query_graph`, `get_node`, and `shortest_path` for precise architecture navigation instead of falling back to `grep`.

2. **MANDATORY AUTO-UPDATE AFTER ANY CODE CHANGES**:
   - Immediately after modifying, creating, or refactoring code files in any session, you MUST AUTOMATICALLY run:
     ```bash
     graphify update .
     ```
     to update the AST knowledge graph and keep `graphify-out/` synchronized. Do NOT wait for the user to ask.
