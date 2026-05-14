CREATE TRIGGER enforce_chronological_dates
BEFORE INSERT ON salat_times
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM salat_times) > 0 -- Skip check for the very first row
BEGIN
    SELECT CASE
        -- Compare the math of the last inserted row to the new row
        WHEN (
          SELECT (month * 100 + day) FROM salat_times ORDER BY id DESC LIMIT 1
        ) >= (NEW.month * 100 + NEW.day) 
        -- Exception: Allow wrapping from December 31 (1231) to Jan 1 (101)
        AND NOT (
          (SELECT month FROM salat_times ORDER BY id DESC LIMIT 1) = 12 AND NEW.month = 1
        )
        THEN RAISE(ABORT, 'Insertion failed: Date must be strictly after the previous date.')
    END;
END;
