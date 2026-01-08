# Update README and Documentation

## Description

更新readme和说明文档，当涉及到功能实现和技术细节时候去源代码中查证

(Update README and documentation files, always verify functional implementations and technical details by referencing the source code.)

## When to Use

Invoke this skill when:
- Creating or updating README files
- Writing technical documentation
- Documenting new features or functionality
- Adding setup instructions
- Explaining implementation details

## Key Files to Reference

When updating documentation for MathFlow, always verify against these source files:

- `src/lib/factorization.ts` - Factorization logic with SymPy integration
- `src/lib/equation.ts` - Equation parsing utilities
- `src/components/ScratchPad/ScratchPad.tsx` - Main scratchpad component
- `src/components/ScratchPad/operations/AlgebraOperations.tsx` - Operation buttons
- `backend/` - FastAPI + SymPy backend service
- `docker-compose.yml` - Container orchestration
- `.env.example` - Environment variable reference

## Best Practices

1. **Verify Implementation**: Before documenting any feature, read the relevant source code to ensure accuracy
2. **Check Configuration**: Verify environment variables, ports, and configuration files
3. **Test Examples**: Ensure code examples and commands actually work
4. **Update Versions**: Keep library versions and dependencies current in documentation
5. **Link Sources**: Reference specific files and line numbers when explaining technical details

## Examples

### Documenting a New Feature

```markdown
## New Feature Name

Description of what the feature does.

**Implementation**: See `src/path/to/implementation.ts:123`

**Usage**:
```bash
# Verified command that works
command example here
```
```

### Updating Setup Instructions

Always test commands before adding them to documentation:

```bash
# Verify this actually works
podman-compose up -d backend
```

Then document the verified steps.
