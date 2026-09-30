import { existsSync } from "node:fs";
import { sep as pathSep } from "path";

export function getRootPrjDir(path: string): string {
    if(!existsSync(path + pathSep + 'package.json')) {
        const parentDir: string = getParentDir(path.split(pathSep));
        path = getRootPrjDir(parentDir);
    }
    return path;
}

function getParentDir(subpaths: string[]) {
    let parentDir: string = '';
    subpaths = subpaths.slice(0, subpaths.length - 1);
    for(const subpath of subpaths)
        parentDir = parentDir + subpath + pathSep;
    if(parentDir.endsWith(pathSep))
        parentDir = parentDir.substring(0, parentDir.length - 1);
    return parentDir;
}