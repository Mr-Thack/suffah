import fs from "fs";
import readline from "readline";

const inputFile = "salat_times.csv";
const outputFile = "seed.sql";

async function generateSQL() {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const writeStream = fs.createWriteStream(outputFile);

  // 1. Write the new table schema
  writeStream.write(`DROP TABLE IF EXISTS salat_times;\n`);
  writeStream.write(`CREATE TABLE salat_times (
    id INTEGER PRIMARY KEY,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    fajr_azaan TEXT NOT NULL,
    fajr_iqama TEXT NOT NULL,
    zhuhr_azaan TEXT NOT NULL,
    zhuhr_iqama TEXT NOT NULL,
    asr_azaan_shafi TEXT NOT NULL,
    asr_azaan_hanafi TEXT NOT NULL,
    asr_iqama TEXT NOT NULL,
    maghrib_azaan TEXT NOT NULL,
    isha_azaan TEXT NOT NULL,
    isha_iqama TEXT NOT NULL,
    shurooq TEXT NOT NULL
  );\n\n`);

  let isHeader = true;

  // 2. Parse the CSV and generate INSERT statements
  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue; // Skip the CSV header row
    }

    // Split by comma and strip out the double quotes
    const rawValues = line.split(",");
    const values = rawValues.map((v) => v.replace(/^"|"$/g, ""));

    // Map Ints and wrap Times in single quotes for SQL
    const id = parseInt(values[0], 10);
    const month = parseInt(values[1], 10);
    const day = parseInt(values[2], 10);
    const fajr_azaan = `'${values[3]}'`;
    const fajr_iqama = `'${values[4]}'`;
    const zhuhr_azaan = `'${values[5]}'`;
    const zhuhr_iqama = `'${values[6]}'`;
    const asr_azaan_shafi = `'${values[7]}'`;
    const asr_azaan_hanafi = `'${values[8]}'`;
    const asr_iqama = `'${values[9]}'`;
    const maghrib_azaan = `'${values[10]}'`;
    const isha_azaan = `'${values[11]}'`;
    const isha_iqama = `'${values[12]}'`;
    const shurooq = `'${values[13]}'`;

    const sql = `INSERT INTO salat_times VALUES (${id}, ${month}, ${day}, ${fajr_azaan}, ${fajr_iqama}, ${zhuhr_azaan}, ${zhuhr_iqama}, ${asr_azaan_shafi}, ${asr_azaan_hanafi}, ${asr_iqama}, ${maghrib_azaan}, ${isha_azaan}, ${isha_iqama}, ${shurooq});\n`;

    writeStream.write(sql);
  }

  writeStream.end();
  console.log("✅ Generated seed.sql successfully!");
}

generateSQL();
