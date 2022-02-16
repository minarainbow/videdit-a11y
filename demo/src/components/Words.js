import React from "react";
import { Button } from "semantic-ui-react";

class Words extends React.Component {
  render() {
    return this.props.word === "{p}" ? (
      <span> </span>
    ) : (
      <span
        className="word"
        onClick={() => this.props.handle(this.props.start)}
      >
        {this.props.word}
        <span> </span>
      </span>
    );
  }
}

export default Words;
