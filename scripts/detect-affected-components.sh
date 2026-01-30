#!/bin/bash

# Visual Regression Test - Affected Component Detection Script
# This script analyzes git changes and determines which components need to be tested.
#
# Usage: ./scripts/detect-affected-components.sh [base_branch]
# Output: Comma-separated component names, "ALL" (run all tests), or "NONE" (skip tests)

set -e

# Default base branch
BASE_BRANCH="${1:-origin/main}"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load dependency graph
DEPENDENCY_GRAPH="$SCRIPT_DIR/dependency-graph.json"

# Get changed files between base branch and HEAD
get_changed_files() {
    git diff --name-only "$BASE_BRANCH"...HEAD 2>/dev/null || git diff --name-only "$BASE_BRANCH" HEAD
}

CHANGED_FILES=$(get_changed_files)

# If no changes detected
if [ -z "$CHANGED_FILES" ]; then
    echo "NONE"
    exit 0
fi

# Check if shared files are changed (affects all components)
SHARED_PATTERNS=(
    "packages/core/src/styles/"
    "packages/core/src/utils/"
    "packages/core/src/libs/"
    "packages/core/src/index.ts"
    "packages/icons/src/"
    "packages/hooks/src/"
)

for pattern in "${SHARED_PATTERNS[@]}"; do
    if echo "$CHANGED_FILES" | grep -q "$pattern"; then
        echo "ALL"
        exit 0
    fi
done

# Component name mapping (directory name -> test filter name)
declare -A COMPONENT_MAP
COMPONENT_MAP=(
    ["avatar"]="avatar"
    ["badge"]="badge"
    ["box"]="box"
    ["breadcrumb"]="breadcrumb"
    ["button"]="button"
    ["callout"]="callout"
    ["card"]="card"
    ["checkbox"]="checkbox"
    ["collapsible"]="collapsible"
    ["dialog"]="dialog"
    ["field"]="field"
    ["flex"]="flex"
    ["floating-bar"]="floatingbar"
    ["form"]="form"
    ["grid"]="grid"
    ["h-stack"]="hstack"
    ["icon-button"]="iconbutton"
    ["input-group"]="inputgroup"
    ["menu"]="menu"
    ["multi-select"]="multiselect"
    ["navigation-menu"]="navigationmenu"
    ["pagination"]="pagination"
    ["popover"]="popover"
    ["radio"]="radio"
    ["radio-card"]="radiocard"
    ["radio-group"]="radiogroup"
    ["select"]="select"
    ["sheet"]="sheet"
    ["switch"]="switch"
    ["table"]="table"
    ["tabs"]="tabs"
    ["text"]="text"
    ["text-input"]="textinput"
    ["textarea"]="textarea"
    ["toast"]="toast"
    ["tooltip"]="tooltip"
    ["v-stack"]="vstack"
    ["theme-provider"]="themeprovider"
)

# Dependency graph: if component A changes, also test components in the list
# Format: component -> "dependent1 dependent2 ..."
declare -A DEPENDENCIES
DEPENDENCIES=(
    ["box"]="flex grid hstack vstack toast sheet collapsible floatingbar"
    ["flex"]="hstack vstack"
    ["button"]="iconbutton toast"
    ["icon-button"]="toast collapsible"
    ["badge"]="multiselect floatingbar"
    ["dialog"]="sheet"
    ["radio-group"]="radio radiocard"
    ["input-group"]="textinput textarea"
    ["h-stack"]="toast navigationmenu"
    ["v-stack"]="toast navigationmenu"
)

# Collect affected components
declare -A AFFECTED_SET

for file in $CHANGED_FILES; do
    # Check if it's a component file
    if [[ $file == packages/core/src/components/* ]]; then
        # Extract component directory name
        COMPONENT_DIR=$(echo "$file" | sed 's|packages/core/src/components/||' | cut -d'/' -f1)

        if [[ -n "${COMPONENT_MAP[$COMPONENT_DIR]}" ]]; then
            # Add the changed component
            AFFECTED_SET["${COMPONENT_MAP[$COMPONENT_DIR]}"]=1

            # Add dependent components
            if [[ -n "${DEPENDENCIES[$COMPONENT_DIR]}" ]]; then
                for dep in ${DEPENDENCIES[$COMPONENT_DIR]}; do
                    AFFECTED_SET["$dep"]=1
                done
            fi
        fi
    fi

    # Check if it's a storybook file change
    if [[ $file == apps/storybook/.storybook/* ]]; then
        echo "ALL"
        exit 0
    fi
done

# Convert set to comma-separated string
RESULT=""
for component in "${!AFFECTED_SET[@]}"; do
    if [ -z "$RESULT" ]; then
        RESULT="$component"
    else
        RESULT="$RESULT,$component"
    fi
done

# Output result
if [ -z "$RESULT" ]; then
    echo "NONE"
else
    echo "$RESULT"
fi
