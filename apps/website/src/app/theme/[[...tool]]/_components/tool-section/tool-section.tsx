import { Badge, Text } from '@vapor-ui/core';
import { ChevronRightOutlineIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import Link from 'next/link';

import type { ThemeTool } from '~/constants/theme-tools';

/* -------------------------------------------------------------------------------------------------
 * Tool Item
 * -----------------------------------------------------------------------------------------------*/
const ToolItem = ({ tool, isActive }: { tool: ThemeTool; isActive?: boolean }) => {
    const content = (
        <div
            className={clsx(
                'group flex items-center justify-between py-v-300 border-b border-v-normal-200',
                'transition-colors hover:bg-v-canvas-200 -mx-v-200 px-v-200 rounded-v-100',
                isActive && 'bg-v-canvas-200',
            )}
        >
            <div className="flex flex-col gap-v-50">
                <div className="flex items-center gap-v-200">
                    <Text typography="heading5" foreground="normal-100">
                        {tool.name}
                    </Text>
                    {tool.badge && (
                        <Badge colorPalette="hint" shape="square" size="sm">
                            {tool.badge}
                        </Badge>
                    )}
                </div>
                <Text typography="body3" foreground="hint-100">
                    {tool.description}
                </Text>
            </div>
            <div className="flex-shrink-0 text-v-hint-100 group-hover:text-v-normal-100 transition-colors">
                {tool.isExternal ? (
                    <OpenInNewOutlineIcon size={16} />
                ) : (
                    <ChevronRightOutlineIcon
                        size={16}
                        className="group-hover:translate-x-0.5 transition-transform"
                    />
                )}
            </div>
        </div>
    );

    if (tool.isExternal && tool.href) {
        return (
            <a href={tool.href} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    }

    if (tool.href) {
        return (
            <Link href={tool.href} scroll={false}>
                {content}
            </Link>
        );
    }

    return content;
};

/* -------------------------------------------------------------------------------------------------
 * Tool Section
 * -----------------------------------------------------------------------------------------------*/
export type ToolSectionProps = {
    title: string;
    description: string;
    tools: ThemeTool[];
    activeToolId?: string;
};

export const ToolSection = ({ title, description, tools, activeToolId }: ToolSectionProps) => (
    <div className="grid grid-cols-[280px_1fr] gap-v-600 max-lg:grid-cols-1 max-lg:gap-v-300">
        <div className="flex flex-col gap-v-100 lg:sticky lg:top-[80px] lg:self-start">
            <span className="text-xs font-medium uppercase tracking-widest text-v-hint-100">
                {title}
            </span>
            <Text typography="body3" foreground="hint-100">
                {description}
            </Text>
        </div>
        <div className="flex flex-col">
            {tools.map((tool) => (
                <ToolItem key={tool.id} tool={tool} isActive={tool.id === activeToolId} />
            ))}
        </div>
    </div>
);
