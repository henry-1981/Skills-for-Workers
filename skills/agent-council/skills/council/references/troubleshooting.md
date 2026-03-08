# Troubleshooting

## missing_cli

**Symptom**: Member status shows `missing_cli` in results.

**Cause**: The CLI command for this member is not installed or not in PATH.

**Fix**:
1. Check if the CLI exists: `command -v <binary>`
2. Install the missing CLI (see `references/setup.md`)
3. Or remove the member from `council.config.yaml`

## YAML parsing error

**Symptom**: `Invalid YAML in council.config.yaml: ...`

**Cause**: Syntax error in config file.

**Fix**:
1. Validate your YAML: `node -e "require('yaml').parse(require('fs').readFileSync('council.config.yaml','utf8'))"`
2. Check for tab characters (use spaces only)
3. Ensure strings with special characters are quoted

## Timeout

**Symptom**: Member status shows `timed_out`.

**Cause**: CLI did not respond within the configured timeout.

**Fix**:
1. Increase timeout in `council.config.yaml`:
   ```yaml
   settings:
     timeout: 300  # default is 180
   ```
2. Set to 0 to disable timeout (not recommended)

## All members failed

**Symptom**: Every member shows `error` or `missing_cli`.

**Fix**:
1. Verify Node.js is installed: `node --version` (>= 18)
2. Verify npm dependencies: `cd skills/agent-council && npm install`
3. Check that at least one CLI is installed and authenticated
4. Consider using basic mode (remove `command` fields from members)

## Stale job data

**Symptom**: `.jobs/` directory grows large or contains old data.

**Fix**:
```bash
# Clean a specific job
./skills/agent-council/scripts/council.sh clean <jobDir>

# Clean all jobs
rm -rf skills/agent-council/.jobs/
```
