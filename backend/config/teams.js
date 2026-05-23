const TEAM_NAME_MAP = {

  // EPL
  "Manchester United FC": "Man United",
  "Manchester City FC": "Man City",
  "Tottenham Hotspur FC": "Tottenham",
  "Wolverhampton Wanderers FC": "Wolves",
  "Nottingham Forest FC": "Nott'm Forest",
  "Newcastle United FC": "Newcastle",
  "Brighton & Hove Albion FC": "Brighton",
  "Leicester City FC": "Leicester",
  "West Ham United FC": "West Ham",
  "Sheffield United FC": "Sheffield United",
  "Ipswich Town FC": "Ipswich",
  "Leeds United FC": "Leeds",
  "Sunderland AFC": "Sunderland",
  "Brentford FC": "Brentford",
  "Crystal Palace FC": "Crystal Palace",
  "Everton FC": "Everton",
  "Chelsea FC": "Chelsea",
  "Arsenal FC": "Arsenal",
  "Liverpool FC": "Liverpool",
  "Aston Villa FC": "Aston Villa",
  "AFC Bournemouth": "Bournemouth",
  "Burnley FC": "Burnley",
  "Fulham FC": "Fulham",
  "Southampton FC": "Southampton",

  // LALIGA
 // LALIGA
// LALIGA
"FC Barcelona": "Barcelona",
"Real Madrid CF": "Real Madrid",
"Club Atlético de Madrid": "Ath Madrid",

"Athletic Club": "Ath Bilbao",
"Real Betis Balompié": "Betis",
"Real Sociedad de Fútbol": "Sociedad",
"RC Celta de Vigo": "Celta",
"Rayo Vallecano de Madrid": "Vallecano",

"Villarreal CF": "Villarreal",
"Girona FC": "Girona",
"Getafe CF": "Getafe",
"CA Osasuna": "Osasuna",
"RCD Mallorca": "Mallorca",
"Deportivo Alavés": "Alaves",
"UD Las Palmas": "Las Palmas",
"RCD Espanyol de Barcelona": "Espanyol",
"CD Leganés": "Leganes",
"Real Valladolid CF": "Valladolid",

"Sevilla FC": "Sevilla",
"Valencia CF": "Valencia",

"Levante UD": "Levante",
"Elche CF": "Elche",
"Real Oviedo": "Oviedo",
"UD Almería": "Almeria",
"Cádiz CF": "Cadiz",
"Granada CF": "Granada"
};

const TEAM_LOGOS = {

  // EPL
  "Arsenal": "https://crests.football-data.org/57.png",
  "Aston Villa": "https://crests.football-data.org/58.png",
  "Bournemouth": "https://crests.football-data.org/1044.png",
  "Brentford": "https://crests.football-data.org/402.png",
  "Brighton": "https://crests.football-data.org/397.png",
  "Burnley": "https://crests.football-data.org/328.png",
  "Chelsea": "https://crests.football-data.org/61.png",
  "Crystal Palace": "https://crests.football-data.org/354.png",
  "Everton": "https://crests.football-data.org/62.png",
  "Fulham": "https://crests.football-data.org/63.png",
  "Leeds": "https://crests.football-data.org/341.png",
  "Leicester": "https://crests.football-data.org/338.png",
  "Liverpool": "https://crests.football-data.org/64.png",
  "Man City": "https://crests.football-data.org/65.png",
  "Man United": "https://crests.football-data.org/66.png",
  "Newcastle": "https://crests.football-data.org/67.png",
  "Nott'm Forest": "https://crests.football-data.org/351.png",
  "Southampton": "https://crests.football-data.org/340.png",
  "Sunderland": "https://crests.football-data.org/345.png",
  "Tottenham": "https://crests.football-data.org/73.png",
  "West Ham": "https://crests.football-data.org/563.png",
  "Wolves": "https://crests.football-data.org/76.png",

  // LALIGA
  "Barcelona": "https://crests.football-data.org/81.png",
  "Real Madrid": "https://crests.football-data.org/86.png",
  "Atletico Madrid": "https://crests.football-data.org/78.png",
  "Athletic Bilbao": "https://crests.football-data.org/77.png",
  "Real Betis": "https://crests.football-data.org/90.png",
  "Real Sociedad": "https://crests.football-data.org/92.png",
  "Sevilla": "https://crests.football-data.org/559.png",
  "Valencia": "https://crests.football-data.org/95.png",
  "Villarreal": "https://crests.football-data.org/94.png",
  "Girona": "https://crests.football-data.org/298.png",
  "Getafe": "https://crests.football-data.org/82.png",
  "Celta Vigo": "https://crests.football-data.org/558.png",
  "Osasuna": "https://crests.football-data.org/79.png",
  "Rayo Vallecano": "https://crests.football-data.org/87.png",
  "Mallorca": "https://crests.football-data.org/89.png",
  "Alaves": "https://crests.football-data.org/263.png",
  "Las Palmas": "https://crests.football-data.org/275.png",
  "Espanyol": "https://crests.football-data.org/80.png",
  "Leganes": "https://crests.football-data.org/745.png",
  "Valladolid": "https://crests.football-data.org/250.png"
};

const normalizeTeamName = (name) => {
  return TEAM_NAME_MAP[name] || name;
};

module.exports = {
  TEAM_NAME_MAP,
  TEAM_LOGOS,
  normalizeTeamName
};