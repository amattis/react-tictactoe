import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Row( props ) {
  return (
    <div className="board-row">
      {props.children}
    </div>
  );
}

function Square( props ) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare( i ) {
    return (
      <Square
        key={`square${i}`}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const squares = [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ].map( square =>
      this.renderSquare( square ) );
    const rows = [ 0, 1, 2 ].map( row =>
      <Row
        key={`row${row}`}
        children={ squares.slice(row * 3, row * 3 + 3) }
      />
    );
    return (
      <div>{rows}</div>
    );
  }
}

class Game extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      history: [ {
        squares: Array( 9 ).fill( null )
      } ],
      stepNumber: 0,
      xIsNext: true
    }
  }

  handleClick( i ) {
    if ( this.state.historyIsReversed ) {
      const history = this.state.history.slice( this.state.stepNumber );
      const current = history[ 0 ];
      const squares = current.squares.slice();
      if ( calculateWinner( squares ) || squares[ i ] ) {
        return;
      }
      squares[ i ] = this.state.xIsNext ? 'X' : 'O';
      this.setState( {
        history: [ {
          squares: squares,
          moveIndex: i
        } ].concat( history ),
        stepNumber: 0,
        xIsNext: !this.state.xIsNext
      } );
    } else {
      const history = this.state.history.slice( 0, this.state.stepNumber + 1 );
      const current = history[ history.length - 1 ];
      const squares = current.squares.slice();
      if ( calculateWinner( squares ) || squares[ i ] ) {
        return;
      }
      squares[ i ] = this.state.xIsNext ? 'X' : 'O';
      this.setState( {
        history: history.concat( [ {
          squares: squares,
          moveIndex: i
        } ] ),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      } );
    }
  }

  handleToggleMoves() {
    const history = this.state.history;
    const reversed = this.state.historyIsReversed
    this.setState( {
      historyIsReversed: !reversed,
      history: history.reverse(),
      stepNumber: history.length - this.state.stepNumber - 1
    } )
  }

  jumpTo( step ) {
    const history = this.state.history;
    const isEvenHist = history.length % 2 === 0;
    const isEvenStep = step % 2 === 0;

    const xIsNext = ( this.state.historyIsReversed ) ?
      ( isEvenHist ) ? !isEvenStep : isEvenStep : isEvenStep;

    calculateWinner( history[ this.state.stepNumber ].squares );
    this.setState( {
      stepNumber: step,
      xIsNext: xIsNext
    } )
  }

  render() {
    const history = this.state.history;
    const current = history[ this.state.stepNumber ];
    const winner = calculateWinner( current.squares );

    const moves = history.map( ( step, move ) => {
      const loc = step.moveIndex;
      const col = loc % 3 + 1;
      const row = Math.ceil( ( loc + 1 ) / 3 );
      const count = [ ...Array( history.length ).keys() ];
      const arrCount = this.state.historyIsReversed ? count.reverse() : count

      const desc = arrCount[ move ] ?
        'Go to move #' + arrCount[ move ] + ' (' + col + ', ' + row + ')' :
        'Go to game start';
      return (
        <li key={move}>
          <button
            className={this.state.stepNumber === move ? "selected" : null}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    } );

    let status;
    if ( winner ) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + ( this.state.xIsNext ? 'X' : 'O' );
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleToggleMoves()}>Toggle</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById( 'root' )
);

function calculateWinner( squares ) {
  const lines = [
    [ 0, 1, 2 ],
    [ 3, 4, 5 ],
    [ 6, 7, 8 ],
    [ 0, 3, 6 ],
    [ 1, 4, 7 ],
    [ 2, 5, 8 ],
    [ 0, 4, 8 ],
    [ 2, 4, 6 ],
  ];
  for ( let i = 0; i < lines.length; i++ ) {
    const [ a, b, c ] = lines[ i ];
    const squaresEls = document.querySelectorAll( '.square' );
    squaresEls.forEach( ( square, sqIndex ) => {
      if ( sqIndex === a || sqIndex === b || sqIndex === c ) {
        square.classList.remove( 'winner' )
      }
    } )
    if ( squares[ a ] && squares[ a ] === squares[ b ] && squares[ a ] === squares[ c ] ) {
      squaresEls.forEach( ( square, sqIndex ) => {
        if ( sqIndex === a || sqIndex === b || sqIndex === c ) {
          square.classList.add( 'winner' )
        }
      } )
      return squares[ a ];
    }
  }
  return null;
}