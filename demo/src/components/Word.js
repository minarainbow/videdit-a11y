import React, { Component } from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

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
    const closest_sent_start = this.props.scriptData.filter(function (sent) {
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
    const currSent = this.props.scriptData.filter(function (sent) {
      return sent.sent_index == data.sent_index;
    })[0];
    if (currSent["moving"]) {
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
        data-default-start={data.default_start}
        data-default-end={data.default_end}
        data-confidence={this.generateConfidence(data)}
        data-prev-times={this.generatePreviousTimes(data)}
        data-entity-key={data.key}
        data-playback={1.0}
        data-moving={this.checkReviewPoints(data)}
        data-type={data.type}
        data-heading={data.heading}
        now={"false"}
        trim-start={"false"}
        trim-end={"false"}
        className={"Word"}
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


export default connect((reduxState, ownProps)=>{
  return {
    ...ownProps,
    scriptData: reduxState.scriptData,
  }
})(Word);

