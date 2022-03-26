import React from "react";
import _ from 'lodash'
// import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
import { Search, Grid, Header, Segment } from 'semantic-ui-react'
import { Dropdown, Menu, Icon } from 'semantic-ui-react'
import IconButton from '@mui/material/IconButton';
import SpeedIcon from '@mui/icons-material/Speed';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AddCommentIcon from '@mui/icons-material/AddComment';

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

class ToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      results: [],
      value: "",
      activeItem: null,
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

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  }

  handleAddComment = () => {

  }

  handleTrim = () => {
    
  }

  handleChangeSpeed = () => {
    
  }

  render() {
    const { loading, results, value } = this.state;
    const resRender = ({ type, keyword }) => (
      <span key="keyword">
        {type}: {keyword}
      </span>
    );
    return (
      <div className="tool-bar">
        <Menu icon='labeled' className="tool-icon">
        <Menu.Item
          name='comment'
          onClick={this.handleItemClick}>
          <AddCommentIcon style={{ fontSize: "30px" }} />
          Comment
        </Menu.Item>
        <Dropdown icon={null} trigger={<Menu.Item name='speed' onClick={this.handleItemClick}>
            <SpeedIcon style={{ fontSize: "30px" }} />
            Speed
            </Menu.Item>}>
          <Dropdown.Menu vertical>
            <Dropdown.Item text='x 0.5' />
            <Dropdown.Item text='x 1.0' />
            <Dropdown.Item text='x 1.5' />
            <Dropdown.Item text='x 2.0' />
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown icon={null} trigger={<Menu.Item name='trim' onClick={this.handleItemClick}>
            <ContentCutIcon style={{ fontSize: "30px" }} />
            Trim
            </Menu.Item>}>
          <Dropdown.Menu vertical>
            <Dropdown.Item text='Keep Start' />
            <Dropdown.Item text='Keep Middle ' />
            <Dropdown.Item text='Keep End' />
          </Dropdown.Menu>
        </Dropdown>
      </Menu>
        {/* <Search
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
        /> */}
      </div>
    );
  }
}
export default ToolBar;
