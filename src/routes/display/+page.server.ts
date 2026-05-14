export async function load({ platform }) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed (0-11)
  const currentDay = now.getDate();

  let salahData = null;
  let changeData = {
    fajr: null,
    zhuhr: null,
    asr: null,
    maghrib: null,
    isha: null,
  };
  let timingError = true;
  let changeError = true;

  // Check if Cloudflare's platform and the DB binding are available
  if (platform?.env?.DB) {
    try {
      // Query D1 for today's specific row
      const stmt = platform.env.DB.prepare(
        "SELECT * FROM salat_times WHERE month = ? AND day = ?",
      ).bind(currentMonth, currentDay);

      salahData = await stmt.first();

      if (salahData) {
        timingError = false;

        const findNext = (column, currentValue) => {
          return platform.env.DB.prepare(
            `
            SELECT month, day, ${column} AS time FROM salat_times 
            WHERE ${column} != ? 
            ORDER BY 
            CASE WHEN id > ? THEN 0 ELSE 1 END ASC, 
            id ASC 
            LIMIT 1
            `,
          ).bind(currentValue, salahData.id);
        };

        const batchResults = await platform.env.DB.batch([
          findNext("fajr_iqama", salahData.fajr_iqama),
          findNext("zhuhr_iqama", salahData.zhuhr_iqama),
          findNext("asr_iqama", salahData.asr_iqama),
          findNext("maghrib_azaan", salahData.maghrib_azaan),
          findNext("isha_iqama", salahData.isha_iqama),
        ]);

        let foundError = false;

        const processResult = (result) => {
          if (!result || !result.results || result.results.length === 0) {
            foundError = true;
            return "";
          }

          return result.results[0];
        };

        changeData = {
          fajr: processResult(batchResults[0]),
          zhuhr: processResult(batchResults[1]),
          asr: processResult(batchResults[2]),
          maghrib: processResult(batchResults[3]),
          isha: processResult(batchResults[4]),
        };

        if (foundError) {
          console.error(
            "Database Error: Missing Iqama changes (Wrap-around check failed).",
          );
        } else {
          changeError = false;
        }
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  } else {
    console.warn(
      "D1 Database binding not found. Are you running with Wrangler?",
    );
  }

  return {
    salahData: salahData,
    changeData: changeData,
    dbError: timingError || changeError,
    timingError: timingError,
    changeError: changeError,
  };
}
