// --- Phone Format Definitions (Cipher: #=X, -=d, space=_, ()=p) ---
const F_pXXXp_XXXdXXXX = '(###) ###-####'
const F_pXXXp_XXXdXXdXX = '(###) ###-##-##'
const F_X_XX_XX_XX_XX = '# ## ## ## ##'
const F_XdXXdXXdXX = '#-##-##-##'
const F_XdXXXdXXdXX = '#-###-##-##'
const F_XdXXXdXXX = '#-###-###'
const F_XdXXXdXXXX = '#-###-####'
const F_XdXXXXdXXXX = '#-####-####'
const F_XdXXXXXX = '#-######'
const F_XdXXXXXXXX = '#-########'
const F_XX_XX_XX_XX = '## ## ## ##'
const F_XX_XX_XXXX = '## ## ####'
const F_XX_XXX_XXX = '## ### ###'
const F_XX_XXX_XXXX = '## ### ####'
const F_XX_XXXdXXXX = '## ###-####'
const F_XXdXXdXX = '##-##-##'
const F_XXdXXdXXdXX = '##-##-##-##'
const F_XXdXXdXXXX = '##-##-####'
const F_XXdXXdXXXXX = '##-##-#####'
const F_XXdXXdXXXdXXX = '##-##-###-###'
const F_XXdXXX = '##-###'
const F_XXdXXXdXXX = '##-###-###'
const F_XXdXXXdXXXX = '##-###-####'
const F_XXdXXXdXXdXX = '##-###-##-##'
const F_XXdXXXX = '##-####'
const F_XXdXXXXdXXXX = '##-####-####'
const F_XXdXXXXdXXX = '##-####-###'
const F_XXdXXXXX = '##-#####'
const F_XXdXXXXXX = '##-######'
const F_XXdXXXXXdXXXX = '##-#####-####'
const F_XXdXXXXXXX = '##-#######'
const F_XXX_XX_XX_XX = '### ## ## ##'
const F_XXX_XXX_XXX = '### ### ###'
const F_XXXdXXdXXX = '###-##-###'
const F_XXXdXXX = '###-###'
const F_XXXdXXXdXXX = '###-###-###'
const F_XXXdXXXdXXXX = '###-###-####'
const F_XXXdXXXX = '###-####'
const F_XXXdXXXXdXXX = '###-####-###'
const F_XXXdXXXXdXXXX = '###-####-####'
const F_XXXdXXXXX = '###-#####'
const F_XXXdXXXXXX = '###-######'
const F_XXXdXXXXXXX = '###-#######'
const F_XXXX = '####'
const F_XXXX_XXXX = '#### ####'
const F_XXXX_XXXXXX = '#### ######'
const F_XXXXdXXXX = '####-####'
const F_XXXXdXXXdXXXX = '####-###-####'
const F_XXXXdXXXXXX = '####-######'
const F_XXXXdXXXXXXX = '####-#######'
const F_XXXXX = '#####'
const F_XXXXXdXXXX = '#####-####'
const F_XXXXXX = '######'

export const phoneFormats: Record<string, string> = {
  // --- North America ---
  '1': F_pXXXp_XXXdXXXX, // United States, Canada, and various Caribbean nations

  // --- Africa ---
  '20': F_XX_XXX_XXXX, // Egypt
  '211': F_XX_XXX_XXXX, // South Sudan
  '212': F_XXdXXXXdXXXX, // Morocco
  '213': F_XXX_XX_XX_XX, // Algeria
  '216': F_XX_XXX_XXX, // Tunisia
  '218': F_XXdXXXdXXXX, // Libya
  '220': F_XXXdXXXX, // Gambia
  '221': F_XX_XXX_XXXX, // Senegal
  '222': F_XdXXdXXdXX, // Mauritania
  '223': F_XX_XX_XXXX, // Mali
  '224': F_XXX_XXX_XXX, // Guinea
  '225': F_XXdXXdXXdXX, // Côte d'Ivoire
  '226': F_XX_XX_XXXX, // Burkina Faso
  '227': F_XX_XX_XXXX, // Niger
  '228': F_XX_XXX_XXX, // Togo
  '229': F_XX_XX_XXXX, // Benin
  '230': F_XXXXdXXXX, // Mauritius
  '231': F_XX_XXXdXXXX, // Liberia
  '232': F_XXdXXXXXX, // Sierra Leone
  '233': F_XXdXXXdXXXX, // Ghana
  '234': F_XXXdXXXdXXXX, // Nigeria
  '235': F_XX_XX_XX_XX, // Chad
  '236': F_XX_XX_XXXX, // Central African Republic
  '237': F_XXXXdXXXX, // Cameroon
  '238': F_XXXdXXXX, // Cape Verde
  '239': F_XXdXXXXX, // Sao Tome and Principe
  '240': F_XXXdXXXXXX, // Equatorial Guinea
  '241': F_XdXXdXXdXX, // Gabon
  '242': F_XXdXXXdXXXX, // Congo (Brazzaville)
  '243': F_XXXdXXXdXXX, // Congo (Kinshasa)
  '244': F_XXXdXXXdXXX, // Angola
  '245': F_XdXXXXXX, // Guinea-Bissau
  '246': F_XXXdXXXX, // Diego Garcia
  '247': F_XXXX, // Ascension Island
  '248': F_XdXXXdXXX, // Seychelles
  '249': F_XXdXXXdXXXX, // Sudan
  '250': F_XXXdXXXdXXX, // Rwanda
  '251': F_XXdXXXdXXXX, // Ethiopia
  '252': F_XdXXXdXXXX, // Somalia
  '253': F_XXdXXdXXdXX, // Djibouti
  '254': F_XXXdXXXXXX, // Kenya
  '255': F_XXdXXXdXXXX, // Tanzania
  '256': F_XXXdXXXXXX, // Uganda
  '257': F_XXdXXdXXXX, // Burundi
  '258': F_XXdXXXdXXX, // Mozambique
  '260': F_XXdXXXXXXX, // Zambia
  '261': F_XXdXXdXXXXX, // Madagascar
  '262': F_XXXXdXXXXXX, // Réunion
  '263': F_XXdXXXXXXX, // Zimbabwe
  '264': F_XXdXXXdXXXX, // Namibia
  '265': F_XdXXXXdXXXX, // Malawi
  '266': F_XdXXXdXXXX, // Lesotho
  '267': F_XXdXXXdXXX, // Botswana
  '268': F_XdXXXdXXXX, // Eswatini
  '269': F_XXdXXXXX, // Comoros
  '27': F_XXdXXXdXXXX, // South Africa
  '290': F_XXXX, // Saint Helena
  '291': F_XdXXXdXXX, // Eritrea
  '297': F_XXXdXXXX, // Aruba
  '298': F_XXXXXX, // Faroe Islands
  '299': F_XXdXXdXX, // Greenland

  // --- Europe ---
  '30': F_XXXdXXXXXXX, // Greece
  '31': F_XdXXXXXXXX, // Netherlands
  '32': F_XXXdXXXdXXX, // Belgium
  '33': F_X_XX_XX_XX_XX, // France
  '34': F_XXX_XXX_XXX, // Spain
  '350': F_XXXdXXXXX, // Gibraltar
  '351': F_XXXdXXXdXXX, // Portugal
  '352': F_XXXdXXX, // Luxembourg
  '353': F_XXdXXXdXXXX, // Ireland
  '354': F_XXXdXXXX, // Iceland
  '355': F_XXdXXXdXXXX, // Albania
  '356': F_XXXXdXXXX, // Malta
  '357': F_XXdXXXXXX, // Cyprus
  '358': F_XXdXXXdXXXX, // Finland
  '359': F_XXXdXXXdXXX, // Bulgaria
  '36': F_XXdXXXdXXXX, // Hungary
  '370': F_XXXdXXXXX, // Lithuania
  '371': F_XXdXXXdXXX, // Latvia
  '372': F_XXXXdXXXX, // Estonia
  '373': F_XXXXdXXXX, // Moldova
  '374': F_XXdXXXXXX, // Armenia
  '375': F_XXdXXXdXXdXX, // Belarus
  '376': F_XXXdXXX, // Andorra
  '377': F_XXdXXdXXdXX, // Monaco
  '378': F_XXXXdXXXXXX, // San Marino
  '379': F_XXXX_XXXX, // Vatican City
  '380': F_XXdXXXdXXdXX, // Ukraine
  '381': F_XXdXXXXXXX, // Serbia
  '382': F_XXdXXXdXXX, // Montenegro
  '383': F_XXdXXXdXXX, // Kosovo
  '385': F_XXdXXXdXXXX, // Croatia
  '386': F_XXdXXXdXXX, // Slovenia
  '387': F_XXdXXXdXXX, // Bosnia and Herzegovina
  '389': F_XXdXXXdXXX, // North Macedonia
  '39': F_XXXdXXXXdXXX, // Italy
  '40': F_XXdXXXdXXXX, // Romania
  '41': F_XXdXXXdXXdXX, // Switzerland
  '420': F_XXXdXXXdXXX, // Czech Republic
  '421': F_XXXdXXXdXXX, // Slovakia
  '423': F_XXXdXXXX, // Liechtenstein
  '43': F_XXXdXXXXXXX, // Austria
  '44': F_XXXX_XXXXXX, // United Kingdom
  '45': F_XXdXXdXXdXX, // Denmark
  '46': F_XXdXXXdXXXX, // Sweden
  '47': F_XXXdXXdXXX, // Norway
  '48': F_XXXdXXXdXXX, // Poland
  '49': F_XXXXdXXXXXXX, // Germany

  // --- Asia ---
  '60': F_XXdXXXXdXXXX, // Malaysia
  '61': F_XdXXXXdXXXX, // Australia
  '62': F_XXXdXXXXdXXXX, // Indonesia
  '63': F_XXXdXXXdXXXX, // Philippines
  '64': F_XdXXXdXXXX, // New Zealand
  '65': F_XXXXdXXXX, // Singapore
  '66': F_XXdXXXdXXXX, // Thailand
  '7': F_pXXXp_XXXdXXdXX, // Kazakhstan and Russia
  '81': F_XXdXXXXdXXXX, // Japan
  '82': F_XXdXXXXdXXXX, // South Korea
  '84': F_XXdXXXXdXXX, // Vietnam
  '850': F_XXXdXXXXXXX, // North Korea
  '852': F_XXXXdXXXX, // Hong Kong
  '853': F_XXXXdXXXX, // Macau
  '855': F_XXdXXXdXXX, // Cambodia
  '856': F_XXdXXdXXXdXXX, // Laos
  '86': F_XXXdXXXXdXXXX, // China
  '880': F_XXXXdXXXXXX, // Bangladesh
  '886': F_XdXXXXdXXXX, // Taiwan
  '90': F_XXXdXXXdXXXX, // Turkey
  '91': F_XXXXdXXXdXXXX, // India
  '92': F_XXXdXXXXXXX, // Pakistan
  '93': F_XXdXXXdXXXX, // Afghanistan
  '94': F_XXdXXXXXXX, // Sri Lanka
  '95': F_XdXXXdXXX, // Myanmar
  '960': F_XXXdXXXX, // Maldives
  '961': F_XXdXXXdXXX, // Lebanon
  '962': F_XdXXXXdXXXX, // Jordan
  '963': F_XXXdXXXdXXX, // Syria
  '964': F_XXXdXXXdXXXX, // Iraq
  '965': F_XXXXdXXXX, // Kuwait
  '966': F_XXdXXXdXXXX, // Saudi Arabia
  '967': F_XXXdXXXdXXX, // Yemen
  '968': F_XXXXdXXXX, // Oman
  '970': F_XXdXXXdXXXX, // Palestine
  '971': F_XXdXXXdXXXX, // UAE
  '972': F_XdXXXdXXXX, // Israel
  '973': F_XXXXdXXXX, // Bahrain
  '974': F_XXXXdXXXX, // Qatar
  '975': F_XdXXXdXXX, // Bhutan
  '976': F_XXdXXdXXXX, // Mongolia
  '977': F_XXXdXXXXXXX, // Nepal
  '98': F_XXXdXXXdXXXX, // Iran
  '992': F_XXdXXXdXXXX, // Tajikistan
  '993': F_XXdXXXXXX, // Turkmenistan
  '994': F_XXdXXXdXXdXX, // Azerbaijan
  '995': F_XXXdXXXdXXX, // Georgia
  '996': F_XXXdXXXdXXX, // Kyrgyzstan
  '998': F_XXdXXXdXXdXX, // Uzbekistan

  // --- South America ---
  '500': F_XXXXX, // Falkland Islands
  '501': F_XXXdXXXX, // Belize
  '502': F_XdXXXdXXXX, // Guatemala
  '503': F_XXXXdXXXX, // El Salvador
  '504': F_XXXXdXXXX, // Honduras
  '505': F_XXXXdXXXX, // Nicaragua
  '506': F_XXXXdXXXX, // Costa Rica
  '507': F_XXXXdXXXX, // Panama
  '508': F_XXdXXXX, // Saint Pierre and Miquelon
  '509': F_XXdXXdXXXX, // Haiti
  '51': F_XXXdXXXdXXX, // Peru
  '52': F_XXXdXXXdXXXX, // Mexico
  '53': F_XdXXXdXXXX, // Cuba
  '54': F_XXXdXXXdXXXX, // Argentina
  '55': F_XXdXXXXXdXXXX, // Brazil
  '56': F_XdXXXXdXXXX, // Chile
  '57': F_XXXdXXXdXXXX, // Colombia
  '58': F_XXXdXXXXXXX, // Venezuela
  '590': F_XXXXXdXXXX, // Guadeloupe
  '591': F_XdXXXdXXXX, // Bolivia
  '592': F_XXXdXXXX, // Guyana
  '593': F_XdXXXdXXXX, // Ecuador
  '594': F_XXXXXdXXXX, // French Guiana
  '595': F_XXXdXXXXXX, // Paraguay
  '596': F_XXXXXdXXXX, // Martinique
  '597': F_XXXdXXXX, // Suriname
  '598': F_XdXXXdXXdXX, // Uruguay
  '599': F_XdXXXdXXXX, // Curaçao and Caribbean Netherlands

  // --- Oceania ---
  '670': F_XXXdXXXX, // Timor-Leste
  '672': F_XXXdXXX, // Norfolk Island
  '673': F_XXXdXXXX, // Brunei
  '674': F_XXXdXXXX, // Nauru
  '675': F_XXXdXXXX, // Papua New Guinea
  '676': F_XXXXX, // Tonga
  '677': F_XXXXX, // Solomon Islands
  '678': F_XXXXX, // Vanuatu
  '679': F_XXXdXXXX, // Fiji
  '680': F_XXXdXXXX, // Palau
  '681': F_XXdXXXX, // Wallis and Futuna
  '682': F_XXdXXX, // Cook Islands
  '683': F_XXXX, // Niue
  '685': F_XXdXXXX, // Samoa
  '686': F_XXXXX, // Kiribati
  '687': F_XXdXXXX, // New Caledonia
  '688': F_XXXXX, // Tuvalu
  '689': F_XXdXXdXX, // French Polynesia
  '690': F_XXXX, // Tokelau
  '691': F_XXXdXXXX, // Micronesia
  '692': F_XXXdXXXX, // Marshall Islands
}
