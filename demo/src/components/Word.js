import React, { Component } from "react";
import PropTypes from "prop-types";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned-sents.jsx";

class Word extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.decoratedText !== this.props.decoratedText) {
      return true;
    }

    return false;
  }

  generateConfidence = (data) => {
    // handling edge case where confidence score not present
    if (data.confidence) {
      return data.confidence > 0.6 ? "high" : "low";
    }

    return "high";
  };

  generatePreviousTimes = (data) => {
    const closest_sent_start = scriptData["words"].filter(function (sent) {
      return sent.sent_index == data.sent_index;
    })[0]["start"];
    let prevTimes = "";

    for (let i = 0; i < closest_sent_start; i++) {
      prevTimes += `${i} `;
    }

    if (closest_sent_start % 1 > 0) {
      // Find the closest quarter-second to the current time, for more dynamic results
      const dec = Math.floor((closest_sent_start % 1) * 4.0) / 4.0;
      prevTimes += ` ${Math.floor(closest_sent_start) + dec}`;
    }

    return prevTimes;
  };

  checkReviewPoints = (data) => {
    const currData = scriptData["words"].filter(function (word) {
      return word.index == data.index;
    })[0];
    if (currData["moving"] || currData["type"] === "pause") {
      return true;
    }
    return false;
  };

  handleClick = (index) => {
    console.log(index);
  };

  render() {
    const data = this.props.entityKey
      ? this.props.contentState.getEntity(this.props.entityKey).getData()
      : {};
    return (
      <span
        sent-index={data.sent_index}
        word-index={data.word_index}
        data-start={data.start}
        data-end={data.end}
        data-confidence={this.generateConfidence(data)}
        data-prev-times={this.generatePreviousTimes(data)}
        data-entity-key={data.key}
        data-playback={1.0}
        data-review={this.checkReviewPoints(data)}
        now={"false"}
        trim-start={"false"}
        trim-end={"false"}
        className={"Word"}
        data-moving={data.moving}
        data-type={data.type}
        data-heading={data.heading}
      >
        {this.props.children}
      </span>
    );
  }
}

Word.propTypes = {
  contentState: PropTypes.object,
  entityKey: PropTypes.string,
  children: PropTypes.array,
};

export default Word;
