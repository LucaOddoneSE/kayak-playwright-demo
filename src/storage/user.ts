import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { sep as pathSep } from "path";
import { getRootPrjDir } from "../utils/utils";
import { CucumberConfig } from "./cucumberConfig";

const CUCUMBER_CONFIG_FILE: string = getRootPrjDir(__dirname) + pathSep + 'cucumber.json';

export function loadUserConfiguration(): string {
    const cucumberConfig: CucumberConfig = JSON.parse(readFileSync(CUCUMBER_CONFIG_FILE, {encoding: "utf-8"}));
    const user: string = cucumberConfig.default.worldParameters.user;

    if(typeof user === "undefined")
        updateCucumberConfig();

    return JSON.parse(readFileSync(CUCUMBER_CONFIG_FILE, {encoding: "utf-8"})).default.worldParameters.user;
}

export function updateCucumberConfig(emailAddress: string = "") {
    let lastJSONitemLineNumber!: number;
    const lines: string[] = readFileSync(CUCUMBER_CONFIG_FILE, {encoding: "utf-8"}).split('\n');
    const worldParametersLineNumber: number = getLineOfFirstOccurrence('worldParameters');
    const indentation: string = getJSONindentationLevelByPropertyName('baseUrl');


    for(let index: number = worldParametersLineNumber+1; index < lines.length && lines[index].includes(','); index++)
        lastJSONitemLineNumber = index;
    lastJSONitemLineNumber++;

    writeFileSync(CUCUMBER_CONFIG_FILE, '');

    for(let index: number = 0; index < lastJSONitemLineNumber; index++)
        if(!lines[index].includes('user'))
            appendFileSync(CUCUMBER_CONFIG_FILE, lines[index] + '\n');

    if(!lines[lastJSONitemLineNumber].includes('user'))
        appendFileSync(CUCUMBER_CONFIG_FILE, `${lines[lastJSONitemLineNumber]},\n`);
    appendFileSync(CUCUMBER_CONFIG_FILE, `${indentation}"user": "${emailAddress}"\n`);

    for(let index: number = lastJSONitemLineNumber+1; index < lines.length; index++)
        appendFileSync(CUCUMBER_CONFIG_FILE, lines[index] + '\n');
}

function getLineOfFirstOccurrence(pattern: string): number {
    let lineNumber: number = 0;
    const lines: string[] = readFileSync(CUCUMBER_CONFIG_FILE, {encoding: 'utf8'}).split('\n');

    for(let index: number = 0; index < lines.length && !lines[index].includes(pattern); index++)
        lineNumber++

    return lineNumber;
}

function getJSONindentationLevelByPropertyName(property: string): string {
    const lines: string[] = readFileSync(CUCUMBER_CONFIG_FILE, {encoding: "utf-8"}).split('\n');
    const lineNumber: number = getLineOfFirstOccurrence(property);
    const line: string = lines[lineNumber];

    const indentation: string = line.match(new RegExp('^\\s+', 'm'))![0];

    return indentation;
}