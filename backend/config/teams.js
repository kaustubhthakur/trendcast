
const TEAM_NAME_MAP = {
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
  "Southampton FC": "Southampton"
};

const TEAM_LOGOS = {
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
  "Wolves": "https://crests.football-data.org/76.png"
};

const normalizeTeamName = (name) => {
  return TEAM_NAME_MAP[name] || name;
};

module.exports = {
  TEAM_NAME_MAP,
  TEAM_LOGOS,
  normalizeTeamName
};