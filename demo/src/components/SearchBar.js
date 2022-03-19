import React from "react";
import _ from 'lodash'
// import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
import { Search, Grid, Header, Segment } from 'semantic-ui-react'

const results = [
  {
    keyword: "Socks",
    type: "visual",
  },
  {
    keyword: "Socks",
    type: "text",
  },
  {
    keyword: "Kitchen",
    type: "text",
  },
];

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      results: [],
      value: "",
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.timeoutRef = React.createRef();
    this.dispatch = this.dispatch.bind(this);
  }

  initialState = {
    loading: false,
    results: [],
    value: "",
  };

  // source = _.times(5, () => ({
  //   title: faker.company.companyName(),
  //   description: faker.company.catchPhrase(),
  //   image: faker.internet.avatar(),
  //   price: faker.finance.amount(0, 100, 2, '$'),
  // }))

  dispatch(action) {
    console.log("dispatch: ", action);
    switch (action.type) {
      case "CLEAN_QUERY":
        this.setState(this.initialState);
        return;
      case "START_SEARCH":
        this.setState({ loading: true, value: action.query });
        return;
      case "FINISH_SEARCH":
        this.setState({ loading: false, results: action.results });
        return;
      case "UPDATE_SELECTION":
        this.setState({ value: action.selection });
        return;
      default:
        throw new Error();
    }
  }

  timeoutRef = (timeoutRef) => {
    this.timeoutRef = timeoutRef;
  };

  handleSearchChange = (e, data) => {
    clearTimeout(this.timeoutRef.current);
    this.dispatch({ type: "START_SEARCH", query: data.value });

    this.timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        this.dispatch({ type: "CLEAN_QUERY" });
        return;
      }

      const re = new RegExp(_.escapeRegExp(data.value), "i");
      const isMatch = (result) => re.test(result.keyword);

      this.dispatch({
        type: "FINISH_SEARCH",
        results: _.filter(results, isMatch),
      });
    }, 300);
  };

  render() {
    const { loading, results, value } = this.state;
    const resRender = ({ type, keyword }) => (
      <span key="keyword">
        {type}: {keyword}
      </span>
    );
    return (
      <div className="search-bar">
        <Search
          fluid
          icon="search"
          placeholder="Search..."
          results={results}
          resultRenderer={resRender}
          onSearchChange={this.handleSearchChange}
          onResultSelect={(e, data) =>
            this.dispatch({
              type: "UPDATE_SELECTION",
              selection: data.result.keyword,
            })
          }
          value={value}
        />
      </div>
    );
  }
}
export default SearchBar;
