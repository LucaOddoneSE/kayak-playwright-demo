import type { FormatterPlugin } from '@cucumber/cucumber/api';
import type { SnippetInterface } from "@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax";
import { PrettyPrinter } from './PrettyPrinter';
import type { FormatCodeFunction, SummaryOptions, Theme } from './types';
//import type { FormatOptions } from '@cucumber/cucumber'

interface FormatOptions {
    colorsEnabled?: boolean;
    html?: {
        externalAttachments?: boolean | ReadonlyArray<string>;
    };
    includeAttachments?: boolean;
    pretty?: {
        includeFeatureLine?: boolean;
        includeRuleLine?: boolean;
        useStatusIcon?: boolean;
        formatCode?: FormatCodeFunction;
    };
    printAttachments?: boolean;
    rerun?: {
        separator?: string;
    };
    snippetInterface?: SnippetInterface;
    snippetSyntax?: string;
    theme?: Theme;
    [customKey: string]: any;
}

function resolveTerminalOptions(options: FormatOptions): SummaryOptions {
    const includeAttachments = options.includeAttachments ?? options.printAttachments
    const resolvedOptions: SummaryOptions = {}
    if (includeAttachments !== undefined) {
        resolvedOptions.includeAttachments = includeAttachments
    }
    if (options.theme !== undefined) {
        resolvedOptions.theme = options.theme
    }
    return resolvedOptions
}


export default {
    type: 'formatter',
    formatter({ on, stream, options }) {
        const printer = new PrettyPrinter({
            stream,
            options: {
                ...resolveTerminalOptions(options),
                ...options.pretty,
                summarise: true,
            },
        })
        on('message', (envelope) => printer.update(envelope))
    },
} satisfies FormatterPlugin<FormatOptions>