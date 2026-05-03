import * as parse5 from "parse5";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export default function TransitionRewrite() {
    const rewrite = (html) => {
        let count = 0;

        const ast = parse5.parse(html);

        const rewriteDict = {
            "data-transition-name": "transition:name",
            "data-transition-animate": "transition:animate",
            "data-transition-persist": "transition:persist",
        };

        const walk = (node) => {
            if (node.attrs) {
                for(const attr of node.attrs) {
                    if (rewriteDict[attr.name]) {
                        attr.name = rewriteDict[attr.name];
                        count++;
                    }
                }
            }

            if (node.childNodes) {
                for (const child of node.childNodes) {
                    walk(child);
                }
            }
        }

        walk(ast);

        console.log(`Rewrote ${count} transition attributes.`);

        return parse5.serialize(ast);
    }

    const resolvePageHtmlPath = async (dir, pathname) => {
        const root = fileURLToPath(dir);
        const relativePath = pathname.replace(/^\//, "");
        const candidates = [];

        candidates.push(path.join(root, relativePath, "index.html"));
        candidates.push(path.join(root, relativePath + ".html"));

        for (const candidate of candidates) {
            try {
                const stat = await fs.stat(candidate);
                if (stat.isFile()) {
                    return candidate;
                }
            } catch {
                // ignore missing files
            }
        }

        return undefined;
    };

    return {
        name: 'transition-rewrite',

        // for dev
        vite: {
            transformIndexHtml(html) {
                return rewrite(html);
            }
        },

        // for build
        hooks: {
            'astro:build:done': async ({ pages, dir }) => {
                await Promise.all(pages.map(async (page) => {
                    console.log(`Rewriting transitions in ${page.pathname}...`);
                    const htmlPath = await resolvePageHtmlPath(dir, page.pathname);
                    if (!htmlPath) {
                        return;
                    }

                    const html = await fs.readFile(htmlPath, 'utf8');
                    const rewritten = rewrite(html);
                    await fs.writeFile(htmlPath, rewritten, 'utf8');
                }));
            }
        },
    }
}