import { sep } from "node:path";
import { Dirent } from "node:fs";
import { readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { IResolvedConfiguration } from "@cucumber/cucumber/api";
import { loadConfiguration, runCucumber } from "@cucumber/cucumber/api";
import { updateCucumberConfig } from "./src/storage/user";
import { getRootPrjDir } from "./src/utils/utils";
import type { JsonObject } from 'type-fest';

const ROOT_DIR: string = getRootPrjDir(__dirname);
const FEATURE_FILES_DIR: string = `${ROOT_DIR}${sep}features`;

interface CucumberConfig extends JsonObject {
    default: {
        worldParameters: {
            baseUrl: string,
            sender: string,
            user: string
        }
    }
}

async function start(): Promise<void> {
    const cucumberConfigPath: string = `${ROOT_DIR}${sep}cucumber.json`;
    const featureFiles: string[] = getFeatureFilesPaths(FEATURE_FILES_DIR);

    let featureFilesRunOrder: string[] = new Array<string>();

    for(const featureFile of featureFiles) {
        let previousLine: string = "", tag: string= "";
        const content: string = readFileSync(featureFile, {encoding: "utf8"});
        const lines: string[] = content.split('\n');
        for(const line of lines) {
            if(line.includes('Scenario:'))
                tag = previousLine.trim();
            previousLine = line;
        }
        if(tag === "@create")
            featureFilesRunOrder.unshift(featureFile);
        else if(tag === "@delete")
            featureFilesRunOrder.push(featureFile);
        else
            featureFilesRunOrder.length === 0 ? featureFilesRunOrder.push(featureFile) : featureFilesRunOrder.splice(1, 0,featureFile);
    }

    updateCucumberConfig();
    const config: string = readFileSync(cucumberConfigPath, {encoding: "utf8"});
    const cucumberConfig: CucumberConfig = JSON.parse(config) as CucumberConfig;

    removeFeaturePathsFromConfig(cucumberConfigPath, config);

    const { runConfiguration }: IResolvedConfiguration = await loadConfiguration({
        provided: {
            paths: featureFilesRunOrder
        }
    });
    runConfiguration.runtime.worldParameters = {...cucumberConfig.default.worldParameters, ...{cucumberConfig: config}}

    await runCucumber(runConfiguration);
}

start();

function getFeatureFilesPaths(featureFilesDir: string): string[] {
    let featureFIlesPaths: string[] = new Array<string>();
    const paths: Dirent[] = readdirSync(featureFilesDir, {encoding: 'utf8', withFileTypes: true, recursive: true});
    for (const path of paths)
        if(path.isFile())
            featureFIlesPaths.push(path.parentPath + sep + path.name);
    return featureFIlesPaths;
}

function removeFeaturePathsFromConfig(cucumberConfigPath: string, config: string): void {
    const lines: string[] = config.split('\n');

    let endOfJsonConfigLineNumber: number = 0;
    let featureFilesPathsLineNumber: number = 0;
    let defaultProfileLineNumber: number = 0;
    let endDefaultBlockLineNumber: number = 0;

    for (let lineNumber: number = 0; lineNumber < lines.length; lineNumber++)
        if (lines[lineNumber].trim().includes('default'))
            defaultProfileLineNumber = lineNumber;
    for (let lineNumber: number = 0; lineNumber < lines.length; lineNumber++)
        if (lines[lineNumber].trim().includes('paths'))
            featureFilesPathsLineNumber = lineNumber;

    for (let lineNumber: number = lines.length - 1; lineNumber >= 0 && endOfJsonConfigLineNumber === 0; lineNumber--) {
        const line: string = lines[lineNumber];
        if (line.trim() === '') {
            lineNumber--;
            let jsonLine: string = lines[lineNumber];
            while (jsonLine.trim() !== '}')
                jsonLine = lines[--lineNumber];
            endOfJsonConfigLineNumber = lineNumber;
        } else
            endOfJsonConfigLineNumber = lineNumber;
    }

    for (let lineNumber: number = defaultProfileLineNumber + 1, endDefaultBlock: number = lines[defaultProfileLineNumber].trim().includes('{') ? 1 : -1; lineNumber <= endOfJsonConfigLineNumber && endDefaultBlock !== 0; lineNumber++) {
        if (endDefaultBlock === -1)
            endDefaultBlock = 0;
        if (lines[lineNumber].trim().includes('{'))
            endDefaultBlock++
        if (lines[lineNumber].trim().includes('}'))
            endDefaultBlock--;
        endDefaultBlockLineNumber = lineNumber;
    }

    writeFileSync(cucumberConfigPath, '', {encoding: 'utf8'});

    if(featureFilesPathsLineNumber === endDefaultBlockLineNumber-1)
        for(let lineNumber: number = 0; lineNumber <= endOfJsonConfigLineNumber; lineNumber++)
            switch(lineNumber) {
                case defaultProfileLineNumber + 1:
                    appendFileSync(cucumberConfigPath, `${lines[featureFilesPathsLineNumber]},\n`, {encoding: "utf8"});
                    break;
                case featureFilesPathsLineNumber - 1:
                    appendFileSync(cucumberConfigPath, `${lines[lineNumber].substring(0, lines[lineNumber].length - 1)}\n`, {encoding: "utf8"});
                    break;
                case featureFilesPathsLineNumber:
                    break;
                default:
                    appendFileSync(cucumberConfigPath, `${lines[lineNumber]}\n`, {encoding: "utf8"});
            }
    else
        for(let lineNumber: number = 0; lineNumber <= endOfJsonConfigLineNumber; lineNumber++)
            if(lineNumber !== featureFilesPathsLineNumber)
                appendFileSync(cucumberConfigPath, `${lines[lineNumber]}\n`, {encoding: "utf8"});
}