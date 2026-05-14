function getSecondsToMidnightAtlanta() {
  const now = new Date();

  const atlantaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const tomorrow = new Date(atlantaTime);
  tomorrow.setHours(24, 0, 0, 0);

  return Math.floor((tomorrow - atlantaTime) / 1000);
}

export async function load({ platform, setHeaders }) {
  const now = new Date();

  const atlantaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const currentMonth = atlantaTime.getMonth() + 1; // JavaScript months are 0-indexed (0-11)
  const currentDay = atlantaTime.getDate();

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

  let dbError = timingError || changeError;

  if (dbError) {
    const secondsToMidnight = getSecondsToMidnightAtlanta();

    setHeaders({
      // max-age=899 (almost 15 mins) for the browser
      // s-maxage to tell Cloudflare to hold it until midnight
      "Cache-Control": `public, max-age=899, s-maxage=${secondsToMidnight}`,
    });
  } else {
    setHeaders({
      "Cache-Control": "no-store",
    });
  }

  return {
    salahData: salahData,
    changeData: changeData,
    dbError: dbError,
    timingError: timingError,
    changeError: changeError,
  };
}
