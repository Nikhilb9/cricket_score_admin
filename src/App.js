import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Optional, for adding custom styles

const App = () => {
  const [teamData, setTeamData] = useState({
    name: '',
    runs: 0,
    wickets: 0,
    overs: 0,
    wide: 0,
    noBall: 0,
    legBye: 0,
    bye: 0,
    overthrow: 0,
  });

  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [players, setPlayers] = useState({
    batsman: [],
    bowler: [],
  });

  const [commentary, setCommentary] = useState([]);

  // Define the async function inside the useEffect
  const fetchMatchScore = async () => {
    try {
      const response = await axios.get(
        'http://localhost:9000/cricket/match/score'
      );
      setTeamData(response.data);
      setCommentary(response.data.commentaries.comment);
      response.data.playerScore.batsman.forEach((player) => {
        if (player.isOnStrike && player.isOnField) {
          setStriker({ name: player.playerName, id: player.playerId });
        }

        if (!player.isOnStrike && player.isOnField) {
          setNonStriker({ name: player.playerName, id: player.playerId });
        }
      });

      response.data.playerScore.bowler.forEach((player) => {
        if (player.isOnBowling) {
          setBowler({ name: player.playerName, id: player.playerId });
        }
      });
      // setStriker(response.data.playerScore.batsman.find((val) => ))
      setPlayers(response.data.playerScore);
    } catch (err) {
      console.error('Error fetching match score:', err);
    }
  };

  // Fetch player data from API on component mount
  useEffect(() => {
    // Call the async function

    fetchMatchScore();
  }, []); // Empty dependency array ensures the effect runs only on mount

  // Handle action when a button is pressed (e.g., 0, 1, Wicket, Wide, etc.)
  const handleAction = async (action) => {
    const body = {
      event: 'EXTRA',
      runValue: 0,
      ballStatus: '',
      isWicket: false,
      newBall: false,
      batsmanId: striker.id,
      bowlerId: bowler.id,
    };

    if (typeof action == 'number') {
      body.event = 'RUN';
      body.runValue = action;
      body.ballStatus = 'VALID';
    }

    if (action === 'WIDE') {
      body.event = 'EXTRA';
      body.ballStatus = 'WIDE';
      body.isWicket = true;
      body.runValue = 1;
    }

    if (action === 'WICKET') {
      body.event = 'WICKET';
      body.ballStatus = 'VALID';
      body.isWicket = true;
    }

    if (action === 'NO_BALL') {
      body.runValue = 1;
      body.ballStatus = 'NO_BALL';
    }

    if (action === 'BYE') {
      body.runValue = 1;
      body.ballStatus = 'BYE';
    }

    if (action === 'LEG_BYE') {
      body.runValue = 1;
      body.ballStatus = 'LEG_BYE';
    }

    if (action === 'CHANGE_BOWLER') {
      body.event = 'NEW_BALL';
      body.ballStatus = 'VALID';
    }

    if (action === 'RESET_MATCH') {
      await axios.delete('http://localhost:9000/cricket/match/reset');
    } else {
      await axios.post('http://localhost:9000/cricket/match/score', body);
    }
    await fetchMatchScore();
  };

  return (
    <div className="app">
      <div className="commentary-buttons">
        <h3>Commentary Buttons</h3>
        <div className="batsman">
          <div>
            Striker: <p>{striker.name}</p>
          </div>
          <div>
            Non-striker: <p>{nonStriker.name}</p>
          </div>
        </div>
        <div className="button-grid">
          {[
            0,
            1,
            2,
            3,
            4,
            6,
            'WICKET',
            'WIDE',
            'NO_BALL',
            'BYE',
            'LEG_BYE',
            'CHANGE_BOWLER',
            'RESET_MATCH',
          ].map((label) => (
            <button key={label} onClick={() => handleAction(label)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="team-scorecard">
        <h3>Team Scorecard</h3>
        <div>
          <p>
            {teamData.batsmanTeamName} VS {teamData.bowlersTeamName}
          </p>
          <p>
            Runs: {teamData.runs} / Wickets: {teamData.wickets}
          </p>
          <p>Balls & Overs: {teamData.overs}</p>
          <p>
            Extras: Wide: {teamData.wide}, NoBall: {teamData.noBall}, LegBye:{' '}
            {teamData.legBye}, Bye: {teamData.bye} , Overthrow:{' '}
            {teamData.overthrow}
          </p>
        </div>
      </div>

      <div className="player-scorecard">
        <h3>Player Scorecard</h3>
        <div className="batsman">
          <h4>Batsman</h4>
          {players.batsman.map((batsman, index) => (
            <p key={index}>
              Name : {batsman.playerName}, Runs - {batsman.runs}, On Strike -
              {batsman.isOnStrike ? 'Yes' : 'No'}
            </p>
          ))}
        </div>
        <div className="bowler">
          <h4>Bowler</h4>
          {players.bowler.map((bowler) => (
            <p>
              {bowler.playerName}, Runs: {bowler.runs}, Overs: {bowler.overs},
              On Bowling: {bowler.isOnBowling ? 'Yes' : 'No'}
            </p>
          ))}
        </div>
      </div>

      <div className="ball-commentary">
        <h3>Ball By Ball Commentary</h3>
        {commentary.map((comment, index) => (
          <div key={index} className="comment">
            <p>{comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
