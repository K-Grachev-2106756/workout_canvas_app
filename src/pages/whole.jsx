import React from 'react';
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createSmartappDebugger, createAssistant } from "@salutejs/client";



const root = createRoot(document.getElementById('root'));
let globalMode = 'stopwatch';
let timeIsEnd = false;

const formatTime = (time) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

function div(val, by){
  return (val - val % by) / by;
}

const Stopwatch = () => {
  const [timerInterval, setTimerInterval] = useState(null);
  let [seconds, setSeconds] = useState(0);
  let [minutes, setMinutes] = useState(0);
  let [hours, setHours] = useState(0);

  useEffect(() => {
      return () => clearInterval(timerInterval);
  }, [timerInterval]);

  function startTimer() {
      setTimerInterval(setInterval(() => {
      setSeconds(s => {
          const newSeconds = s + 1;
          if (newSeconds >= 60) {
          setMinutes(m => {
              const newMinutes = m + Math.floor(newSeconds / 60);
              if (newMinutes >= 60) {
              setHours(h => h + Math.floor(newMinutes / 60));
              return newMinutes % 60;
              }
              return newMinutes;
          });
          return newSeconds % 60;
          }
          return newSeconds;
      });
      }, 1000));
  }

  function stopTimer() {
      clearInterval(timerInterval);
      setTimerInterval(null);
  }

  function resetTimer() {
      setSeconds(0);
      setMinutes(0);
      setHours(0);
      stopTimer();
  }

  function pad(num) {
      return num < 10 ? "0" + num : num;
  }

  return (
      <div id="main">
      <div id="time">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
      <div className="controls">
          <div><button id="start" className="button" onClick={timerInterval ? stopTimer : startTimer}>{timerInterval ? "Stop" : "Start"}</button></div>
          <div><button id="reset" className="button" onClick={resetTimer}>Reset</button></div>
      </div>
      </div>
  );
};

const TimerGym = () => {
    const [workTimeConst, setWorkTimeConst] = useState(0);
    const [chillTimeConst, setChillTimeConst] = useState(0);
    const [repToEnd, setRepToEnd] = useState(0);
    const [currentMode, setCurrentMode] = useState('WORK');
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const handleStart = () => {
        const rawWorkMin = Math.abs(parseInt(document.getElementById('min_input_work').value)) || 0;
        const rawWorkSec = Math.abs(parseInt(document.getElementById('sec_input_work').value)) || 0;
        const rawChillMin = Math.abs(parseInt(document.getElementById('min_input_chill').value)) || 0;
        const rawChillSec = Math.abs(parseInt(document.getElementById('sec_input_chill').value)) || 0;
        
        const workMin = rawWorkMin + div(rawWorkSec, 60)
        const workSec = rawWorkSec % 60
        const chillMin = rawChillMin + div(rawChillSec, 60)
        const chillSec = rawChillSec % 60
        if (workMin + workSec === 0) {
        return;
        }
        // Save the constants for later use
        setWorkTimeConst(workMin * 60 + workSec);
        setChillTimeConst(chillMin * 60 + chillSec);
        setRepToEnd(parseInt(document.getElementById('rep_input').value) || 1);
        setRepToEnd((prevRepToEnd) => prevRepToEnd);

        // Set the initial state
        setCurrentMode('WORK');
        setIsRunning(true);
        setTimeLeft(workMin * 60 + workSec);
    };
    const handleReset = () => {
        setIsRunning(false);
        setWorkTimeConst(0);
        setChillTimeConst(0);
        setRepToEnd(0);
        setCurrentMode('WORK');
        setTimeLeft(0);
    };
    const handleClear = () => {
        document.getElementById('min_input_work').value = '';
        document.getElementById('min_input_chill').value = '';
        document.getElementById('sec_input_work').value = '';
        document.getElementById('sec_input_chill').value = '';
        document.getElementById('rep_input').value = '';
    }
    useEffect(() => {
        let timer = null;
        const startWorkTimer = () => {
        setCurrentMode('WORK');
        setTimeLeft(workTimeConst);
        };

    const startChillTimer = () => {
        setCurrentMode('CHILL');
        setTimeLeft(chillTimeConst);
        };
    
    const handleTimerTick = () => {
    setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = prevTimeLeft - 1;
        if (newTimeLeft < 0) {
        if (currentMode === 'WORK') {
            if (repToEnd > 0) {
            if (repToEnd - 1 !== 0) {
                startChillTimer();
                setRepToEnd((prevRepToEnd) => prevRepToEnd - 1);
            } else {
                timeIsEnd = true;
                root.render(<Menu />)
                setIsRunning(false);
            }
            } 
        } 
        else if (currentMode === 'CHILL') {
            if (repToEnd === 0) {
            return 0
            }  
            startWorkTimer();
        }
        }
        return newTimeLeft;
    });
    };

    if (isRunning) {
    if (currentMode === 'WORK' && repToEnd === 0) {
        setIsRunning(false);
        setTimeLeft(0);
    } else {
        timer = setInterval(handleTimerTick, 1000);
    }
    }
    else {
    startWorkTimer();
    }

    return () => {
    clearInterval(timer);
    };
  }, [isRunning, currentMode, workTimeConst, chillTimeConst, repToEnd]);

  const training_with_breaks_active = <div>
      <div>
          <div id='mode'>
          {(currentMode === 'WORK') ? 'workout' : 'break'}
          </div>
          <div id = "time">{formatTime(timeLeft)}</div>
          <div id="repLeft">Repetitions left: {repToEnd}</div>
      </div>
      <div className='controls'>
          <table>
          <div><button className = "button" id = "reset" onClick={handleReset}>Reset</button></div>
          </table>
      </div>
      </div>
  const training_with_breaks_input = <div>
      <div>
          <table className="inputs">
          <tr id="time_name">
              <th colSpan={3}>workout</th>
          </tr>
          <tr>
              <td>
              <input type="number" id="min_input_work" min="0" max="59" placeholder="00" />
              </td>
              <td id="separator">:</td>
              <td>
              <input type="number" id="sec_input_work" min="0" max="59" placeholder="00" />
              </td>
          </tr>
          <tr id='space'></tr>
          <tr id="time_name">
              
              <th colSpan={3}>break</th>
          </tr>
          
          <tr>
              <td>
              <input type="number" id="min_input_chill" min="0" max="59" placeholder="00" />
              </td>
              <td id="separator">:</td>
              <td>
              <input type="number" id="sec_input_chill" min="0" max="59" placeholder="00" />
              </td>
          </tr>
          <tr id='space'></tr>
          <tr id="time_name">
              
              <th colSpan={3}>repeats</th>
          </tr>
          
          <tr >
              <td colSpan="3"><input type="number" id="rep_input" placeholder="1" /></td>
          </tr>
          </table> 
      </div>
      <div className="controls">
          <div><button id = "start" className = "button" onClick={handleStart}>Start</button></div>
          <div><button id = "reset" className = "button" onClick={handleClear}>Clear</button></div>
      </div>
      </div>

return (
  <div id="main">
  {isRunning ? (
      training_with_breaks_active
    ) : (
      training_with_breaks_input
    )}
  </div>
);
};

function setModeStopwatch() {
  globalMode = 'stopwatch';
  timeIsEnd = false;
  root.render(<Menu />);
}

function setModeTimer() {
  globalMode = 'timergym';
  timeIsEnd = false;
  root.render(<Menu />);
}

function resetTimeIsEnd() {
  timeIsEnd = false;
  root.render(<Menu />);
}

const Menu = () => {
  const menu = <div id="menu">
    <button id={globalMode === 'stopwatch' ? 'selected' : ''} onClick={setModeStopwatch}>Stopwatch</button>
    <button id={globalMode === 'timergym' ? 'selected' : ''} onClick={setModeTimer}>Crossfit</button>
  </div>

  if (globalMode === 'timergym' && timeIsEnd) {
    return (
      <>
        {menu}
        <div id='message'>Time's up</div>
        <div className="controls">
          
          <table>
            <div className='controls'><button id="reset" className="button" onClick={resetTimeIsEnd}>RESET</button></div>
          </table>
        </div>
      </>
    )
  }
  else if (globalMode === 'stopwatch') {
    return (
      <>
        {menu}
        <Stopwatch />
      </>
    );
  } else if (globalMode === 'timergym' && !timeIsEnd) {
    return (
      <>
        {menu}
        <TimerGym />
      </>
    );
  } 
};

const initializeAssistant = (getState/*: any*/) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};

export default class Whole extends React.Component {

  constructor(props) {
    super(props);
    console.log('constructor');

    this.state = {
      notes: [],
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant() );
    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event
      this.dispatchAssistantAction(action);
    });
    this.assistant.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
    });

  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  getStateForAssistant () {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      item_selector: {
        items: this.state.notes.map(
          ({ id, title }, index) => ({
            number: index + 1,
            id,
            title,
          })
        ),
      },
    };
    console.log('getStateForAssistant: state:', state)
    return state;
  }

  dispatchAssistantAction (action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        /*case 'open_crossfit':
          return this.open_crossfit(action);

        case 'open_stopwatch':
          return this.open_stopwatch(action);*/
        case 'start_stopwatch':
            TimerGym.handleStart();
            break;
        case 'open_stopwatch':
            setModeStopwatch();
            break;
        case 'open_crossfit':
            setModeTimer();
            break;
        default:
          throw new Error();
      }
    }
  }

  /*open_crossfit (action) {
    console.log('open_crossfit', action);
    this.setState(Logic.setModeTimer())
  }

  open_stopwatch (action) {
    console.log('open_stopwatch', action);
    this.setState(Logic.setModeStopwatch())
  }*/

  done_note (action) {
    console.log('done_note', action);
    this.setState({
      notes: this.state.notes.map((note) =>
        (note.id === action.id)
        ? { ...note, completed: !note.completed }
        : note
      ),
    })
  }

  render() {
    console.log('render');
    return (
      <Menu />
    )
  }
}