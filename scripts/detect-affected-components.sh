#!/bin/bash

# Visual Regression Test - Affected Component Detection Script
# This script analyzes git changes and determines which components need to be tested.
#
# Usage: ./scripts/detect-affected-components.sh [base_branch]
# Output: Comma-separated component names, "ALL" (run all tests), or "NONE" (skip tests)

set -e

# Default base branch
BASE_BRANCH="${1:-origin/main}"

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
check_shared_files() {
    local patterns="
        packages/core/src/styles/
        packages/core/src/utils/
        packages/core/src/libs/
        packages/core/src/index.ts
        packages/icons/src/
        packages/hooks/src/
        apps/storybook/.storybook/
    "

    for pattern in $patterns; do
        if echo "$CHANGED_FILES" | grep -q "$pattern"; then
            return 0
        fi
    done
    return 1
}

if check_shared_files; then
    echo "ALL"
    exit 0
fi

# Map component directory to test filter name
get_component_name() {
    case "$1" in
        "avatar") echo "avatar" ;;
        "badge") echo "badge" ;;
        "box") echo "box" ;;
        "breadcrumb") echo "breadcrumb" ;;
        "button") echo "button" ;;
        "callout") echo "callout" ;;
        "card") echo "card" ;;
        "checkbox") echo "checkbox" ;;
        "collapsible") echo "collapsible" ;;
        "dialog") echo "dialog" ;;
        "field") echo "field" ;;
        "flex") echo "flex" ;;
        "floating-bar") echo "floatingbar" ;;
        "form") echo "form" ;;
        "grid") echo "grid" ;;
        "h-stack") echo "hstack" ;;
        "icon-button") echo "iconbutton" ;;
        "input-group") echo "inputgroup" ;;
        "menu") echo "menu" ;;
        "multi-select") echo "multiselect" ;;
        "navigation-menu") echo "navigationmenu" ;;
        "pagination") echo "pagination" ;;
        "popover") echo "popover" ;;
        "radio") echo "radio" ;;
        "radio-card") echo "radiocard" ;;
        "radio-group") echo "radiogroup" ;;
        "select") echo "select" ;;
        "sheet") echo "sheet" ;;
        "switch") echo "switch" ;;
        "table") echo "table" ;;
        "tabs") echo "tabs" ;;
        "text") echo "text" ;;
        "text-input") echo "textinput" ;;
        "textarea") echo "textarea" ;;
        "toast") echo "toast" ;;
        "tooltip") echo "tooltip" ;;
        "v-stack") echo "vstack" ;;
        "theme-provider") echo "themeprovider" ;;
        *) echo "" ;;
    esac
}

# Get dependent components for a given component
get_dependents() {
    case "$1" in
        "box") echo "flex grid hstack vstack toast sheet collapsible floatingbar" ;;
        "flex") echo "hstack vstack" ;;
        "button") echo "iconbutton toast" ;;
        "icon-button") echo "toast collapsible" ;;
        "badge") echo "multiselect floatingbar" ;;
        "dialog") echo "sheet" ;;
        "radio-group") echo "radio radiocard" ;;
        "input-group") echo "textinput textarea" ;;
        "h-stack") echo "toast navigationmenu" ;;
        "v-stack") echo "toast navigationmenu" ;;
        *) echo "" ;;
    esac
}

# Collect affected components (using a simple list with deduplication)
AFFECTED=""

add_component() {
    local comp="$1"
    if [ -n "$comp" ] && ! echo "$AFFECTED" | grep -q -w "$comp"; then
        if [ -z "$AFFECTED" ]; then
            AFFECTED="$comp"
        else
            AFFECTED="$AFFECTED $comp"
        fi
    fi
}

for file in $CHANGED_FILES; do
    # Check if it's a component file
    if echo "$file" | grep -q "^packages/core/src/components/"; then
        # Extract component directory name
        COMPONENT_DIR=$(echo "$file" | sed 's|packages/core/src/components/||' | cut -d'/' -f1)

        COMP_NAME=$(get_component_name "$COMPONENT_DIR")
        if [ -n "$COMP_NAME" ]; then
            # Add the changed component
            add_component "$COMP_NAME"

            # Add dependent components
            DEPS=$(get_dependents "$COMPONENT_DIR")
            for dep in $DEPS; do
                add_component "$dep"
            done
        fi
    fi
done

# Convert space-separated to comma-separated
if [ -z "$AFFECTED" ]; then
    echo "NONE"
else
    echo "$AFFECTED" | tr ' ' ','
fi
