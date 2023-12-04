const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

function readNestedJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error.message);
        return null;
    }
}

function flattenObject(data) {
    const flatData = {};

    function recursiveFlatten(obj, currentKey = "") {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = currentKey ? `${currentKey}_${key}` : key;

                if (Array.isArray(obj[key]) && obj[key].length > 0) {
                    if (
                        typeof obj[key][0] === "object" &&
                        obj[key][0] !== null
                    ) {
                        obj[key].forEach((item, index) =>
                            recursiveFlatten(item, `${newKey}_${index}`)
                        );
                    } else {
                        flatData[newKey] = obj[key].join(", ");
                    }
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    recursiveFlatten(obj[key], newKey);
                } else {
                    flatData[newKey] = obj[key];
                }
            }
        }
    }

    recursiveFlatten(data);

    return flatData;
}

function convertToCSV(data, outputFilePath) {
    const flatData = flattenObject(data);

    const csvWriter = createCsvWriter({
        path: outputFilePath,
        header: Object.keys(flatData).map((key) => ({ id: key, title: key })),
    });

    csvWriter.writeRecords([flatData]).then(() => {
        console.log("Conversion completed successfully!");
    });
}

const jsonFilePath = "test.json"; // Assuming test.json is in the same directory as index.js
const csvFilePath = "output.csv"; // Output CSV file will be created in the same directory

const jsonData = readNestedJSONFile(jsonFilePath);
if (jsonData) {
    convertToCSV(jsonData, csvFilePath);
}
