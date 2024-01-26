'use strict';
import _yargs from 'yargs';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { hideBin } from 'yargs/helpers';
const args = _yargs(hideBin(process.argv)).argv;
import { json2csv } from 'json-2-csv';

const checkArguments = () => {
  if (Object.keys(args).length <= 2) {
    console.warn("Usage: nodejs converter.js --src <path> --dst <path>");
    console.warn("Optional: --exclude file1, file2, ... (comma-separated list of files)");
    process.exit(0);
  }
  
  const sourceDirectory = args.src;
  const destinationDirectory = args.dst;
  const exclusionList = args.exclude.split(',').map(file => file.trim());
  
  if (!sourceDirectory || !destinationDirectory) {
    console.warn("Please supply both source and destination directories");
    console.warn("Source: --src <path>");
    console.warn("Destination: --dst <path>");
    process.exit(1);
  }
  
  return [sourceDirectory, destinationDirectory, exclusionList];
}

const readSourceFiles = (directory, exclusionList) => {
  let files = [];
  readdirSync(directory).forEach(file => {
    if (exclusionList && Array.isArray(exclusionList)) {
      if (exclusionList.includes(file)) {
        return;
      }
    }
    
    if (file.includes('.json')) {
      files.push(file);
    }
    
  });
  return files;
}

const createNewFilename = (file, dst) => {
  return `${dst}/${file.replace('.json', '.csv')}`;
}

const convertFile = async (file, src, dst) => {
  const origin = `${src}/${file}`;
  const destFile = createNewFilename(file, dst);
  // console.log("Converting: " + `${origin} to ${destFile}`);
  let jsonData;
  try {
    // Read file synchronously
    const fileContent = readFileSync(origin, 'utf8');
    jsonData = JSON.parse(fileContent);
    
    const csv = json2csv(jsonData, {});
    try {
      writeFileSync(destFile, csv, 'utf-8');
      console.log('Wrote file: ' + destFile);
    } catch (error) {
      console.error('Error writing to file:', error);
    }
    
  } catch (error) {
    console.error('Error reading or parsing the file:', error.message);
  }
  
}

const main = () => {
  let src, dst, exclusionList;
  [src, dst, exclusionList] = checkArguments();
  const srcFileList = readSourceFiles(src, exclusionList);
  srcFileList.forEach(file => {
    convertFile(file, src, dst);
  });
}

main();
process.exit(0);






