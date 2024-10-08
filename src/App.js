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

  const [inputValue, setInputValue] = useState('');

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

  const handleSubmit = async (event, ruleType) => {
    event.preventDefault();

    const body = {
      event: 'EXTRA',
      runValue: 0,
      ballStatus: '',
      isWicket: false,
      newBall: false,
      batsmanId: striker.id,
      bowlerId: bowler.id,
    };
    body.runValue = Number(inputValue) + 1;

    switch (ruleType) {
      case 'wideRuns':
        body.ballStatus = 'WIDE_RUNS';
        break;
      case 'noBallByeRuns':
        body.ballStatus = 'NO_BALL_BYE_RUNS';
        break;
      case 'noBallRuns':
        body.ballStatus = 'NO_BALL_RUNS';
        break;
      case 'noBallLegByeRuns':
        body.ballStatus = 'NO_BALL_LEG_BYE_RUNS';
        break;
      case 'runsOverthrow':
        body.ballStatus = 'OVERTHROW_RUNS';
        body.runValue = body.runValue - 1;
        break;
      default:
        break;
    }
    // Clear the input after submit
    setInputValue('');
    await axios.post('http://localhost:9000/cricket/match/score', body);
    await fetchMatchScore();
  };

  // Check if input value is valid (between 0 and 6)
  const isInputValid = inputValue !== '' && parseInt(inputValue, 10) <= 6;

  return (
    <div>
      <p
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '5vh',
        }}
      >
        Cricket match admin demo app all data update automatically when on click
        button
      </p>
      <div className="app">
        <div className="commentary-buttons">
          <h3>Commentary Buttons</h3>
          <div className="batsman">
            <div>
              Striker: <p style={{ color: 'blue' }}>{striker.name}</p>
            </div>
            <div>
              Non-striker: <p style={{ color: 'blue' }}>{nonStriker.name}</p>
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
              <button
                style={{ color: 'red' }}
                key={label}
                onClick={() => handleAction(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Enter runs"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers between 0 and 6
                  if (
                    /^\d*$/.test(value) &&
                    (value === '' ||
                      (parseInt(value, 10) <= 6 && parseInt(value, 10) > 0))
                  ) {
                    setInputValue(value);
                  }
                }}
                style={{
                  width: '200px',
                  marginTop: '10px',
                }} // Space for the input
              />
            </div>

            {/* Buttons to submit the input value for different rules */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <button
                onClick={(e) => handleSubmit(e, 'wideRuns')}
                disabled={!isInputValid}
              >
                Wide + Runs
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'noBallByeRuns')}
                disabled={!isInputValid}
              >
                Noball + Bye
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'noBallRuns')}
                disabled={!isInputValid}
              >
                Noball + Runs
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'noBallLegByeRuns')}
                disabled={!isInputValid}
              >
                Noball + Legbye
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'runsOverthrow')}
                disabled={!isInputValid}
              >
                Overthrow Runs
              </button>
            </div>
          </div>
        </div>

        <div className="team-scorecard">
          <h3>Team Scorecard</h3>
          <div>
            <p style={{ color: 'blue' }}>{teamData.batsmanTeamName}</p> VS
            <p style={{ color: 'green' }}>{teamData.bowlersTeamName}</p>
            <p>
              Runs: {teamData.runs} Wickets: {teamData.wickets}
            </p>
            <p>
              Balls: {teamData.balls} Overs: {teamData.overs}
            </p>
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
              <p key={index} style={{ color: 'blue' }}>
                Name : {batsman.playerName}, Runs - {batsman.runs}, On Strike -
                {batsman.isOnStrike ? 'Yes' : 'No'}
              </p>
            ))}
          </div>
          <div className="bowler">
            <h4>Bowler</h4>
            {players.bowler.map((bowler) => (
              <p style={{ color: 'green' }}>
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
    </div>
  );
};

export default App;
