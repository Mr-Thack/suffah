<script>
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import { createClock } from '$lib/clock.svelte.js';

    const clock = createClock();

    let { data } = $props();
    const salahData = $derived(data.salahData);
    const changeData = $derived(data.changeData);

    // Replicate Legacy Announcements Ticker logic inline for simplicity
    const announcements = [
        "Please turn off your cell phones during Salah",
        "The link to this page has changed to https://masjidsuffah.com/display"
    ];

    const event1 = {
        name: "Jumu'ah Timings",
        desc: "1st Khutbah @ <strong>1:30 PM</strong><br>2nd Khutbah @ <strong>3:00 PM</strong>"
    };

    let activeAnnouncementIndex = $state(0);

    onMount(() => {
        const tickerInterval = setInterval(() => {
            activeAnnouncementIndex = (activeAnnouncementIndex + 1) % announcements.length;
        }, 15 * 1000);

        const refreshInterval = setInterval(() => {
            window.location.reload();
        }, (data.dbError ? 1 : 15) * 60 * 1000);

        return () => {
          clearInterval(tickerInterval);
          clearInterval(refreshInterval);
        };
    });

    // Native JS replacement for Hijri date
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Helper functions migrated directly from main.js
    function extractHours(dateString) {
        if (dateString && dateString.length > 0 ) return Number(dateString.split(":")[0]);
        return -1;
    }

    function extractMinutes(dateString) {
        if (dateString && dateString.length > 0) return Number(dateString.split(":")[1]);
        return -1;
    }

    function dateStringToTime(dateString) {
        if (!dateString || dateString.length == 0) {
            console.warn("Something wrong with :", dateString);
            
            return "";
        }
        let hours = extractHours(dateString);
        let minutes = extractMinutes(dateString);
        if (hours < -1 || minutes === -1) return "";

        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutes} ${ampm}`;
    }

    function totalMinutes(dateString) {
        return parseInt(extractMinutes(dateString)) + 60 * parseInt(extractHours(dateString));
    }

    // $derived replacements for all interval logic for Indicator Lights
    let currentTotalMinutes = $derived(60 * clock.time.getHours() + clock.time.getMinutes());

    function createLightState(azaanStr, nextAzaanStr) {
        const azaanMins = totalMinutes(azaanStr);
        const nextAzaanMins = totalMinutes(nextAzaanStr);
        return currentTotalMinutes >= azaanMins && currentTotalMinutes < nextAzaanMins;
    }

    let lightFajr = $derived(createLightState(salahData.fajr_azaan, salahData.shurooq));
    let lightZhuhr = $derived(createLightState(salahData.zhuhr_azaan, salahData.asr_azaan_shafi));
    let lightAsrShafi = $derived(createLightState(salahData.asr_azaan_shafi, salahData.maghrib_azaan));
    let lightAsrHanafi = $derived(createLightState(salahData.asr_azaan_hanafi, salahData.maghrib_azaan));
    let lightMaghrib = $derived(createLightState(salahData.maghrib_azaan, salahData.isha_azaan));
    let lightIsha = $derived(
        currentTotalMinutes >= totalMinutes(salahData.isha_azaan) ||
        currentTotalMinutes < totalMinutes(salahData.fajr_azaan)
    );

    function isBlinking(azaanStr, iqamaStr) {
        if (!azaanStr || !iqamaStr) return false;
        const azaanMins = totalMinutes(azaanStr);
        const iqamaMins = totalMinutes(iqamaStr);
        return (currentTotalMinutes === azaanMins || currentTotalMinutes === iqamaMins) && (clock.time.getSeconds() % 2 === 0);
    }

    // Determine which image to show for the indicator light
    function getLightImage(azaanStr, iqamaStr, isActive) {
        if (!azaanStr) return isActive ? "/images/prayer_on.png" : "/images/prayer_off.png";

        const azaanMins = totalMinutes(azaanStr);
        // If iqamaStr is null/missing (like Maghrib), default to -1 so it doesn't trigger
        const iqamaMins = iqamaStr ? totalMinutes(iqamaStr) : -1; 

        // Check if we are currently in the exact minute of Azaan or Iqama
        if (currentTotalMinutes === azaanMins || currentTotalMinutes === iqamaMins) {
          // Toggle the image every second to create the blink effect
          return clock.time.getSeconds() % 2 === 0 ? "/images/prayer_on.png" : "/images/prayer_off.png";
        }

        return isActive ? "/images/prayer_on.png" : "/images/prayer_off.png";
    }

    function formatNextChange(changeObj) {
        if (!changeObj) {
            console.warn("Something wrong with:", changeObj);

            return "";
        }

        let { month, day, time } = changeObj;

        // Pad with leading zeros
        let m = month < 10 ? "0" + month : month;
        let d = day < 10 ? "0" + day : day;

        let result = `${m}/${d}`;

        let formattedTime = dateStringToTime(time);

        if (formattedTime && formattedTime.length > 0) {
            result += `<br/>${formattedTime}`;
        }

        return result;
    }
</script>

<svelte:head>
    <title>Suffah Display</title>
</svelte:head>

<div id="logo"></div>

<ul id="clock">
    <li id="sec" style="transform: rotate({clock.time.getSeconds() * 6}deg);"></li>
    <li id="hour" style="transform: rotate({clock.time.getHours() * 30 + (clock.time.getMinutes() / 2)}deg);"></li>
    <li id="min" style="transform: rotate({clock.time.getMinutes() * 6}deg);"></li>
</ul>

<div class="container-fluid">
    <div class="row">
        <div class="col-lg-6">
            <div id="prayer_timetable_frame" class="prayer_time">

                <div class="IslamicDate" style="text-align:center; padding-top: 100px">
                    <p style="color: #643f11; font-weight: bold; font-size: 38px;">
                        {hijriFormatter.format(clock.time)}
                    </p>
                    <p style="color: #643f11; font-weight: bold; font-size: 28px; margin-top: -15px;">
                        {clock.time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div id="prayer_div_table" class="center" style="width: 700px;">
                    {#if data.timingError}
                        <div style="margin-top: 100px; text-align: center; background-color: rgba(255, 0, 0, 0.1); padding: 40px; border: 2px solid red; border-radius: 10px;">
                            <h2 style="color: red; font-size: 40px; font-weight: bold; margin-bottom: 20px;">
                                ⚠️ Connection Failure
                            </h2>
                            <p style="color: black; font-size: 28px;">
                                Unable to retrieve today's prayer times.<br>
                                The system will automatically retry shortly.
                            </p>
                        </div>
                    {:else}
                        <table id="prayer_table" class="center">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Azaan</th>
                                    <th>Iqama</th>
                                    <th>Next Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.fajr_azaan, salahData.fajr_iqama, lightFajr)} alt="light" />
                                        Fajr
                                    </th>
                                    <td>{dateStringToTime(salahData.fajr_azaan)}</td>
                                    <td>{dateStringToTime(salahData.fajr_iqama)}</td>
                                    <td class="small_time">{@html formatNextChange(changeData.fajr)}</td>
                                </tr>
                                <tr>
                                    <th>Shurooq</th>
                                    <td colspan="3">{dateStringToTime(salahData.shurooq)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.zhuhr_azaan, salahData.zhuhr_iqama, lightZhuhr)} alt="light" />
                                        Zhuhr
                                    </th>
                                    <td>{dateStringToTime(salahData.zhuhr_azaan)}</td>
                                    <td>{dateStringToTime(salahData.zhuhr_iqama)}</td>
                                    <td class="small_time">{@html formatNextChange(changeData.zhuhr)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.asr_azaan_shafi, salahData.asr_iqama, lightAsrShafi)} alt="light" />
                                        Asr Shafi
                                    </th>
                                    <td>{dateStringToTime(salahData.asr_azaan_shafi)}</td>
                                    <td rowspan="2">{dateStringToTime(salahData.asr_iqama)}</td>
                                    <td rowspan="2" class="small_time">{@html formatNextChange(changeData.asr)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.asr_azaan_hanafi, salahData.asr_iqama, lightAsrHanafi)} alt="light" />
                                        Asr Hanafi
                                    </th>
                                    <td>{dateStringToTime(salahData.asr_azaan_hanafi)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.maghrib_azaan, null, lightMaghrib)} alt="light" />
                                        Maghrib
                                    </th>
                                    <td>{dateStringToTime(salahData.maghrib_azaan)}</td>
                                    <td>After Azaan</td>
                                    <td class="small_time">{@html formatNextChange(changeData.maghrib)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        <img src={getLightImage(salahData.isha_azaan, salahData.isha_iqama, lightIsha)} alt="light" />
                                        Isha
                                    </th>
                                    <td>{dateStringToTime(salahData.isha_azaan)}</td>
                                    <td>{dateStringToTime(salahData.isha_iqama)}</td>
                                    <td class="small_time">{@html formatNextChange(changeData.isha)}</td>
                                </tr>
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <div id="weather_widget" class="prayer_time">
                <div id="announcement_label" class="prayer_time_heading" style="top: 130px; position: relative;">
                    Reminders &nbsp;
                </div>
                <div class="weather_row" >
                    <div class="weather_left">
                        <div class="heading" style="text-align: center">
                            {event1.name} 
                        </div>
                        <blockquote class="descriptionText big_text">
                            {@html event1.desc} 
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="footer" class="footer">
    <div class="footer_middle_fluid">
        <div class="ticker">
            <ul id="ticker" class="tickerul">
                {#key activeAnnouncementIndex}
                    <li transition:slide={{ duration: 500 }}>
                          {announcements[activeAnnouncementIndex]}
                    </li>
                {/key}
            </ul>
        </div>
    </div>
</div>

<style>
    /* Mimic layout structure from old PHP/CSS */
    :global(body) {
        background: transparent url("/images/background_3.jpg") top left no-repeat;
        background-color: #2a1809; /* Fallback */
        background-size: cover;
    }

    .prayer_time {
        background: transparent url("/images/prayer_type_background.png") top center no-repeat;
        height: 796px;
        width: 791px;
        position: relative;
        text-align: center;
        margin-top: 100px;
        margin-left: auto;
        margin-right: auto;
    }

    .prayer_time_heading {
        font-weight: bold;
        font-size: 40px;
        color: #B38934;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, .8);
    }

    #prayer_div_table {
        margin-top: 50px;
        font-size: 20px;
    }

    #prayer_table {
        text-align: left;
        border: 1px solid gray;
    }

    #prayer_table th {
        border: 1px solid gray;
        white-space: nowrap;
        padding: 5px;
        font-size: 22px;
        color: #B38934;
    }

    #prayer_table td {
        border: 1px solid gray;
        padding: 5px;
        text-align: center;
        font-size: 28px;
        white-space: nowrap;
    }

    #prayer_table td.small_time {
        font-size: 22px;
    }

    #logo {
        background: transparent url("/images/logo.png")  top center no-repeat;
        background-size: 200px 175px;
        width: 200px;
        height: 175px;
        position: absolute;
        margin: 0px auto;
        top: 30px;
        right: 30px;
        z-index: 4;
    }

    .center {
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        position: relative;
    }

    .heading {
        white-space: nowrap;
        font-weight: bold;
        font-size: 35px;
        color: #B38934;
    }

    .big_text {
        font-size: 25px;
    }

    .weather_row {
        clear: both;
        display: table;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        width: auto;
        height: auto;
        position: relative;
        top: 180px
    }

    .weather_left {
        float: left;
        width: 700px;
        margin: 5px;
    }

    /* Analog Clock Styles From analog_clock.php */
    #clock {
        position: absolute;
        width: 160px;
        height: 160px;
        background: url(/images/clock_dial.png) no-repeat;
        background-size: 160px;
        list-style: none;
        left:30px;
        right:auto;
        margin-top: 30px;
        margin-left:auto;
        margin-right:auto;
        z-index: 5;
    }

    #sec, #min, #hour {
        position: absolute;
        width: 8px;
        height: 160px;
        top: 0px;
        left: 76px;
    }

    #sec {
        background: url(/images/clock_seconds_hand.png) no-repeat;
        background-size: 8px 160px;
        z-index: 30;
    }

    #min {
        background: url(/images/clock_minutes_hand.png) no-repeat;
        background-size: 8px 160px;
        z-index: 20;
    }

    #hour {
        background: url(/images/clock_hours_hand.png) no-repeat;
        background-size: 8px 160px;
        z-index: 10;
    }

    /* Light Indicators (Replacing background image toggle with pure CSS dot) */
    .light-indicator {
        display: inline-block;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        margin-right: 10px;
        transition: background-color 0.2s;
    }

    /* Footer Styles */
    .footer {
        display: table;
        width: 100%;
        height: 160px;
        position: relative;
        bottom: -24px;
        box-shadow: 0px -3px 5px rgba(0, 0, 0, 0.5);
        background-color: rgba(122, 76, 21, 0.6);
        background: transparent url("/images/bottom_bar_green.png") top center no-repeat;
    }

    .footer_middle_fluid {
        display: table-cell;
        text-align: center;
    }

    .ticker {
        width: 100%;
        height: 160px;
        overflow: hidden;
    }

    ul.tickerul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    ul.tickerul li {
        height: 160px;
        padding: 7px;
        border-bottom: 1px solid rgb(243, 207, 29);
        font-size: 35px;
        color: #FFF;
    }

    /* Fix for Desktop/Laptops: Stack the layout vertically if the screen is smaller than 1620px */
    @media (max-width: 1620px) {
      .col-lg-6 {
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }

      #weather_widget {
        margin-top: 50px; 
      }
    }
</style>
